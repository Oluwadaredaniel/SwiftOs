# PRODUCT_SPECIFICATION.md
## SwiftyOS: Technical Deep-Dive & Feature Set

This document provides a comprehensive overview of SwiftyOS features, the technical implementation logic, and the strategic vision behind our architectural choices. This is intended for both the development team and the hackathon judging panel.

---

## 1. Executive Summary
**SwiftyOS** is a Telegram-Native Financial Operating System. While traditional crypto apps focus on trading and speculation, SwiftyOS focuses on **Utility, Automation, and Social Finance**. We use Stablecoins (USDT) as invisible infrastructure to shield African users from 30%+ annual fiat inflation while providing a familiar, Naira-denominated user experience.

---

## 2. Core Feature Set

### A. The Triple-Wallet System (Multi-Currency Layer)
SwiftyOS provides three distinct wallets to cater to different financial needs:
1. **NGN Wallet (Spending):** The primary wallet for domestic transactions, bill payments, and local transfers.
2. **USD Wallet (Stability):** A virtual dollar wallet for users to hedge against Naira inflation without interacting with the complexities of crypto.
3. **USDT Wallet (Crypto/Global):** The gateway to the global crypto economy, used for Swifty Links, receiving international payments, and SwiftyEx engine interactions.

- **Why it matters:** It separates daily spending from long-term stability and global crypto access, giving users full control over their financial exposure.

### B. AutoBills (Utility Layer)
A fully automated system for paying Nigerian utility bills (Data, Airtime, TV Subscriptions).
- **Automation Logic:** Users can set "Recurring Rules" (e.g., "Top up ₦2,000 data every Friday").
- **Auto-Conversion:** If a user’s NGN balance is low, the system automatically converts from the **USD** or **USDT** wallet to fulfill the bill payment.
- **API Integration:** Powered by VTpass for real-time utility delivery.

### C. Swifty Links (Social Layer)
A frictionless, "Escrow-style" payment link system that turns every Telegram chat into a payment channel.
- **Logic:** A creator generates a link for a specific NGN amount. The system locks the USDT equivalent from their wallet. 
- **The Magic:** The link is shared directly into a Telegram chat. The recipient claims it with one tap, instantly moving the funds to their wallet.
- **Strategy:** Replaces the need for bank account numbers or complex wallet addresses.

### D. Savings & Automation (Wealth Layer)
A discipline-focused module designed to help users build wealth in stablecoins.
- **Round-up Savings:** Every time a user pays a bill, the system rounds up to the nearest ₦1,000 and saves the "change" in USDT.
- **Goal-Based Tracking:** Users set NGN targets (e.g., "New Laptop") while the backend manages the USDT growth, ensuring they don't lose progress to Naira devaluation.

---

## 3. Technical Implementation Logic

### I. The Multi-Currency Conversion Engine
We protect the platform and the user by implementing a dynamic spread across three currencies:
- **NGN ↔ USD:** Standard fintech exchange for inflation hedging.
- **USD ↔ USDT:** Seamless stablecoin-to-virtual-dollar bridge.
- **NGN ↔ USDT:** Direct crypto-fiat gateway.
- **Volatility Buffer:** A 1.5% - 2% slippage cushion is added to every automated transaction.

### II. Atomic Transaction Workflow
To ensure 100% reliability in bill payments, we use an "Atomic" backend flow:
1. **Debit User Wallet:** Funds are removed immediately.
2. **API Call:** Request is sent to the utility provider (VTpass).
3. **Verification:** If the provider confirms, the transaction is closed.
4. **Instant Refund:** If the provider fails, funds are returned to the user's wallet within milliseconds, preventing "stuck" money.

### III. Rate-Locking Mechanism
To prevent arbitrage and market gaming, all conversion quotes are generated with a **60-second Time-to-Live (TTL)**. The user must confirm within this window, or the rate is recalculated.

---

## 4. Strategic Vision: "Invisible Crypto"
Our design philosophy is **Invisible Infrastructure**. 
- We do not use crypto-jargon (Gas, Seeds, Hash, Wallets). 
- We use familiar terms (Balance, Top-up, Send, Save).
- **The Result:** We lower the barrier to entry for the average Nigerian user while giving them all the security and speed benefits of the blockchain.

---

## 5. Technology Stack
- **Frontend:** Next.js (Optimized for Mobile/Mini App performance).
- **Backend:** Node.js & Express (High-concurrency payment handling).
- **Database:** Prisma & SQLite (Fast, relational data modeling).
- **Bot Framework:** grammY (Native Telegram interaction).
- **Deployment:** Vercel & Railway (Scalable, low-latency infrastructure).

---

## 6. Future Roadmap
- **Physical Cards:** Spend your USDT balance at any POS in Nigeria.
- **Merchant Links:** Allow vendors to receive stablecoin payments via QR codes.
- **AI Financial Assistant:** Proactive insights on spending habits and automated saving recommendations.
