# SwiftyOS — Judge's Briefing
### Swiftyex HackFest Osun 2026 · Track A: The Builders

---

## The Problem

Nigeria loses 30%+ purchasing power annually to Naira devaluation. Everyday users — students recharging data, professionals paying DSTV, freelancers receiving dollars — bear this cost silently. Crypto fixes this, but the learning curve (wallets, seed phrases, gas) prices most people out.

**SwiftyOS removes that tradeoff.**

---

## What We Built

A Telegram-native Financial OS. No app download. No crypto jargon. Users interact with money the way they already interact with people — inside Telegram.

The design principle is **Invisible Infrastructure**: USDT is the monetary backbone, but the user only ever sees Naira. They top up data. They save for a laptop. They split dinner. Crypto is the plumbing, never the product.

---

## Core Features

### Smart Wallet
Triple-currency: NGN (spending) · USDT (stability) · USD (hedge).
Balances and deposit addresses pulled live from the SwiftyEx engine. NGN equivalent updated every 60 seconds from live buy/sell rates.

### AutoBills
*"Top up MTN ₦1,000 data every Friday."* Set it once, done.
- Powered by VTpass — real airtime, data, DSTV, and electricity delivery
- Atomic: wallet debited → VTpass called → instant refund if provider fails
- Telegram push notification on every execution

### Swifty Links — Social Escrow
Turn any Telegram chat into a payment channel. Creator locks USDT equivalent on generation; recipient claims with one tap. Links expire in 24 hours with automatic refund.

### Split Pay
Creator sets participant shares. Each person pays their portion independently. Group status resolves when all pay.

### Savings Vaults — Rate-Locked
Goal-based saving with a deliberate anti-speculation constraint: **you save ₦1,500 today, you withdraw ₦1,500 — regardless of what the exchange rate does.** Each deposit locks the NGN amount exactly. Users cannot use the vault to time currency moves or play the market. The vault is a discipline tool — save towards a goal, withdraw when you hit it. Interest/yield is a planned future feature.

### AI Assistant
Natural language → structured action. *"Split ₦20,000 among 5 people for dinner"* parses to `{ action: "SPLIT_PAY", amount: 20000, participants: 5 }`. Powered by Groq / Llama 3.

---

## Architecture

```
Telegram Mini App (Next.js)
         │  JWT
         ▼
  Express.js API ────► MongoDB Atlas
         │
         ├─► SwiftyEx  /miniapp/rates        live exchange rates (60s cache)
         │             /miniapp/wallets       real balances + deposit address
         │             /miniapp/me            user profile & KYC
         │
         ├─► VTpass    /services              provider list
         │             /service-variations    data bundles / TV bouquets
         │             /pay                   execute purchase
         │             /merchant-verify       meter / smartcard lookup
         │
         ├─► Telegram Bot API                 push notifications
         └─► Groq (Llama 3)                   NL command parsing
```

---

## Security & Integrity

| Concern | How we handle it |
|---|---|
| Auth | Telegram `initData` HMAC-SHA256 verified on every login |
| Sessions | JWT, 7-day expiry, refreshed on each app open |
| Bill payments | Atomic — debit first, refund on failure, no partial states |
| Payment links | USDT locked at creation, not claim — prevents double-spend |
| VTpass retries | Unique `request_id` per call prevents double-charge |
| Savings market gaming | Deposits convert at the live rate immediately — no rate timing |
| Rate slippage | 2% buffer on every USDT ↔ NGN conversion |

---

## Tech Stack

**Frontend:** Next.js · **Backend:** Node.js + Express · **DB:** MongoDB Atlas
**Auth:** Telegram HMAC + JWT · **Scheduling:** node-cron · **AI:** Groq / Llama 3
**Bills:** VTpass · **Rates & Wallets:** SwiftyEx Engine · **Notifications:** Telegram Bot API
**Deploy:** Render

---

*Live API docs: `/api-docs` (Swagger UI) on the deployed backend.*
