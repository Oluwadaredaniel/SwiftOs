# BACKEND_INSTRUCTIONS.md
## For the Backend Developer

Your goal is to build the "Invisible Infrastructure." You handle the currency math, the security, and the external API routing.

---

## 1. Project Setup
- **Framework:** Node.js + Express.js.
- **ORM:** Prisma (with SQLite for the hackathon).
- **Bot:** `grammY` (for handling `/start` and claim links).
- **Security:** Validate the `initData` HMAC on every request (refer to `ARCHITECTURE.md`).

---

## 2. Core Service Responsibilities

### A. Wallet & Rates Service
- Fetch live USDT/NGN rates (mocked at 1348/1430 for now).
- Apply the **Buy/Sell Spread** correctly (refer to `IMPLEMENTATION_LOGIC.md`).
- Handle the **Rate Lock** (Store the generated quote in cache for 60s).

### B. Bill Payment Service (The Proxy)
- You are a bridge between the Frontend and **VTpass**.
- **Endpoints:**
  - `GET /api/bills/providers`: Proxies VTpass to get service categories.
  - `GET /api/bills/variations`: Proxies VTpass to get plans for a specific network.
  - `POST /api/bills/pay`: This is the **Atomic Transaction**.
    - 1. Debit User USDT Wallet.
    - 2. Call VTpass API.
    - **Sandbox/Demo Trick:** If `NODE_ENV !== 'production'`, force the recipient phone number to `08011111111` to ensure a "Success" response from VTpass Sandbox, regardless of what the user types in the UI.
    - 3. If fail, **REFUND** USDT immediately.

### C. Swifty Link Service (The Escrow)
- When a user creates a link for ₦5,000:
  - Calculate USDT cost.
  - **Debit** the user immediately.
  - Create a `claim_code` in the DB.
- When someone claims the code:
  - Verify it’s not expired.
  - **Credit** the claimer's USDT wallet.

### D. Savings & Automation (The Cron)
- You need a background job (or a simple interval) to handle:
  - **Weekly Deposits:** Every Monday, check `SavingsRules` and transfer funds.
  - **Round-ups:** After a successful `bill_payment`, calculate the "change" and move it to the user's `SavingsGoal`.

---

## 3. Critical Security Checklist
- [ ] **InitData Validation:** Reject any request that doesn't have a valid Telegram signature.
- [ ] **Balance Checks:** Never allow a bill payment or link creation if `usdt_balance < cost`.
- [ ] **Rounding:** Always round USDT calculations **UP** to the nearest 2 decimal places to ensure the platform doesn't lose dust.

---

## 4. Key References
- **System Design:** `ARCHITECTURE.md`
- **External APIs:** `API_INTEGRATION.md`
- **Conversion Math:** `IMPLEMENTATION_LOGIC.md`
