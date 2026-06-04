# SwiftyOS 💜 🚀
### Run your financial life from Telegram.

SwiftyOS is a Telegram Mini App that transforms crypto into invisible financial infrastructure for African users. It enables instant bill payments, social transfers, automated savings, and multi-currency management—all powered by the SwiftyEx engine.

---

## 🌟 Core Modules
- **💼 Triple-Wallet System:** Manage NGN, USD (Virtual), and USDT (Crypto) in one unified dashboard.
- **📱 AutoBills:** Instant Airtime, Data, and TV (DSTV/GOTV/Startimes) payments with automated recurring scheduling.
- **🔗 Swifty Links:** Social social finance—send money to any Telegram user via a simple claim link.
- **💰 Savings & Automation:** Passive wealth building with "Round-ups" (save the change) and automated deposits in USDT.

---

## 📂 Project Documentation
We have structured our documentation to make it easy for judges and developers to follow:

### 🏆 For Judges
- **[PRODUCT_SPECIFICATION.md](./PRODUCT_SPECIFICATION.md):** The high-level vision, strategic advantages, and feature deep-dives.
- **[ARCHITECTURE.md](./Architecture.md):** System design diagrams, database schema, and API flows.

### 🛠 For Developers
- **[IMPLEMENTATION_LOGIC.md](./IMPLEMENTATION_LOGIC.md):** The "Brain"—Auto-conversion math, spread logic, and atomic transaction workflows.
- **[API_INTEGRATION.md](./API_INTEGRATION.md):** Technical details for SwiftyEx and VTpass integrations.
- **[FRONTEND_INSTRUCTIONS.md](./FRONTEND_INSTRUCTIONS.md):** Detailed UI requirements and screen-by-screen functionality.
- **[BACKEND_INSTRUCTIONS.md](./BACKEND_INSTRUCTIONS.md):** Infrastructure responsibilities and security requirements.
- **[UI_SCREENS.md](./UI_SCREENS.md):** Visual mockups and design system definitions.
- **[COMPONENTS.md](./Components.md):** React component library and hierarchy.

---

## 🚀 Tech Stack
- **Frontend:** Next.js, Tailwind CSS, Framer Motion, Telegram Mini App SDK.
- **Backend:** Node.js, Express, Prisma ORM.
- **Database:** SQLite (Hackathon MVP) / PostgreSQL.
- **Bot Framework:** grammY.
- **APIs:** SwiftyEx (Wallets/Swap), VTpass (Utility).

---

## 🛡 Security & Reliability
- **HMAC Validation:** Every request is signed and verified via Telegram's secure initData.
- **Atomic Transactions:** "Debit -> Execute -> Finalize" flow to ensure user funds are always safe.
- **Stablecoin Shield:** Savings held in USDT to protect users from Naira inflation.

---

**Built with 💜 for the SwiftyEx HackFest Osun 2026.**
