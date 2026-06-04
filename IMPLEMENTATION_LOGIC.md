# IMPLEMENTATION_LOGIC.md
## The "Brain" of SwiftyOS: Auto-Conversion & Bill Payments

This document serves as the master guide for both **Frontend** and **Backend** developers to ensure the financial logic is robust, safe, and "pitch-ready" for judges.

---

## 1. The Auto-Conversion Engine (The "Heart")

SwiftyOS is built on the principle of a **Triple-Wallet Pocket System**:
1. **NGN Wallet:** Local spending, bills, bank transfers.
2. **USD Wallet:** Stable savings, protection from devaluation.
3. **USDT Wallet:** Global crypto access, Swifty Links, high-speed transfers.

### The Conversion Matrix
- **NGN ↔ USD:** Standard fintech rate (Locked for 60s).
- **USD ↔ USDT:** 1:1 Peg (minus a small 0.5% swap fee).
- **NGN ↔ USDT:** Market rate (Locked for 60s).

### The Formula
`USDT_Amount = (NGN_Amount / Current_Rate) * (1 + Buffer)`

---

## 2. Bill Payment Workflow (Step-by-Step)

To make it easy for both devs, follow this 5-step sequence:

### Step 1: Service Discovery (Frontend)
Frontend calls Backend to get "What can I pay for?".
- **API:** `GET /api/bills/providers`
- **Logic:** Backend proxies VTpass to get a list of Networks (MTN, Airtel) and Categories (Data, Airtime, TV).

### Step 2: Plan Selection (Frontend)
Once a user picks "MTN Data", the Frontend fetches specific plans.
- **API:** `GET /api/bills/variations?serviceID=mtn-data`
- **Logic:** Backend returns list: `[ { "code": "1gb", "name": "1GB - 1 Day", "amount": 300 }, ... ]`

### Step 3: The Quote / Rate Lock (Backend & Frontend)
Before paying, the user sees a "Confirmation Modal".
- **Backend:** Fetches the latest SELL rate from SwiftyEx (e.g., 1348).
- **Frontend:** Displays: *"This ₦300 plan will cost ~0.22 USDT. Rate locked for 60s."*
- **The Timer:** Frontend runs a 60s countdown. If it hits 0, the user must "Refresh Quote".

### Step 4: Atomic Execution (Backend) - **CRITICAL**
When the user clicks "Confirm & Pay", the Backend must perform these in order:
1. **Validation:** Re-check that the rate hasn't expired.
2. **Balance Check:** Check if user has enough USDT in their SwiftyEx wallet.
3. **The Lock (Debit):** Immediately deduct the calculated USDT from the user's wallet.
4. **The Utility Call:** Call the VTpass API to deliver the ₦300 Data.
5. **Finalize:** 
   - **On Success:** Log the transaction as `SUCCESS`.
   - **On Failure:** Immediately **Refund** the USDT to the user and show an error.

---

## 3. Volatility & Risk Management

How we protect the platform and the user:

| Feature | Logic | Why? |
| :--- | :--- | :--- |
| **Slippage Buffer** | Add 1.5% - 2% to the USDT calculation. | Protects the platform if the rate drops between the user clicking "Pay" and the API executing. |
| **Rate Locking** | quote expires after 60 seconds. | Prevents "Arbitrage" (users waiting for the market to move in their favor). |
| **Stablecoin Base** | Savings are always stored in USDT. | Protects the user from Naira devaluation. ₦1,000 saved today is 0.70 USDT today, and still 0.70 USDT next year. |

---

## 4. Savings Logic (The "Round-Up")

This is a key "Super App" feature.
1. User pays a bill for **₦1,800**.
2. SwiftyOS rounds to the nearest ₦1,000 (i.e., **₦2,000**).
3. The **₦200** "change" is taken from the user's wallet, converted to USDT at the **BUY Rate**, and moved to their **Savings Goal**.
4. **Pitch:** *"Passive wealth building. You save while you spend."*

---

## 5. The Judge's Pitch (How to sell this)

When asked about technical execution or volatility, use these phrases:

- **"Stablecoin Shield":** "We protect our users' purchasing power by holding all savings in USDT, shielding them from the 30%+ annual Naira inflation."
- **"Atomic Settlements":** "Our backend ensures that bill payments are atomic—funds are only permanently moved once the utility provider confirms delivery."
- **"Invisible Infrastructure":** "The user sees Naira and Emojis; the backend handles the complex USDT-to-fiat routing through SwiftyEx and VTpass."
- **"The Spread Advantage":** "By using a dynamic Buy/Sell spread, we ensure the platform remains sustainable while providing lower fees than traditional banks."

---

## 6. Developer "Bridge" Checklist

### For Frontend Dev:
- [ ] Implement a `CountdownTimer` component for the 60s Rate Lock.
- [ ] Ensure all amount inputs (NGN) show a "≈ 0.00 USDT" helper text in real-time.
- [ ] Build a "Success Confetti" component for when a bill is paid.

### For Backend Dev:
- [ ] Create a `ConversionService` that takes `ngnAmount` and returns `usdtCost`.
- [ ] Implement the `payBill` logic as a Try-Catch block with a **Refund** in the catch.
- [ ] Set up a Cron Job for "Weekly Savings" deposits.
