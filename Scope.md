# SwiftyOS — 72-Hour Hackathon MVP Scope

**Event:** Swiftyex HackFest Osun 2026, June 6–9  
**Track:** A — The Builders  
**Team Size:** 2-3 people (frontend, backend, product/design)  
**Build Window:** 72 hours (Day 1–3)  
**MVP Modules:** Smart Wallet + AutoBills + Swifty Links + Savings & Automation

---

## 🎯 What We're Building

**SwiftyOS** is a Telegram Mini App that transforms crypto into invisible financial infrastructure.

Users can:
1. **Smart Wallet** — Hold USDT/crypto, see NGN equivalent, instant convert
2. **AutoBills** — Schedule airtime/data/DSTV payments (auto-convert crypto if needed)
3. **Swifty Links** — Generate payment claim links for instant transfers
4. **Savings & Automation** — Set up automated saving rules in stablecoins (USDT)

Everything inside Telegram. No app download. Crypto as infrastructure, not speculation.

---

## 📊 MVP Feature Matrix

### MODULE 1: SMART WALLET (Core)
**Status:** Fully functional  
**Why:** Everything else depends on this. Users need to see balances.

```
┌─ Smart Wallet
├─ Display USDT balance
├─ Show NGN equivalent (live rate)
├─ Quick Convert button (USDT ↔ NGN estimate)
├─ Send/Receive buttons (UI only — mock flow for MVP)
├─ Transaction history (mock data)
└─ Spendable balance header
```

**User Flow:**
```
User opens /wallet → Sees balance in USDT
                  → Sees live NGN equivalent
                  → Taps "Convert" → Sees estimate
                  → Taps Send/Receive → Modal appears (mock)
```

### MODULE 2: AUTOBILLS (Core)
**Status:** Fully functional (bill creation + scheduling UI)

```
┌─ AutoBills
├─ Bill Templates (Airtime, Data, TV Subscriptions)
├─ Create Recurring Bill (amount, frequency, provider)
├─ Schedule Payment (manual trigger on MVP)
├─ Auto-convert logic (if USDT insufficient → convert)
├─ Payment confirmation UI
└─ Upcoming bills calendar view
```

**User Flow:**
```
User taps "Add Bill" → Selects provider (MTN Data)
                    → Sets amount (1000 NGN)
                    → Sets frequency (Weekly)
                    → System calculates USDT cost
                    → Confirms → Bill appears in "Upcoming"
                    → Taps "Pay Now" → Confirms payment
                    → Gets confirmation + balance updated
```

### MODULE 3: SWIFTY LINKS (Core)
**Status:** Fully functional (link generation + claim flow)

```
┌─ Swifty Links
├─ Generate Payment Claim Links
│  ├─ Set amount (NGN or USDT)
│  ├─ Set expiry (optional)
│  └─ Generate unique URL/QR
├─ Telegram Username Transfers
│  ├─ Search users by @username
│  ├─ Instant transfer from wallet
│  └─ In-app notification
└─ Gift Links
   ├─ "Red Packet" style links
   ├─ Claimable by first person who clicks
   └─ Confirmation UI
```

**User Flow:**
```
User: "I want to send ₦5,000 to a friend."
  → Taps "Swifty Link"
  → Sets amount: ₦5,000
  → Generates link
  → Sends link to friend on Telegram
  → Friend taps link → Sees "Claim ₦5,000"
  → Tap "Confirm" → Balance updated in their SwiftyOS wallet
```

### MODULE 4: SAVINGS & AUTOMATION (Semi-Functional)
**Status:** UI Functional + Simulated Logic

```
┌─ Savings & Automation
├─ Goal-based Savings
│  ├─ Set target amount (NGN)
│  ├─ Auto-deduct from wallet
│  └─ Progress tracking
├─ Round-up Savings
│  ├─ "Save the change" from bill payments
│  └─ Convert small NGN amounts to USDT
└─ Staking/Yield UI
   ├─ View estimated APY
   └─ Simple "Deposit/Withdraw" logic
```

**User Flow:**
```
User: "I want to save for a new laptop (₦500,000)."
  → Taps "New Goal"
  → Sets name: "Laptop"
  → Sets target: ₦500,000
  → Sets rule: "Save ₦5,000 every Monday"
  → System auto-transfers from Wallet to "Savings Vault"
```

---

## 🚫 What We're NOT Building (72-Hour Constraints)

- ❌ Real blockchain transactions (mock only for demo safety)
- ❌ Full KYC verification flow
- ❌ Mobile app (Telegram Mini App only)
- ❌ Advanced AI natural language (hardcoded commands for demo)

**Note:** Real Bill Payment APIs, Live Crypto rates, and the Savings logic ARE in scope.

We're building **working UI + mock backend** that can swap to real APIs on Day 1 after kickoff.

---

## 🏗️ Technical Architecture

### Frontend (React + Next.js + Tailwind)

```
SwiftyOS Mini App (hosted on Vercel)
├── Pages/Screens
│   ├── WalletScreen      → Balance, convert, send/receive
│   ├── AutoBillsScreen   → Create, schedule, manage bills
│   ├── LinksScreen       → Create and manage payment links
│   ├── SavingsScreen     → Savings goals and automation rules
│   ├── HistoryScreen     → Transaction log
│   └── SettingsScreen    → Profile, logout
├── Components
│   ├── BalanceCard       → Displays USDT + NGN
│   ├── BillCard          → Individual bill item
│   ├── LinkCard          → Payment link management
│   ├── SavingsGoalCard   → Progress bar + goal details
│   ├── ConfirmModal      → Payment confirmation
│   └── StatusBadge       → Paid/Pending indicators
├── Hooks
│   ├── useTelegram()     → Telegram.WebApp integration
│   ├── useWallet()       → Balance state + conversions
│   ├── useBills()        → Bill CRUD + scheduling
│   ├── useLinks()        → Link generation + management
│   └── useSavings()      → Savings state management
└── Services
    ├── mockWalletAPI     → Fake balance + transactions
    ├── billAPI           → Real/Mock bill payment logic
    ├── linkAPI           → Link generation logic
    └── savingsAPI        → Savings management logic
```

### Backend (Node.js + Express + Prisma + SQLite)

```
Backend Server (Vercel Functions or Railway)
├── /webhook              → Telegram bot updates
├── /api/wallet
│   ├── GET /balance      → User balance
│   ├── POST /convert     → Convert estimate
│   └── GET /transactions → History
├── /api/bills
│   ├── GET /list         → User's bills
│   ├── POST /create      → New recurring bill
│   ├── POST /pay         → Trigger payment
│   └── GET /upcoming     → Calendar view
├── /api/links
│   ├── POST /create      → New payment link
│   ├── GET /list         → User's links
│   ├── POST /claim       → Claim a payment link
│   └── GET /claim/:id    → View link details
├── /api/savings
│   ├── GET /list         → User's savings goals
│   ├── POST /create      → New savings goal
│   ├── POST /deposit     → Add to savings
│   └── POST /withdraw    → Take from savings
├── /auth
│   └── POST /telegram    → Validate Telegram initData
└── Database (SQLite)
    ├── users
    ├── wallets
    ├── bills
    ├── bill_payments
    ├── links
    ├── link_claims
    ├── savings_goals
    └── savings_transactions
```

### Telegram Bot

```
@SwiftyOS_bot (staging)
├── /start                → Welcome + open Mini App
├── /wallet               → Show balance quick view
├── /bills                → List upcoming bills
├── /links                → Show active payment links
├── /savings              → Show savings progress
├── /pay <amount>         → Quick payment link
└── Inline buttons        → Open Mini App for each action
```

---

## 📁 Folder Structure

```
swiftyos/
├── README.md                    ← Start here
├── SCOPE.md                     ← This file
├── docs/
│   ├── ARCHITECTURE.md          ← System design diagram
│   ├── UI_SCREENS.md            ← All screen mockups
│   ├── API_SPEC.md              ← API endpoints
│   ├── TELEGRAM_INTEGRATION.md  ← Bot + TWA setup
│   ├── DEPENDENCIES.md          ← All npm packages
│   ├── ENVIRONMENT.md           ← .env variables
│   ├── DEPLOYMENT.md            ← Deploy to Vercel
│   ├── AI_AGENT.md              ← Instructions for Claude
│   └── JUDGING_CRITERIA.md      ← How we score
├── src/
│   ├── pages/
│   │   ├── _app.tsx             ← App wrapper + Telegram init
│   │   ├── wallet.tsx           ← Smart Wallet screen
│   │   ├── bills.tsx            ← AutoBills screen
│   │   ├── links.tsx            ← Swifty Links screen
│   │   ├── history.tsx          ← Transaction history
│   │   └── settings.tsx         ← User settings
│   ├── components/
│   │   ├── BalanceCard.tsx
│   │   ├── BillCard.tsx
│   │   ├── LinkCard.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── TransactionItem.tsx
│   │   └── [other reusables]
│   ├── hooks/
│   │   ├── useTelegram.ts
│   │   ├── useWallet.ts
│   │   ├── useBills.ts
│   │   └── useLinks.ts
│   ├── services/
│   │   ├── api.ts               ← Fetch wrapper
│   │   ├── wallet.ts            ← Wallet API client
│   │   ├── bills.ts             ← Bills API client
│   │   ├── links.ts             ← Links API client
│   │   └── mock/                ← Mock data for dev
│   ├── store/
│   │   └── useStore.ts          ← Zustand state
│   ├── types/
│   │   └── index.ts             ← TypeScript types
│   └── styles/
│       └── globals.css
├── backend/
│   ├── routes/
│   │   ├── wallet.ts
│   │   ├── bills.ts
│   │   ├── links.ts
│   │   ├── auth.ts
│   │   └── webhook.ts
│   ├── services/
│   │   ├── wallet.ts
│   │   ├── bills.ts
│   │   ├── links.ts
│   │   └── telegram.ts
│   ├── middleware/
│   │   ├── auth.ts              ← Validate Telegram initData
│   │   └── rateLimit.ts
│   └── server.ts
├── telegram/
│   ├── commands.ts              ← Bot commands
│   ├── handlers.ts              ← Update handlers
│   └── keyboards.ts             ← Inline buttons
├── prisma/
│   └── schema.prisma            ← Database schema
├── public/
│   └── [static assets]
├── .env.example
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## 🚀 Development Timeline

### Day 1 (Kickoff → Evening)
**Goal:** Scaffold, UI shells, zero errors

- [ ] Set up Next.js + Tailwind project
- [ ] Create all page/component skeletons
- [ ] Design system in place (colors, typography, spacing)
- [ ] Telegram.WebApp SDK integrated
- [ ] Bot token from @BotFather
- [ ] Deploy empty app to Vercel (test flow)

### Day 2 (Full Build)
**Goal:** Functional MVP with mock data

**Frontend:**
- [ ] WalletScreen fully interactive (balance, convert button, send/receive modals)
- [ ] AutoBillsScreen (create bill, schedule, pay now, upcoming view)
- [ ] LinksScreen (create link, add amount, view active links, claim flow)
- [ ] HistoryScreen (transaction log)
- [ ] Tab navigation (Wallet → Bills → Links → History → Settings)
- [ ] All state management working (Zustand)
- [ ] Mock API calls + real API integration for bills

**Backend:**
- [ ] Express server scaffolding
- [ ] `/api/wallet` endpoints (mock data)
- [ ] `/api/bills` endpoints (Real VTpass/Flutterwave integration)
- [ ] `/api/links` endpoints (Link generation)
- [ ] `/auth/telegram` endpoint (validate initData HMAC)
- [ ] SQLite database schema
- [ ] Telegram webhook handler scaffolding

**Bot:**
- [ ] `/start` command (opens Mini App via inline button)
- [ ] `/wallet` command (quick balance check)
- [ ] `/bills` command (list upcoming)
- [ ] `/links` command (list active)

### Day 3 (Polish + Demo Prep)
**Goal:** Ship, demo, win

- [ ] Bug fixes, error handling
- [ ] UI polish (animations, transitions)
- [ ] Test end-to-end flows
- [ ] Demo script (3 minutes)
- [ ] Code cleanup + TypeScript strict
- [ ] Final deploy to production
- [ ] Demo walkthrough with judges

---

## 🎮 Demo Script (3 Minutes)

**Setup:** You have a SwiftyOS account with ₦10,000 USDT balance.

```
SCENE 1: Smart Wallet (40s)
---
"I just received USDT from freelance work."
→ Open /wallet
→ Show balance: 10,000 USDT = ₦13.4M NGN (live rate)
→ Tap "Convert" → See ₦5,000 worth of USDT
→ Tap "Send" → Modal shows payment link generation

SCENE 2: AutoBills (50s)
---
"I need MTN data every week and electricity is coming up."
→ Open /bills
→ Tap "Add Bill" → Select "MTN Data"
→ Set amount: ₦1,000/week
→ Auto-calculates USDT cost: ~0.74 USDT
→ Confirm → Bill scheduled
→ Show "Upcoming Bills" calendar
→ Tap "Pay Now" on DSTV → Payment confirmation
→ ✅ Balance updated (USDT auto-converted)

SCENE 3: Swifty Links (40s)
---
"I want to send ₦5,000 to a friend safely."
→ Open /links
→ Tap "Create Link"
→ Set amount: ₦5,000
→ Generate claim link
→ Send link to friend on Telegram
→ Show how friend receives link → Taps → Sees "Claim ₦5,000"
→ Taps "Confirm" → ✅ Added to their wallet balance

SCENE 4: Savings & Automation (30s)
---
"I'm saving for a laptop while I spend."
→ Open /savings
→ Show "Laptop Goal" at 45% progress
→ Show "Round-ups" enabled (System saves the change from every bill)
→ Show USDT balance growing automatically.

SCENE 5: Why This Matters (20s)
---
"What makes SwiftyOS different?
  → Crypto is invisible (just infrastructure)
  → Bills are automated (no daily clicks)
  → Payments are social (split with friends instantly)
  → Everything in Telegram (no app download)
  
This is how 50M Nigerians will adopt crypto — not by trading, but by paying bills."
```

---

## 🎯 Judging Criteria Map

**Official Brief:** "Does it work? Does it improve SwiftyEx? How clean is the code/UX? Are you part of the community?"

| Criterion | SwiftyOS Answer |
|-----------|-----------------|
| **Functionality** | ✅ All 4 modules work (Wallet, Bills, Links, Savings). Zero crashes. Real user flows. |
| **Impact** | ✅ Solves real problem: Africans paying bills, sending money, and saving with crypto. |
| **Code Quality** | ✅ TypeScript strict. Clean components. Proper error handling. Accessible. |
| **UX/Design** | ✅ Calm, premium feel. Zero jargon. Telegram-native look. Smooth animations. |
| **Community** | ✅ Team uses SwiftyEx staging bot. Following Instagram. |

---

## 💡 Why SwiftyOS Wins

**Problem:** Crypto is too trader-focused. Average African user doesn't care about speculation.

**Solution:** Make crypto invisible. Users just see "Fast bill payments, automation, convenience."

**Differentiation:**
- ❌ Not another exchange (boring)
- ❌ Not another wallet (solved problem)
- ✅ A financial OS where crypto is infrastructure, not spectacle

**Scalability:**
- Works for students, freelancers, remote workers
- Scales to refer-and-earn (Swiftyex integration)
- Future: physical cards, merchant payments, cross-border

---

## 🔧 Tech Stack (Final)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + React 18 + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + Prisma + SQLite |
| Bot | grammy.dev + Telegram Bot API |
| State | Zustand |
| Hosting | Vercel (frontend + API routes) + Railway (dedicated backend) |
| Database | SQLite (dev) / PlanetScale (prod) |

---

## 📋 Deliverables (Day 3)

```
✅ Telegram Mini App (live on Vercel)
   ├─ Smart Wallet: working
   ├─ AutoBills: working (Real VTpass/Flutterwave integration)
   ├─ Swifty Links: working
   ├─ Savings & Automation: working
   └─ Clean UI, zero errors

✅ Telegram Bot (live, responding to /commands)
✅ Backend API (all endpoints functional)
✅ Database (SQLite with schema)
✅ Code (TypeScript, clean, documented)
✅ Demo (3-minute walkthrough)
✅ Pitch (why this matters for Osun/Nigeria)
```

---

## 🛠️ Getting Started (Next Steps)

1. **Create Telegram bot:** Use @BotFather, save token
2. **Clone repo structure:** Use folder layout above
3. **Install dependencies:** See DEPENDENCIES.md
4. **Read:** ARCHITECTURE.md, UI_SCREENS.md, TELEGRAM_INTEGRATION.md
5. **Start frontend:** `npm run dev` (frontend on localhost:3000)
6. **Start backend:** `npm run api:dev` (API on localhost:3001)
7. **Test bot locally:** `npm run bot:dev` (ngrok tunnel to local webhook)
8. **Build in parallel:** Frontend + backend teams can work independently

---

## 🚨 Critical Success Factors

1. **Mock everything by Day 1 evening** — Real APIs can come later
2. **UI first, logic second** — Judges see the demo, not the code
3. **Zero crashes during demo** — Handle errors gracefully
4. **Pitch the problem, not the tech** — "We solve real African financial life"
5. **Telegram integration is the magic** — Show mini app ↔ bot integration clearly

---

## ✨ Remember

You have 72 hours and 2-3 people. **Do 3 things well, not 10 things poorly.**

Focus on:
- Smart Wallet (users see balance, understand the product)
- AutoBills (users see value: automated payments with real APIs)
- Swifty Links (users see magic: instant crypto-to-fiat payments links)
- Savings (users see growth: effortless stablecoin saving)

Everything else is future.

Let's build.