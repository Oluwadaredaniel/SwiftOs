# ARCHITECTURE.md
## SwiftyOS System Design

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         TELEGRAM                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Telegram Mini App (React)                  │   │
│  │  ┌─────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │   Wallet    │ │  Bills  │ │  Links   │ │ Savings  │  │   │
│  │  └──────┬──────┘ └────┬────┘ └────┬─────┘ └────┬─────┘  │   │
│  │         └──────────┬──────────────┴────────────┘         │   │
│  │                    │ initDataUnsafe                     │   │
│  │                    ↓                                    │   │
│  │      /api/wallet, /api/bills, /api/links, /api/savings  │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │ HTTPS                                 │
│  ┌──────────────────────┴──────────────────────────────────┐   │
│  │         @SwiftyOS_bot (Telegram Bot)                    │   │
│  │  ├─ /start (opens Mini App)                             │   │
│  │  ├─ /wallet (balance check)                             │   │
│  │  ├─ /bills (list upcoming)                              │   │
│  │  ├─ /links (list active)                                │   │
│  │  └─ /savings (show progress)                            │   │
│  └──────────────────────┬──────────────────────────────────┐   │
└──────────────────────────┼─────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│               BACKEND (Node.js + Express)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routes                                               │   │
│  │  ├─ POST /auth/telegram (validate initData HMAC)     │   │
│  │  ├─ GET /api/wallet/balances                          │   │
│  │  ├─ POST /api/wallet/convert                         │   │
│  │  ├─ GET /api/links/list                              │   │
│  │  ├─ POST /api/links/create                          │   │
│  │  ├─ POST /api/links/claim                           │   │
│  │  ├─ GET /api/savings/list                            │   │
│  │  ├─ POST /api/savings/create                         │   │
│  │  └─ POST /api/savings/rule                           │   │
│  └──────────────┬──────────────────────────────────────┘    │
│                 │                                            │
│  ┌──────────────┴──────────────────────────────────────┐    │
│  │ Services Layer                                      │    │
│  │  ├─ WalletService (balance, convert estimate)       │    │
│  │  ├─ BillService (VTpass/Flutterwave integration)    │    │
│  │  ├─ LinkService (Payment links management)          │    │
│  │  ├─ SavingsService (Automation & Goals logic)       │    │
│  │  └─ TelegramService (validate initData, user auth)  │    │
│  └──────────────┬──────────────────────────────────────┘    │
│                 │                                            │
│  ┌──────────────┴──────────────────────────────────────┐    │
│  │ Database (SQLite / Prisma ORM)                      │    │
│  │  ├─ users (telegram_id, username, created_at)       │    │
│  │  ├─ wallets (user_id, usdt_balance, usd_balance, ngn_balance) │    │
│  │  ├─ bills (user_id, type, amount, frequency)        │    │
│  │  ├─ bill_payments (bill_id, status, ref_id)         │    │
│  │  ├─ links (creator_id, amount_ngn, claim_code)      │    │
│  │  ├─ link_claims (link_id, claimer_id, paid_at)      │    │
│  │  ├─ savings_goals (user_id, target, saved_amount)   │    │
│  │  └─ savings_rules (goal_id, type, value)            │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Smart Wallet

```
User opens /wallet
  ↓
Frontend calls GET /api/wallet/balance
  ↓
Backend (with Telegram ID):
  - Looks up user wallet in DB
  - Gets USDT balance
  - Calls live rate API (mock: ₦1,348/USDT)
  - Calculates NGN equivalent
  ↓
Returns:
{
  "usdt_balance": 10000,
  "ngn_equivalent": 13480000,
  "rate": 1348,
  "last_updated": "2026-06-06T10:30:00Z"
}
  ↓
Frontend renders:
┌─────────────────────┐
│ 10,000 USDT         │
│ ≈ ₦13.4M            │
│ [Convert] [Send]    │
└─────────────────────┘
```

**Convert Flow:**
```
User taps "Convert" → Input "₦5,000" → Backend calculates USDT needed
  → Returns estimate: "₦5,000 = ~3.7 USDT"
  → User confirms → Balance updated in state
  → Shows confirmation: "✅ Converted ₦5,000 to USDT"
```

---

## Data Flow: AutoBills

```
User taps "Add Bill"
  ↓
Selects provider: MTN Data
Enters amount: ₦1,000
Selects frequency: Weekly
  ↓
Frontend calculates USDT cost:
  ₦1,000 ÷ 1,348 rate = ~0.74 USDT
  Shows: "This will cost ~0.74 USDT weekly"
  ↓
User confirms
  ↓
POST /api/bills/create
{
  "user_id": "telegram_123456",
  "provider": "mtnn_data",
  "amount_ngn": 1000,
  "amount_usdt": 0.74,
  "frequency": "weekly",
  "next_payment": "2026-06-13T00:00:00Z"
}
  ↓
Backend:
  - Stores bill in DB
  - Creates bill_payment record (scheduled)
  - Returns bill_id + confirmation
  ↓
Frontend renders in "Upcoming Bills":
┌─────────────────────────────┐
│ 📱 MTN Data                  │
│ ₦1,000 | Weekly              │
│ Next: June 13                │
│ [Pay Now] [Delete]           │
└─────────────────────────────┘
```

**Payment Flow:**
```
User taps "Pay Now"
  ↓
Frontend shows confirmation modal:
  "Confirm: Pay ₦1,000 USDT for MTN Data?"
  ↓
User confirms
  ↓
POST /api/bills/pay
{
  "bill_id": "bill_xyz123",
  "amount_ngn": 1000,
  "amount_usdt": 0.74
}
  ↓
Backend:
  - Checks wallet balance (must have 0.74 USDT)
  - Deducts from wallet
  - Creates bill_payment record
  - Returns confirmation
  ↓
Frontend:
  - Updates balance immediately
  - Shows ✅ "Payment sent to MTN"
  - Removes bill from upcoming (or marks "Paid")
```

---

## Bill Payment & Auto-Conversion Logic

### Bill Payment Strategy
We will integrate with **VTpass** or **Flutterwave Bills API** to handle real Nigerian utility payments.
- **Provider Selection:** Users select from a list (MTN, Airtel, Glo, 9mobile, DSTV, GOTV, Startimes).
- **Validation:** For TV subscriptions, we call the provider's `/lookup` endpoint to verify the Smartcard ID before payment.
- **Execution:** Once the user confirms in the Mini App, the backend triggers the bill payment.

### Auto-Conversion Mechanism
Since users hold USDT but bills are paid in NGN, we use a real-time conversion engine:
1. **Rate Fetching:** Backend fetches the latest USDT/NGN rate from a reliable source (e.g., Binance P2P or a local aggregator like Currencylayer).
2. **Buffer:** We apply a **1-2% volatility buffer** to the rate to ensure the payment goes through even if the rate fluctuates during the transaction.
3. **Calculation:** `Amount_USDT = (Amount_NGN / Current_Rate) * (1 + Buffer)`.
4. **Execution:**
   - Deduct `Amount_USDT` from user wallet.
   - Execute bill payment via API in NGN.
   - Log the transaction with the rate used.

---

## Data Flow: Swifty Links

```
User taps "Create Link"
  ↓
Enters amount: ₦5,000
Optional: Sets a specific recipient username
  ↓
User confirms
  ↓
POST /api/links/create
{
  "creator_id": "telegram_9876543",
  "amount_ngn": 5000,
  "recipient_username": "@friend_user"
}
  ↓
Backend:
  - Deducts ₦5,000 USDT equivalent from creator's wallet
  - Creates link record with a unique `claim_code`
  - Returns link: `https://t.me/SwiftyOS_bot?start=claim_abc123`
  ↓
Frontend:
  - Shows "Copy Link" button
  - User shares link in Telegram chat
  ↓

Friend receives link → Clicks → Opens SwiftyOS Bot
  ↓
Bot processes `/start claim_abc123` → Opens Mini App to Claim Screen
  ↓
GET /api/links/claim/abc123
  ↓
Backend returns:
{
  "link_id": "abc123",
  "creator": "@host_user",
  "amount_ngn": 5000,
  "status": "active"
}
  ↓
Friend taps "Claim Now"
  ↓
POST /api/links/claim
{
  "link_id": "abc123",
  "claimer_id": "friend_id"
}
  ↓
Backend:
  - Adds ₦5,000 USDT equivalent to friend's wallet
  - Marks link as "claimed"
  - Notifies creator: "✅ @friend_user claimed your ₦5,000 link"
  ↓
Frontend shows: ✅ "₦5,000 added to your wallet!"
```

---

## Security: Telegram initData Validation

Every request from the Mini App includes Telegram's `initData` (HMAC-signed).

```ts
// Example initData from Telegram.WebApp
const initData = "query_id=...&user=%7B%22id%22%3A123456%7D&..."

// On backend, validate before processing:
const isValid = validateTelegramInitData(initData, BOT_TOKEN);

if (!isValid) {
  return res.status(401).json({ error: 'Invalid initData' });
}

// If valid, extract user ID:
const userData = extractUserFromInitData(initData);
const telegramId = userData.id; // Safe to use
```

All API calls are scoped to the authenticated user.

---

## Database Schema (Prisma)

```prisma
model User {
  id        Int       @id @default(autoincrement())
  telegram_id BigInt  @unique
  username  String?
  first_name String?
  photo_url String?
  created_at DateTime @default(now())
  
  wallet    Wallet?
  bills     Bill[]
  bill_payments BillPayment[]
  links_created SwiftyLink[] @relation("Creator")
  links_claimed SwiftyLink[] @relation("Claimer")
}

model Wallet {
  id           Int       @id @default(autoincrement())
  user_id      Int       @unique
  user         User      @relation(fields: [user_id], references: [id])
  usdt_balance Decimal   @default(0)
  usdt_address String?   // Real blockchain address from SwiftyEx
  usd_balance  Decimal   @default(0)
  ngn_balance  Decimal   @default(0)
  updated_at   DateTime  @updatedAt
}

model Bill {
  id        Int       @id @default(autoincrement())
  user_id   Int
  user      User      @relation(fields: [user_id], references: [id])
  provider  String    // "mtnn_data", "dstv", "gotv", etc.
  amount_ngn Decimal
  amount_usdt Decimal
  frequency String    // "once", "weekly", "monthly"
  next_payment DateTime
  created_at DateTime @default(now())
  
  payments  BillPayment[]
}

model BillPayment {
  id        Int       @id @default(autoincrement())
  user_id   Int
  user      User      @relation(fields: [user_id], references: [id])
  bill_id   Int
  bill      Bill      @relation(fields: [bill_id], references: [id])
  amount_ngn Decimal
  amount_usdt Decimal
  status     String    // "pending", "success", "failed"
  reference  String    @unique
  paid_at    DateTime @default(now())
}

model SwiftyLink {
  id        Int       @id @default(autoincrement())
  creator_id Int
  creator   User      @relation("Creator", fields: [creator_id], references: [id])
  claimer_id Int?
  claimer   User?     @relation("Claimer", fields: [claimer_id], references: [id])
  amount_ngn Decimal
  amount_usdt Decimal
  claim_code String   @unique
  status     String   @default("active") // "active", "claimed", "expired"
  created_at DateTime @default(now())
  claimed_at DateTime?
}

model SavingsGoal {
  id            Int       @id @default(autoincrement())
  user_id       Int
  user          User      @relation(fields: [user_id], references: [id])
  title         String
  target_amount Decimal
  saved_amount  Decimal   @default(0)
  currency      String    @default("NGN")
  status        String    @default("active")
  created_at    DateTime  @default(now())
  
  rules         SavingsRule[]
}

model SavingsRule {
  id        Int         @id @default(autoincrement())
  goal_id   Int
  goal      SavingsGoal @relation(fields: [goal_id], references: [id])
  type      String      // "roundup", "weekly", "percentage"
  value     Decimal?    // e.g. 5000 for weekly
  active    Boolean     @default(true)
}
```

---

## API Endpoints (MVP)

### Authentication
```
POST /auth/telegram
Body: { initData: "..." }
Returns: { user_id, is_authenticated }
```

### Wallet
```
GET /api/wallet/balances
  Returns: { usdt_balance, usdt_address, usd_balance, ngn_balance, rates: { ... } }

POST /api/wallet/create-address
  Purpose: Triggers address generation via SwiftyEx
  Returns: { usdt_address }
```

### Bills
```
GET /api/bills/list
  Returns: [] of user's bills

POST /api/bills/create
  Body: { provider, amount_ngn, frequency }
  Returns: { bill_id, next_payment }

POST /api/bills/pay
  Body: { bill_id }
  Returns: { success, new_balance }

GET /api/bills/upcoming
  Returns: [] of bills due in next 30 days
```

### Links
```
GET /api/links/list
  Returns: [] of user's created and claimed links

POST /api/links/create
  Body: { amount_ngn }
  Returns: { link_id, claim_code, url }

POST /api/links/claim
  Body: { claim_code }
  Returns: { success, amount_ngn, new_balance }

GET /api/links/details/:claim_code
  Returns: { creator, amount_ngn, status }
```

### Savings
```
GET /api/savings/list
  Returns: [] of user's savings goals

POST /api/savings/create
  Body: { title, target_amount }
  Returns: { goal_id }

POST /api/savings/rule/add
  Body: { goal_id, type, value }
  Returns: { success }
```

### Bot
```
POST /webhook
  Telegram Update → Route to handlers
  /start → Open Mini App
  /start claim_<code_> → Open Mini App at Claim Link screen
  /wallet → Quick balance
  /bills → List upcoming
  /links → List active
  /savings → Progress summary
```

---

## Mock vs Real API

**MVP uses MOCK data.** When SwiftyEx API is available:

### Swap Layer
```ts
// src/services/api.ts
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

export const walletAPI = USE_MOCK 
  ? mockWalletAPI 
  : realWalletAPI;
```

### To Enable Real API
1. Set `USE_MOCK=false` in `.env`
2. Provide SwiftyEx API credentials
3. Implementation stays the same; just swap imports

---

## Error Handling

All API endpoints return:
- `2xx` on success
- `400` on bad request (validation)
- `401` on auth failure (invalid initData)
- `404` on not found
- `500` on server error

Frontend wraps all calls in try-catch and shows user-friendly errors:
```
❌ "Payment failed. Check your balance."
❌ "Bill already paid."
❌ "Network error. Try again."
```

---

## Performance Targets

- Mini App load: <2s
- Balance fetch: <500ms (cached)
- Payment confirmation: <1s
- Zero layout shift during loading
- Smooth 60fps animations on mobile

---

## Deployment Architecture

```
GitHub → Vercel → https://swiftyos.vercel.app (Mini App + API Routes)
      → Railway → https://api.swiftyos.railway.app (Backend)
      → SQLite (local) → PlanetScale (production)
```