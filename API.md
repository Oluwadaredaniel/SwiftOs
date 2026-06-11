# SwiftyOS — API Reference
> Base URL (local): `http://localhost:8000`
> Base URL (prod): set to your Render URL

All protected routes require: `Authorization: Bearer <jwt_token>`

---

## Authentication

### POST `/api/auth/telegram`
Login via Telegram initData.

**Headers:** `X-Telegram-Init-Data: <raw initData string>` OR send in body.

**Body:**
```json
{ "initData": "query_id=...&user=...&hash=..." }
```
**Response:**
```json
{
  "success": true,
  "token": "eyJ...",
  "user": { "id": "123456789", "username": "davedev", "first_name": "Dave" }
}
```

---

## Wallet

### GET `/api/wallet/balances` 🔒
Live balances + deposit address + current rates.
```json
{
  "status": "success",
  "data": {
    "ngn": 250500.00,
    "usdt": 45.50,
    "usd": 0,
    "usdt_address": "0x71C765...d897",
    "rates": { "usdt_ngn": 1620.00, "usd_ngn": 1620.00 }
  }
}
```

### POST `/api/wallet/fund` 🔒
Top up wallet (dev/demo use).
```json
{ "amount": 100, "currency": "USDT" }
```

### POST `/api/wallet/transfer` 🔒
Send to another user by their MongoDB `_id`.
```json
{ "toUserId": "664abc...", "amount": 10, "currency": "USDT", "description": "Lunch" }
```

### POST `/api/wallet/convert` 🔒
Convert between USDT and NGN at live rate.
```json
{ "from": "USDT", "to": "NGN", "amount": 10 }
```
**Response:**
```json
{ "status": "success", "data": { "converted": 16200, "rate": 1620, "wallet": { ... } } }
```

---

## Transactions

### GET `/api/transactions/list?limit=20` 🔒
Paginated transaction history.
```json
{
  "status": "success",
  "data": [
    {
      "id": "664...",
      "type": "bill",
      "amount": 5000,
      "currency": "NGN",
      "description": "Bill payment: mtn — 1000 NGN",
      "timestamp": "2026-06-11T10:30:00Z",
      "status": "completed"
    }
  ]
}
```
**`type` values:** `transfer` · `receive` · `fund` · `split` · `autobill` · `convert`

---

## Bills

### GET `/api/bills/providers?category=data`
List VTpass providers. No auth needed.
**`category` values:** `data` · `airtime` · `tv-subscription` · `electricity-bill`

### GET `/api/bills/variations?serviceID=mtn-data`
List plans/bundles for a provider. No auth needed.

### POST `/api/bills/pay` 🔒
Pay a bill. Deducts USDT at live rate + 2% buffer.
```json
{
  "serviceID": "mtn-data",
  "amount": 1000,
  "phone": "08011111111",
  "variation_code": "mtn-100mb-1000"
}
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "vtpass": { ... },
    "usdtCharged": 0.6375,
    "ngnAmount": 1000,
    "rate": 1620
  }
}
```

### POST `/api/bills/verify-meter` 🔒
Verify electricity meter before payment.
```json
{ "provider": "EKEDC", "meterNumber": "1234567890", "variationCode": "prepaid" }
```

---

## AutoBills

### POST `/api/autobills` 🔒
Schedule a recurring bill.
```json
{
  "type": "Data",
  "provider": "MTN",
  "amount": 1000,
  "currency": "NGN",
  "frequency": "weekly",
  "billersCode": "08011111111",
  "variationCode": "mtn-100mb-1000"
}
```
**`type`:** `Airtime` · `Data` · `Electricity`
**`frequency`:** `daily` · `weekly` · `monthly`
**`billersCode`:** phone number for airtime/data · meter number for electricity

### GET `/api/autobills` 🔒
List all active recurring bills.

### DELETE `/api/autobills/:id` 🔒
Delete a recurring bill.

---

## Savings Vaults

> Deposits lock the exact NGN amount at the time of saving. You save ₦1,500 today — you withdraw ₦1,500, regardless of what happens to exchange rates. The vault is a discipline tool, not a speculation vehicle. (Interest/yield is a future feature.)

### GET `/api/savings/list` 🔒
```json
{
  "status": "success",
  "data": [
    {
      "id": "664...",
      "title": "New Laptop",
      "targetAmount": 850000,
      "currentAmount": 425000,
      "currency": "NGN",
      "category": "Electronics",
      "isCompleted": false,
      "createdAt": "2026-06-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/savings` 🔒
Create a savings goal.
```json
{
  "name": "New Laptop",
  "targetAmount": 850000,
  "currency": "NGN",
  "category": "Electronics",
  "deadline": "2026-12-01"
}
```
**`category`:** `Electronics` · `Security` · `Business` · `Personal` · `Travel`

### POST `/api/savings/:id/deposit` 🔒
```json
{ "amount": 50000 }
```
Amount is NGN — deducted from NGN wallet, stored as-is.

### POST `/api/savings/:id/withdraw` 🔒
```json
{ "amount": 50000 }
```
Amount is NGN — returned directly to NGN wallet. You get back exactly what you saved.

### DELETE `/api/savings/:id` 🔒
Deletes goal. Any remaining NGN balance is refunded to wallet.

---

## Swifty Links

### POST `/api/links` 🔒
Create an escrow payment link. USDT equivalent is locked immediately.
```json
{ "amount": 5000, "currency": "NGN", "note": "Lunch money" }
```
**Response:**
```json
{
  "status": "success",
  "data": { "token": "a1b2c3...", "amount": 5000, "expiresAt": "2026-06-12T10:00:00Z" }
}
```

### GET `/api/links/list` 🔒
```json
{
  "status": "success",
  "data": [
    {
      "id": "664...",
      "amount": 5000,
      "currency": "NGN",
      "token": "a1b2c3...",
      "status": "active",
      "note": "Lunch money",
      "expiryDate": "2026-06-12T10:00:00Z"
    }
  ]
}
```

### POST `/api/links/:token/claim` 🔒
Claim a link. Transfers funds to authenticated user's wallet.

---

## Split Pay

### POST `/api/splitpay` 🔒
Create a split.
```json
{
  "totalAmount": 20000,
  "currency": "NGN",
  "description": "Dinner",
  "participants": [
    { "userId": "664abc...", "amount": 10000 },
    { "userId": "664def...", "amount": 10000 }
  ]
}
```

### GET `/api/splitpay/:id` 🔒
Get split details and participant status.

### POST `/api/splitpay/:id/pay` 🔒
Pay your share of a split.

---

## AI Assistant

### POST `/api/ai/ask` 🔒
Natural language → structured action.
```json
{ "text": "Buy MTN data every Friday for 3000 NGN" }
```
**Response:**
```json
{
  "action": "CREATE_AUTOBILL",
  "type": "Data",
  "provider": "MTN",
  "amount": 3000,
  "frequency": "weekly"
}
```
**`action` values:** `CREATE_AUTOBILL` · `SPLIT_PAY` · `CONVERT_CURRENCY` · `SEND_MONEY`

---

## Dev / Demo

### POST `/api/dev/fund` 🔒
Fund a wallet with fake balance for testing.
```json
{ "amount": 100, "currency": "USDT" }
```

---

## Error Format
All errors return:
```json
{ "status": "error", "message": "Human-readable reason" }
```

## Sandbox Notes
- VTpass test phone (airtime/data): `08011111111`
- VTpass test DSTV smartcard: `1212121212`
- Telegram auth hash verification is active — use real `initData` from the Mini App
