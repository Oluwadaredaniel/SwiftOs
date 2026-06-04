# AI_AGENT.md
## Implementation Instructions for Claude & AI Builders

This document is written for Claude or other AI agents implementing SwiftyOS during the hackathon.

---

## Context & Constraints

**You are building:** SwiftyOS — A Telegram Mini App for crypto-powered payments, bills, and Swifty Links  
**Timeline:** 72 hours (Day 1-3)  
**Team:** 2-3 people (you may be helping multiple team members in parallel)  
**MVP Scope:** Smart Wallet + AutoBills + Swifty Links (fully functional with mock/real data)  
**Deployment:** Vercel (frontend) + Railway (backend)

**Critical Success Factor:** Do 3 things well, not 10 things poorly. Follow the business rules in `IMPLEMENTATION_LOGIC.md` and `API_INTEGRATION.md` for all financial calculations.

---

## Phase 1: Scaffold & Structure (Day 1 Afternoon → Evening)

### Task 1A: Frontend Setup
```bash
npm create next-app@latest swiftyos --typescript --tailwind
cd swiftyos
npm install zustand framer-motion @telegram-apps/sdk
npm run dev
```

**Create these page files:**
- `pages/_app.tsx` — App wrapper, Telegram SDK init, global state
- `pages/index.tsx` — Redirect to /wallet
- `pages/wallet.tsx` — Smart Wallet screen
- `pages/bills.tsx` — AutoBills screen
- `pages/links.tsx` — Swifty Links screen
- `pages/savings.tsx` — Savings & Automation screen
- `pages/history.tsx` — Transaction history
- `pages/settings.tsx` — User settings

**Each page should:**
- Import Telegram SDK hook
- Import Zustand store for state
- Render placeholder UI (matching UI_SCREENS.md)
- Have tab navigation (sticky bottom)
- Show loading + error states
- Be fully interactive (buttons work, modals open/close)

**No API calls yet.** Everything uses mock data from `store/useStore.ts`.

### Task 1B: Components Structure

Create these reusable components:
```
src/components/
├── BalanceCard.tsx          — Displays USDT + NGN balance
├── BillCard.tsx             — Individual bill item with buttons
├── LinkCard.tsx             — Swifty Link management card
├── ConfirmModal.tsx         — Generic confirmation modal
├── TransactionItem.tsx      — Transaction list item
├── TabNav.tsx               — Bottom tab navigation
├── Button.tsx               — Reusable button (variants: primary, secondary, danger)
├── Badge.tsx                — Status badges (paid, pending, failed)
├── Input.tsx                — Form input field
├── Select.tsx               — Dropdown selector
└── LoadingSpinner.tsx       — Spinner animation
```

**Key requirement:** All components accept mock data as props. No API calls in components.

### Task 1C: State Management (Zustand)

Create `src/store/useStore.ts`:

```ts
import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  telegramId: number;
}

interface Wallet {
  usdt_balance: number;
  ngn_equivalent: number;
  rate: number;
}

interface Bill {
  id: string;
  provider: string;
  amount_ngn: number;
  frequency: string;
  next_payment: string;
}

interface SwiftyLink {
  id: string;
  creator: string;
  amount_ngn: number;
  claim_code: string;
  status: 'active' | 'claimed' | 'expired';
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'bill' | 'link' | 'convert';
  amount: number;
  currency: string;
  timestamp: string;
  description: string;
  status: 'success' | 'pending' | 'failed';
}

interface StoreState {
  // User
  user: User | null;
  setUser: (user: User) => void;
  
  // Wallet
  wallet: Wallet;
  setWallet: (wallet: Wallet) => void;
  
  // Bills
  bills: Bill[];
  addBill: (bill: Bill) => void;
  removeBill: (billId: string) => void;
  
  // Links
  links: SwiftyLink[];
  addLink: (link: SwiftyLink) => void;

  // Savings
  savingsGoals: any[];
  setSavingsGoals: (goals: any[]) => void;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  
  // Loading
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error
  error: string | null;
  setError: (error: string | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  wallet: {
    usdt_balance: 10000,
    ngn_equivalent: 13480000,
    rate: 1348,
  },
  setWallet: (wallet) => set({ wallet }),
  
  bills: [
    {
      id: 'bill_1',
      provider: 'mtnn_data',
      amount_ngn: 1000,
      frequency: 'weekly',
      next_payment: new Date(Date.now() + 86400000).toISOString(),
    },
  ],
  addBill: (bill) => set((state) => ({ bills: [...state.bills, bill] })),
  removeBill: (billId) => set((state) => ({
    bills: state.bills.filter((b) => b.id !== billId),
  })),
  
  links: [],
  addLink: (link) => set((state) => ({ links: [...state.links, link] })),

  savingsGoals: [],
  setSavingsGoals: (goals) => set({ savingsGoals: goals }),
  
  transactions: [
    {
      id: 'tx_1',
      type: 'bill',
      amount: 1000,
      currency: 'NGN',
      timestamp: new Date().toISOString(),
      description: 'MTN Data',
      status: 'success',
    },
  ],
  addTransaction: (tx) => set((state) => ({
    transactions: [tx, ...state.transactions],
  })),
  
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  error: null,
  setError: (error) => set({ error }),
}));
```

### Task 1D: Types File

Create `src/types/index.ts` with all TypeScript interfaces. Copy from the Zustand store above and expand as needed.

### Task 1E: Telegram SDK Hook

Create `src/hooks/useTelegram.ts`:

```ts
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe: {
          user: {
            id: number;
            first_name: string;
            username?: string;
          };
        };
      };
    };
  }
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();
    setIsReady(true);

    return () => {
      // Cleanup if needed
    };
  }, []);

  return {
    isReady,
    tg: window.Telegram?.WebApp,
    user: window.Telegram?.WebApp?.initDataUnsafe?.user,
    initData: window.Telegram?.WebApp?.initData,
  };
}
```

### Task 1F: Deploy Empty App to Vercel

```bash
# Make sure app runs locally
npm run dev
# Visit http://localhost:3000 → should see /wallet screen

# Deploy to Vercel
npm i -g vercel
vercel
# Follow prompts, link to GitHub repo
# Note the Vercel URL (e.g., https://swiftyos.vercel.app)
```

**Target: By end of Day 1 evening, you have:**
- ✅ All screens rendering with mock data
- ✅ Tab navigation working
- ✅ Modals can open/close
- ✅ No console errors
- ✅ App deployed to Vercel (live URL)
- ✅ Ready to plug in real backend tomorrow

---

## Phase 2: Backend Setup (Day 1 Evening → Day 2 Morning)

### Task 2A: Backend Project Structure

```bash
mkdir swiftyos-backend
cd swiftyos-backend

npm init -y
npm install express cors dotenv prisma @prisma/client grammy
npm install -D typescript @types/express nodemon tsx
```

Create `src/server.ts`:

```ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Routes (TODO)
app.use('/auth', require('./routes/auth'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/links', require('./routes/links'));
app.use('/api/savings', require('./routes/savings'));
app.post('/webhook', require('./routes/webhook'));

// Error handling
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Create `package.json` scripts:
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Task 2B: Prisma Schema

Create `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int       @id @default(autoincrement())
  telegram_id BigInt  @unique
  username  String?
  first_name String?
  created_at DateTime @default(now())
  
  wallet    Wallet?
  bills     Bill[]
  bill_payments BillPayment[]
  links_created SwiftyLink[] @relation("Creator")
  links_claimed SwiftyLink[] @relation("Claimer")
}

model Wallet {
  id        Int       @id @default(autoincrement())
  user_id   Int       @unique
  user      User      @relation(fields: [user_id], references: [id])
  usdt_balance Decimal @default(10000)
  updated_at DateTime @updatedAt
}

model Bill {
  id        Int       @id @default(autoincrement())
  user_id   Int
  user      User      @relation(fields: [user_id], references: [id])
  provider  String
  amount_ngn Decimal
  frequency String
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
  status     String    @default("success")
  paid_at    DateTime
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
  status     String   @default("active")
  created_at DateTime @default(now())
  claimed_at DateTime?
}
```

Initialize Prisma:
```bash
npx prisma init
npx prisma migrate dev --name init
```

### Task 2C: Telegram Auth Middleware

Create `src/middleware/auth.ts`:

```ts
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function validateTelegramInitData(initData: string, botToken: string) {
  const data = new URLSearchParams(initData);
  const hash = data.get('hash');
  
  if (!hash) return false;
  
  data.delete('hash');
  
  const dataCheckString = Array.from(data.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const initData = req.headers['x-init-data'] as string;
  
  if (!initData) {
    return res.status(401).json({ error: 'No initData provided' });
  }
  
  const isValid = validateTelegramInitData(initData, process.env.TELEGRAM_BOT_TOKEN!);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid initData' });
  }
  
  const data = new URLSearchParams(initData);
  const user = JSON.parse(data.get('user')!);
  (req as any).user = user;
  
  next();
}
```

### Task 2D: API Routes (Stubs with Mock Data)

Create `src/routes/wallet.ts`:

```ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/balance', authMiddleware, (req, res) => {
  // For now, return mock data
  res.json({
    usdt_balance: 10000,
    ngn_equivalent: 13480000,
    rate: 1348,
    last_updated: new Date().toISOString(),
  });
});

router.post('/convert', authMiddleware, (req, res) => {
  const { amount_ngn } = req.body;
  const rate = 1348;
  const usdt_equivalent = amount_ngn / rate;
  
  res.json({
    amount_ngn,
    usdt_equivalent: parseFloat(usdt_equivalent.toFixed(2)),
    rate,
  });
});

router.get('/transactions', authMiddleware, (req, res) => {
  res.json({
    transactions: [
      {
        id: 'tx_1',
        type: 'bill',
        amount: 1000,
        currency: 'NGN',
        timestamp: new Date().toISOString(),
        description: 'MTN Data',
        status: 'success',
      },
    ],
  });
});

export default router;
```

Similarly create:
- `src/routes/bills.ts` (GET /list, POST /create, POST /pay)
- `src/routes/links.ts` (GET /list, POST /create, POST /claim, GET /details/:code)
- `src/routes/savings.ts` (GET /list, POST /create, POST /rule)
- `src/routes/auth.ts` (POST /telegram — validate initData)
- `src/routes/webhook.ts` (POST — handle Telegram bot updates)

**All return mock data for now. Real implementation comes Day 2.**

### Task 2E: Telegram Bot (grammy)

Create `src/services/bot.ts`:

```ts
import { Bot } from 'grammy';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set');

export const bot = new Bot(token);

// Commands
bot.command('start', async (ctx) => {
  const webAppUrl = process.env.VERCEL_URL || 'http://localhost:3000';
  
  await ctx.reply('Welcome to SwiftyOS! 🚀', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '💼 Open SwiftyOS',
          web_app: { url: webAppUrl },
        }],
      ],
    },
  });
});

bot.command('wallet', async (ctx) => {
  await ctx.reply('💰 Balance: 10,000 USDT = ₦13.4M\n\nOpen SwiftyOS to manage your wallet.');
});

bot.command('bills', async (ctx) => {
  await ctx.reply('📱 Upcoming Bills:\n\n1. MTN Data - ₦1,000 (Weekly)\n2. Electricity - ₦2,000 (Monthly)\n\nOpen SwiftyOS to manage bills.');
});

bot.command('links', async (ctx) => {
  await ctx.reply('🔗 Your Swifty Links:\n\n1. ₦5,000 Link (Active)\n\nOpen SwiftyOS to manage your links.');
});

export async function setupWebhook(url: string) {
  await bot.api.setWebhook(url);
}
```

Create webhook handler in `src/routes/webhook.ts`:

```ts
import { Router } from 'express';
import { bot } from '../services/bot';

const router = Router();

router.post('/', async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.send('ok');
  } catch (err) {
    console.error(err);
    res.status(500).send('error');
  }
});

export default router;
```

### Task 2F: Test Backend Locally

```bash
npm run dev
# Server should start on localhost:3001

# Test endpoint
curl http://localhost:3000/health
# Should return { "status": "ok" }

# Test API
curl http://localhost:3001/api/wallet/balance \
  -H "x-init-data: ..." 
# Should return mock wallet data
```

---

## Phase 3: Full Implementation (Day 2)

### Day 2 Frontend Tasks

**Task 3A: Connect Frontend to Backend**

Create `src/services/api.ts`:

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const savingsAPI = {
  list: () => apiFetch('/api/savings/list'),
  create: (goal: any) => apiFetch('/api/savings/create', {
    method: 'POST',
    body: JSON.stringify(goal),
  }),
  addRule: (rule: any) => apiFetch('/api/savings/rule/add', {
    method: 'POST',
    body: JSON.stringify(rule),
  }),
};

async function apiFetch(endpoint: string, options?: RequestInit) {
  const initData = window.Telegram?.WebApp?.initData || '';
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-init-data': initData,
      ...options?.headers,
    },
  });
  
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export const walletAPI = {
  getBalance: () => apiFetch('/api/wallet/balance'),
  convert: (amountNgn: number) => apiFetch('/api/wallet/convert', {
    method: 'POST',
    body: JSON.stringify({ amount_ngn: amountNgn }),
  }),
  getTransactions: () => apiFetch('/api/wallet/transactions'),
};

export const billsAPI = {
  list: () => apiFetch('/api/bills/list'),
  create: (bill: any) => apiFetch('/api/bills/create', {
    method: 'POST',
    body: JSON.stringify(bill),
  }),
  pay: (billId: string) => apiFetch('/api/bills/pay', {
    method: 'POST',
    body: JSON.stringify({ bill_id: billId }),
  }),
};

export const linksAPI = {
  list: () => apiFetch('/api/links/list'),
  create: (amountNgn: number) => apiFetch('/api/links/create', {
    method: 'POST',
    body: JSON.stringify({ amount_ngn: amountNgn }),
  }),
  claim: (code: string) => apiFetch('/api/links/claim', {
    method: 'POST',
    body: JSON.stringify({ claim_code: code }),
  }),
  getDetails: (code: string) => apiFetch(`/api/links/details/${code}`),
};
```

**Task 3B: Replace Mock Data with API Calls**

Update `pages/wallet.tsx`:

```tsx
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { walletAPI } from '@/services/api';

export default function WalletScreen() {
  const { wallet, setWallet, isLoading, setIsLoading, error, setError } = useStore();
  
  useEffect(() => {
    async function loadWallet() {
      setIsLoading(true);
      try {
        const data = await walletAPI.getBalance();
        setWallet(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadWallet();
  }, []);
  
  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!isLoading && wallet && (
        <div>
          {/* Render wallet... */}
        </div>
      )}
    </div>
  );
}
```

Do the same for bills.tsx and links.tsx.

**Task 3C: Implement All Modals**

Fully implement:
- Send modal (input, preview, confirm)
- Receive modal (link generation, copy, share)
- Convert modal (amount calculation, confirm)
- Add bill modal (provider select, amount, frequency)
- Create Link modal (amount calculation, confirm, share)
- Payment confirm modal (generic, reusable)

### Day 2 Backend Tasks

**Task 4A: Implement Services**

Create `src/services/wallet.ts`:

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WalletService {
  async getBalance(userId: number) {
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
    });
    
    if (!wallet) {
      // Create default wallet
      return prisma.wallet.create({
        data: {
          user_id: userId,
          usdt_balance: 10000,
        },
      });
    }
    
    return wallet;
  }
  
  async convert(userId: number, amountNgn: number, rate: number) {
    const usdt = amountNgn / rate;
    const wallet = await this.getBalance(userId);
    
    if (wallet.usdt_balance < usdt) {
      throw new Error('Insufficient balance');
    }
    
    // Deduct USDT
    await prisma.wallet.update({
      where: { user_id: userId },
      data: {
        usdt_balance: wallet.usdt_balance - usdt,
      },
    });
    
    return { amount_ngn: amountNgn, usdt_equivalent: usdt };
  }
}
```

Create `src/services/bills.ts`:

```ts
export class BillService {
  async createBill(userId: number, billData: any) {
    const bill = await prisma.bill.create({
      data: {
        user_id: userId,
        provider: billData.provider,
        amount_ngn: billData.amount_ngn,
        frequency: billData.frequency,
        next_payment: new Date(Date.now() + 86400000), // Tomorrow
      },
    });
    
    return bill;
  }
  
  async listBills(userId: number) {
    return prisma.bill.findMany({
      where: { user_id: userId },
      orderBy: { next_payment: 'asc' },
    });
  }
  
  async payBill(userId: number, billId: number) {
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
    });
    
    if (!bill) throw new Error('Bill not found');
    
    // Create payment record
    await prisma.billPayment.create({
      data: {
        user_id: userId,
        bill_id: billId,
        amount_ngn: bill.amount_ngn,
        paid_at: new Date(),
      },
    });
    
    // Deduct from wallet
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
    });
    if (!wallet) throw new Error('Wallet not found');
    
    const usdtCost = bill.amount_ngn / 1348; // Rate
    await prisma.wallet.update({
      where: { user_id: userId },
      data: {
        usdt_balance: wallet.usdt_balance - usdtCost,
      },
    });
    
    return { success: true };
  }
}
```

Do the same for `src/services/links.ts`.

**Task 4B: Connect Routes to Services**

Update `src/routes/bills.ts`:

```ts
import { Router } from 'express';
import { BillService } from '../services/bills';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const billService = new BillService();

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const bills = await billService.listBills(userId);
    res.json({ bills });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const bill = await billService.createBill(userId, req.body);
    res.json({ bill });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/pay', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const result = await billService.payBill(userId, req.body.bill_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
```

**Task 4C: Deploy Backend**

```bash
# Deploy to Railway
npm i -g railway
railway login
railway init
railway add
railway up
```

Note the deployed URL (e.g., https://swiftyos-backend.railway.app).

Set in frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=https://swiftyos-backend.railway.app
```

---

## Phase 4: Polish & Demo (Day 3)

### Day 3 Tasks

1. **End-to-end testing**
    - Open /wallet → should load real balance
    - Tap Send → fill form → confirm → should update balance
    - Same for bills and splits
    - Check for errors, fix any crashes

2. **UI Polish**
    - Add loading animations (spinners)
    - Add success animations (confetti, checkmarks)
    - Add error handling (toast notifications)
    - Ensure responsive on mobile

3. **Demo Preparation**
    - Write demo script (see SCOPE.md for template)
    - Rehearse 2-3 times
    - Test all flows work under pressure

4. **Final Deploy**
    - Push to GitHub
    - Redeploy to Vercel (frontend)
    - Redeploy to Railway (backend)
    - Update bot webhook URL
    - Test `/start` command opens Mini App

---

## Code Quality Checklist

Before Day 3 demo:

- [ ] TypeScript strict mode, no `any` types
- [ ] All components have proper error boundaries
- [ ] All API calls wrapped in try-catch
- [ ] Loading states on all async operations
- [ ] Error messages are user-friendly
- [ ] Mobile responsive (test on phone)
- [ ] Zero console errors
- [ ] All interactive elements accessible (ARIA labels)
- [ ] Code is commented where non-obvious
- [ ] Git history is clean

---

## Critical Success Factors

1. **Focus on 3 modules:** Don't add AI, savings, or future features
2. **Mock early, real API late:** Get all UI working before backend is ready
3. **Test constantly:** Every 30 min, test in browser
4. **Commit often:** Deploy early, deploy often
5. **Demo matters more than code:** Judges see the UI, not your architecture

---

## If Something Breaks

**Issue: Frontend won't connect to backend**
→ Check CORS headers in Express
→ Check API URL in `.env.local`
→ Test endpoint with `curl`

**Issue: Telegram SDK not loading**
→ Make sure you're in a Telegram Mini App context
→ Check Telegram bot webhook is set correctly

**Issue: Database won't migrate**
→ Delete `prisma/dev.db`
→ Run `npx prisma migrate dev --name init` again

**Issue: Running out of time**
→ Ship what you have (even if not perfect)
→ Hardcode demo data if needed
→ The demo matters more than production code

Good luck. You got this. 🚀