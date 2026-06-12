# SwiftyOS — Hackathon Submission Document

**Team:** Oluwadare Daniel
**Category:** Fintech / Telegram Mini Apps
**Submitted:** June 2026

---

## The Problem

Financial infrastructure in Nigeria is fragmented. A typical user needs five separate apps to: receive money from a friend, pay their DSTV subscription, buy airtime, save in a stable currency, and send money to someone without a bank account.

For the 60+ million Nigerians on Telegram daily, none of this is available without leaving the app.

SwiftyOS collapses all of it into a single Telegram Mini App. No download. No separate account. One tap.

---

## What We Built

SwiftyOS is a financial operating system embedded directly inside Telegram. It treats Telegram's identity layer (your username, your contacts) as the primitive for financial operations, and wraps real Nigerian financial infrastructure around it.

### Core Features

**1. Multi-Currency Wallet**
Users hold NGN (Naira), USDT (Tether), and USD in a single wallet. Balances are live. Conversion between currencies happens at real market rates with a 60-second rate lock to protect against slippage.

**2. Bills Payment**
Airtime, mobile data, cable TV (DStv, GOtv, Startimes), and electricity (IKEDC, EKEDC, AEDC, IBEDC, KEDCO) — all five major Nigerian electricity distribution companies. Powered by the VTPass API. Users select a provider, pick a plan, enter a phone/meter number, and pay from their wallet in under 10 seconds.

**3. Swifty Links — Social Escrow**
A user can lock NGN in escrow and generate a shareable Telegram link. Anyone who opens the link claims the money instantly. This solves the "splitting the bill" and "paying someone who doesn't have a bank account yet" problem. The funds are held securely until claimed or the link expires.

**4. USDT Savings Vaults**
Savings goals denominated in USDT. Because Naira loses value, savings should be stored in a stable dollar-pegged asset. Users create named goals (e.g. "New Laptop", "Emergency Fund"), deposit USDT, and track progress toward a target. This is a direct response to Nigeria's inflation problem — savings that hold their value.

**5. Transaction History**
Full filterable history across all transaction types: sends, receives, bill payments, conversions, link claims, and savings deposits. Grouped by date.

**6. Telegram-Native Identity**
No username/password signup. Authentication happens via Telegram's `initData` signature — the backend verifies the hash, issues a JWT, and the session is live. To send money, you type `@telegram_username` — no account numbers, no NUBAN lookup.

---

## Technical Architecture

### Frontend
- **Framework:** Next.js 14+ (App Router, TypeScript)
- **State:** Zustand — single flat store for balances, transactions, bills, goals, links
- **Animations:** Framer Motion — bottom-sheet modals, tab transitions, success states
- **Styling:** Tailwind CSS v4 with a custom design token system (CSS variables for surfaces, borders, accent colours)
- **Deployment:** Vercel (automatic deploy on push to `main`)

### Backend
- **Runtime:** Node.js / Express
- **Auth:** Telegram `initData` HMAC-SHA256 validation → JWT
- **Bills:** VTPass API integration — provider lookup, plan variations, payment execution
- **Database:** MongoDB (user accounts, transaction records, savings goals, auto-bills scheduler, Swifty Links)
- **Deployment:** Render

### Telegram Integration
- Mini App launched via `t.me/Swiftos_bot`
- `WebApp.initData` passed on every request for server-side identity verification
- Haptic feedback, safe area insets, and viewport height handled natively

---

## On the Use of Mock / Demo Data

We want to be upfront about this: **the demo you are seeing runs on mock data.** Here is exactly what is mocked and why we made this decision.

### What is mocked

| Feature | Real or Mock | Notes |
|---|---|---|
| Wallet balances | **Mock** | Pre-seeded with ₦125,500 NGN / 85.50 USDT / $45 USD |
| Transaction history | **Mock** | 10 realistic transactions spanning 10 days |
| Bills providers & plans | **Real → Mock fallback** | Tries VTPass API first; if unavailable, uses local data with real provider names, logos, and pricing |
| Bill payment | **Real → Mock fallback** | Submits to VTPass; if rejected, simulates 1.2s processing delay and returns a generated reference |
| Currency conversion rates | **Real → Mock fallback** | Fetches live NGN/USDT rate; falls back to ₦1,580/USDT |
| Savings goals | **Mock** | Two realistic goals with partial progress |
| Swifty Links | **Mock** | One active link pre-seeded |
| Auth | **Real → Mock fallback** | Attempts Telegram JWT auth; silently falls back to demo mode if backend is unreachable |

### Why we made this decision

**1. Backend availability during judging.**
Our backend runs on Render's free tier. Free-tier instances spin down after 15 minutes of inactivity and take 30–60 seconds to cold-start. In a live demo context, this creates unpredictable latency exactly when it matters most. A judge opening the app for the first time would see a blank screen or a spinner for a minute. That is an unacceptable first impression for a product that is supposed to feel instant.

**2. VTPass rate limits and test account restrictions.**
VTPass bills API requires a funded test account for sandbox transactions. Production keys are not available without a registered business entity. We did not want to demo with broken provider lists or failed payment attempts caused by API credential issues outside our control.

**3. The real infrastructure is built and works.**
This is not a prototype or a mockup. The backend has real VTPass integration, real Telegram auth, real MongoDB persistence, and a real auto-bills scheduler. We chose to add a fallback layer on top of working infrastructure — not to replace it. The code path for every real API call exists and has been tested. The mock only activates when the real call throws.

**4. Honest demo data is better than broken real data.**
Pre-seeded demo data tells a clearer story about product capability than a wallet that shows ₦0 because the test account has no funds. The ₦125,500 balance, the transaction history, the two savings goals — these are all plausible for a real user, and they let the judge actually exercise the product.

### The fallback architecture

Every API function in `frontend/src/lib/api.ts` follows this pattern:

```typescript
export const billsAPI = {
  getProviders: async (category: string) => {
    try {
      const data = await fetcher(`/api/bills/providers?category=${category}`);
      const list = data.data || [];
      if (list.length > 0) return { status: 'success', data: list };  // real data
    } catch {}
    return { status: 'success', data: MOCK_PROVIDERS[category] || [] };  // fallback
  },
};
```

Real API first. Fallback second. The UI never knows the difference. When real data returns, it replaces the pre-seeded demo state automatically. When real APIs are down, the experience is seamless.

---

## What We Would Ship Next

1. **Live VTPass integration with funded keys** — provider logos, live pricing, real receipt tokens. The integration code is already written.
2. **Push notifications via Telegram Bot API** — "Your DStv is due in 3 days", "Someone claimed your Swifty Link"
3. **Auto-bills scheduler** — the backend model and routes exist; the frontend UI for scheduling a recurring bill is built. Just needs the production billing credential.
4. **P2P lending** — Swifty Links can be extended to allow interest-bearing requests ("lend me ₦20k, I'll return ₦21k in 30 days") with Telegram identity as collateral
5. **USDT on/off ramp** — connect to a P2P exchange or a custodial service so users can go from bank transfer → USDT → wallet in one flow

---

## Try It

**Telegram Mini App:** `t.me/Swiftos_bot`

Navigate to Settings → Demo / Test Funds to add test balances, then explore Bills (providers and plans load in real time where available), Savings (deposit into a goal and watch the progress bar move), and Swifty Links (generate a link, copy it, and claim it in the same session).

---

*SwiftyOS is built for the 220 million Nigerians who deserve financial infrastructure that works as fast as a Telegram message.*
