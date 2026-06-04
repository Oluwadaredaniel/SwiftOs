# API_INTEGRATION.md
## Core Infrastructure & Third-Party Services

This document details how to implement the most critical parts of SwiftyOS: real bill payments and the crypto-to-fiat auto-conversion engine.

---

## 1. VTpass Integration (Utility Gateway)

**Environments:**
- **Sandbox:** `https://sandbox.vtpass.com/api/` (Use for development/testing)
- **Live:** `https://vtpass.com/api/`

**Credentials (Sandbox):**
- **API Key:** `9b834e549ed0ffc2c0cdc600d39e2af2`
- **Public Key:** `PK_64346b752fad2414aac626fbd54a7ef038cda58b3e4`
- **Secret Key:** `SK_237dc40af577709e1ad0408a1eff2b0521334dcef74`

**Authentication:**
All requests require headers:
```
api-key: 9b834e549ed0ffc2c0cdc600d39e2af2
public-key: PK_64346b752fad2414aac626fbd54a7ef038cda58b3e4
```

### Flow A: Service Discovery (Populating UI)
1. **Get Categories:** `GET /service-categories`
2. **Get Services (e.g. Data):** `GET /services?identifier=data` (Returns MTN, Airtel, etc.)
3. **Get Variations (Plans):** `GET /service-variations?serviceID=mtn-data`
   - *Returns:* `variation_code`, `name`, `variation_amount`.

### Flow B: Airtime & Data (Instant Purchase)
- **Endpoint:** `POST /pay`
- **Sandbox Testing:** Use phone number `08011111111` to simulate a successful transaction in the Sandbox environment. In production, use the actual recipient's number.
- **Request ID Format:** `YYYYMMDDHHMM[unique_string]`

#### 1. Airtime Recharge
- **ServiceIDs:** `mtn`, `glo`, `airtel`, `etisalat`
- **Payload Example:**
```json
{
  "request_id": "2025031013373710241",
  "serviceID": "mtn",
  "amount": 500,
  "phone": "RECIPIENT_PHONE_NUMBER"
}
```

#### 2. Data Subscription
- **ServiceIDs:** `mtn-data`, `glo-data`, `airtel-data`, `etisalat-data`, `glo-sme-data`
- **Payload Example:**
```json
{
  "request_id": "2025031010323857076",
  "serviceID": "mtn-data",
  "billersCode": "RECIPIENT_PHONE_NUMBER",
  "variation_code": "mtn-100mb-1000",
  "phone": "CUSTOMER_PHONE_NUMBER"
}
```
*Note: `billersCode` is the recipient number. `variation_code` is fetched from Flow A.*

### Flow C: TV Subscription (Lookup First)
1. **Verify Smartcard:** `POST /merchant-verify`
   - **Body:** `{ "billersCode": "1212121212", "serviceID": "dstv" }` (Use `dstv`, `gotv`, or `startimes`)
2. **Execute Pay:** `POST /pay`
   - **ServiceIDs:** `dstv`, `gotv`, `startimes`
   - **Payload Example (Bouquet Change):**
```json
{
  "request_id": "2025031011029125930",
  "serviceID": "dstv",
  "billersCode": "1212121212",
  "variation_code": "dstv-padi",
  "amount": 1850,
  "phone": "CUSTOMER_PHONE_NUMBER",
  "subscription_type": "change",
  "quantity": 1
}
```
*Note: For renewal of current bouquet, use `subscription_type: "renew"` and the amount returned from verification.*

### Flow D: Query Transaction Status
If a transaction returns "Pending" or you need to verify a previous payment.
- **Endpoint:** `POST /requery`
- **Payload:** `{ "request_id": "YOUR_PREVIOUS_REQUEST_ID" }`

### Sample Implementation (Backend Service)
```ts
async function payBill(provider, amount, recipient, variationCode = null) {
  const requestId = generateRequestId(); // Format: YYYYMMDDHHII[unique]
  const response = await fetch('https://api-service.vtpass.com/api/pay', {
    method: 'POST',
    body: JSON.stringify({
      request_id: requestId,
      serviceID: provider, // e.g., 'dstv', 'abuja-electric'
      amount: amount,
      phone: recipient,
      variation_code: variationCode, // for data/tv plans
    })
  });
  return response.json();
}
```

---

## 2. Auto-Conversion Engine

Since users hold **USDT** but VTpass requires **NGN**, we must calculate the exact USDT cost in real-time.

### The Formula
`USDT_Cost = (NGN_Amount / Live_Rate) * (1 + Buffer)`

- **Live Rate:** Fetch from Binance P2P or local exchange.
- **Buffer (2%):** Protects against price slippage and network fees.

### Rate Service Logic
```ts
async function getLiveRate() {
  // Mocking ₦1,348 for hackathon, but should call an API
  const baseRate = 1348; 
  return baseRate;
}

async function calculateUSDT(ngnAmount) {
  const rate = await getLiveRate();
  const buffer = 0.02; // 2%
  const usdtNeeded = (ngnAmount / rate) * (1 + buffer);
  return {
    usdt: parseFloat(usdtNeeded.toFixed(2)),
    rate: rate,
    bufferApplied: buffer
  };
}
```

### Transaction Execution Steps (Atomic)
1. User requests payment (NGN).
2. Backend calculates USDT cost.
3. Backend checks user's USDT balance.
4. **Lock funds:** Deduct USDT from User Wallet.
5. **Execute:** Call VTpass API with NGN.
6. **Finalize:** 
   - If VTpass succeeds: Log transaction as `SUCCESS`.
   - If VTpass fails: Refund USDT to user, log as `FAILED`.

---

## 3. Swifty Links Logic

Swifty Links are "Escrow-style" payment links.

### Creation
1. User wants to send ₦5,000.
2. Backend calculates USDT cost (e.g., 3.8 USDT).
3. **Funds are deducted immediately** from the creator and held in a system "Escrow" state.
4. A unique `claim_code` is generated.

### Claiming
1. Recipient opens the link.
2. Backend checks if `claim_code` is active.
3. If active, add the USDT amount to the recipient's wallet.
4. Mark link as `CLAIMED`.

### Expiry/Refund
- If link isn't claimed within 24 hours, the backend automatically refunds the USDT to the creator.

## 4. Savings & Automation Rules

### Round-up Logic
1. User pays a bill (e.g., ₦1,800).
2. If "Round-up" is ON:
   - System rounds to nearest ₦1,000 (i.e., ₦2,000).
   - "Change" = ₦200.
   - Convert ₦200 to USDT using the current rate.
   - Deduct total (₦1,800 + ₦200) from Wallet.
   - Move ₦200 USDT to `SavingsGoal` balance.

### Weekly/Monthly Automation
- Use a **Cron Job** (e.g., Vercel Cron or a background worker on Railway).
- Every Monday at 00:00:
  - Fetch all active `SavingsRule` where `type = 'weekly'`.
  - Execute conversion and transfer from Wallet to Savings.

---

## 5. Receipts & Transaction Records

Every successful bill payment returns a detailed transaction object. 

### Data to Store for Receipts:
- `transactionId`: The VTpass reference.
- `requestId`: Your internal reference.
- `amount`: NGN amount paid.
- `transaction_date`: Timestamp.
- `product_name`: e.g., "MTN Data".
- `unique_element`: The phone number or meter number recharged.

### Frontend Receipt UI:
After a successful payment, the frontend should display a "Transaction Success" screen that functions as a digital receipt, showing the details above and a "Share Receipt" button (using the Telegram `share` functionality).

---

## 6. Environment Variables Needed

```
# Backend (.env)
VTPASS_API_KEY=9b834e549ed0ffc2c0cdc600d39e2af2
VTPASS_PUBLIC_KEY=PK_64346b752fad2414aac626fbd54a7ef038cda58b3e4
VTPASS_SECRET_KEY=SK_237dc40af577709e1ad0408a1eff2b0521334dcef74
DATABASE_URL="file:./dev.db"
TELEGRAM_BOT_TOKEN=...
JWT_SECRET=...

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_TELEGRAM_BOT_USER=@SwiftyOS_bot
```

---

## 7. Security Best Practices

1. **Idempotency:** Always use a unique `request_id` for bill payments to prevent double-charging if a network request is retried.
2. **Rate Limiting:** Limit bill payment attempts to 3 per minute per user.
3. **Rounding:** Always round USDT UP to the nearest 0.01 to ensure you never undercharge.
4. **Validation:** Never trust the `amount` sent from the frontend. Re-calculate the USDT cost on the backend based on the `ngnAmount`.
