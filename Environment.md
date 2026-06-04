# ENVIRONMENT.md
## Configuration & Environment Variables

---

## .env.example (Frontend)

Create `swiftyos/.env.local.example`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCK=true

# Telegram
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=SwiftyOS_bot
```

Copy to `.env.local` and update:
```bash
cp .env.local.example .env.local
```

**Important:** Never commit `.env.local`. It's in `.gitignore`.

---

## .env.example (Backend)

Create `swiftyos-backend/.env.example`:

```bash
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=file:./data.db

# Telegram
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_BOT_SECRET=your_secret_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# SwiftyEx API (when available)
SWIFTYEX_API_KEY=sk_test_...
SWIFTYEX_API_SECRET=...
SWIFTYEX_API_BASE=https://api.staging.swiftyex.com

# Vercel (for production)
VERCEL_URL=https://swiftyos-backend.railway.app
```

Copy to `.env` and fill in values:
```bash
cp .env.example .env
```

---

## Getting Telegram Bot Token

1. Open Telegram
2. Search for `@BotFather`
3. Send `/newbot`
4. Follow prompts:
    - Bot name: `SwiftyOS`
    - Bot username: `SwiftyOS_bot` (must end in `_bot`)
5. @BotFather will send you the token
6. Copy token to `TELEGRAM_BOT_TOKEN` in `.env`

Example token: `123456:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh`

---

## Local Development Setup

### Step 1: Clone & Install

```bash
git clone <repo>
cd swiftyos

# Frontend
npm install

# Backend (in separate terminal)
cd ../swiftyos-backend
npm install
```

### Step 2: Configure

**Frontend:**
```bash
cd swiftyos
cp .env.local.example .env.local
# Leave defaults (localhost API, USE_MOCK=true)
```

**Backend:**
```bash
cd ../swiftyos-backend
cp .env.example .env

# Edit .env
TELEGRAM_BOT_TOKEN=your_token_from_botfather
DATABASE_URL=file:./data.db
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Step 3: Initialize Database

```bash
cd swiftyos-backend
npx prisma migrate dev --name init
```

This creates `data.db` with schema.

### Step 4: Start Dev Servers

**Terminal 1 (Frontend):**
```bash
cd swiftyos
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 (Backend):**
```bash
cd swiftyos-backend
npm run dev
# Runs on http://localhost:3001
```

### Step 5: Test Locally

Open http://localhost:3000 in browser.

If using Telegram Mini App:
- Start @SwiftyOS_bot in Telegram
- Send `/start`
- Tap button to open Mini App
- Mini App loads on localhost:3000

**If button doesn't open app:** Set webhook in @BotFather and ensure bot is in debug mode.

---

## Production Configuration

### Frontend (Vercel)

1. **Connect GitHub repo to Vercel**
   ```bash
   vercel login
   vercel link
   ```

2. **Set environment variables in Vercel dashboard:**
   ```
   NEXT_PUBLIC_API_URL = https://swiftyos-backend.railway.app
   NEXT_PUBLIC_USE_MOCK = false
   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME = SwiftyOS_bot
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

   Vercel will output your live URL (e.g., `https://swiftyos.vercel.app`).

### Backend (Railway)

1. **Login to Railway:**
   ```bash
   railway login
   ```

2. **Create project:**
   ```bash
   railway init
   ```

3. **Set environment variables in Railway dashboard:**
   ```
   NODE_ENV = production
   PORT = 3000 (Railway assigns this)
   DATABASE_URL = [PlanetScale URL from connection string]
   TELEGRAM_BOT_TOKEN = [same as local]
   TELEGRAM_BOT_SECRET = [same as local]
   FRONTEND_URL = https://swiftyos.vercel.app
   VERCEL_URL = [your railway app URL]
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

   Railway will output your live URL (e.g., `https://swiftyos-backend.railway.app`).

### Database (PlanetScale)

1. **Create free account:** https://planetscale.com

2. **Create database:**
    - Click "Create database"
    - Name: `swiftyos`
    - Region: US

3. **Get connection string:**
    - Click "Connect"
    - Copy "Prisma" URL
    - Paste to `DATABASE_URL` in Railway dashboard

4. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

---

## Environment Variables Reference

### Frontend

| Variable | Example | Used For |
|----------|---------|----------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | API base URL (public, sent to browser) |
| `NEXT_PUBLIC_USE_MOCK` | `true` | Use mock data (for development) |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | `SwiftyOS_bot` | Bot name in Telegram |

### Backend

| Variable | Example | Used For |
|----------|---------|----------|
| `NODE_ENV` | `development` | Logging, error handling |
| `PORT` | `3001` | Server port |
| `DATABASE_URL` | `file:./data.db` | SQLite file path (dev) or PlanetScale URL (prod) |
| `TELEGRAM_BOT_TOKEN` | `123456:ABC...` | Telegram bot auth |
| `TELEGRAM_BOT_SECRET` | `my_secret_123` | Webhook validation |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin |
| `VERCEL_URL` | `https://swiftyos-backend.railway.app` | Public API URL |
| `SWIFTYEX_API_KEY` | `sk_test_...` | SwiftyEx API auth (optional, for real API) |
| `SWIFTYEX_API_SECRET` | `...` | SwiftyEx API secret (optional) |

---

## Mock Mode vs Real API

### Development (Mock Mode)

```bash
# Frontend .env.local
NEXT_PUBLIC_USE_MOCK=true
```

All API calls return fake data. Useful for:
- Frontend development without backend
- Testing UI without hitting real endpoints
- Demo without real credentials

### Production (Real API)

```bash
# Frontend .env.local
NEXT_PUBLIC_USE_MOCK=false

# Backend .env
SWIFTYEX_API_KEY=sk_live_...
SWIFTYEX_API_SECRET=...
```

Backend calls real SwiftyEx API. To enable:
1. Get SwiftyEx API credentials
2. Update backend `.env`
3. Set `USE_MOCK=false` on frontend
4. Redeploy both

---

## Secrets Management

### Local Development
- Store in `.env` (never commit)
- Load with `dotenv` package

### Production (Vercel + Railway)
- Store in dashboard (encrypted)
- Never paste in code or GitHub
- Rotate regularly

### GitHub Actions (if CI/CD)
- Use repository secrets
- Reference as `${{ secrets.TELEGRAM_BOT_TOKEN }}`

---

## Debugging

### Check if Environment Variables Loaded

**Frontend:**
```ts
console.log(process.env.NEXT_PUBLIC_API_URL);
// Should print the API URL
```

**Backend:**
```ts
console.log(process.env.TELEGRAM_BOT_TOKEN);
// Should print the bot token (don't do this in production!)
```

### Test API Connection

```bash
curl -H "x-init-data: test" http://localhost:3001/api/wallet/balance
# Should return 401 (invalid initData) or wallet data
```

### Check Telegram Bot Token

```bash
curl https://api.telegram.org/bot{TOKEN}/getMe
# Should return bot info
```

---

## Common Issues

**Issue: "Cannot find module 'dotenv'"**
```bash
npm install dotenv
```

**Issue: "NEXT_PUBLIC_API_URL is undefined"**
- Make sure variable starts with `NEXT_PUBLIC_`
- Restart dev server (`npm run dev`)

**Issue: "DATABASE_URL not found"**
- Check `.env` exists in root of `swiftyos-backend/`
- Make sure you didn't use `.env.local` (use `.env` for backend)

**Issue: "Telegram bot not responding"**
- Check `TELEGRAM_BOT_TOKEN` is correct
- Check bot webhook is set (for web apps)
- Make sure bot is not already running elsewhere

**Issue: Frontend can't reach backend**
- Check `NEXT_PUBLIC_API_URL` is correct
- Check backend is running (`npm run dev`)
- Check CORS is enabled in Express
- Test with `curl` from terminal first

---

## Before Shipping

Checklist:
- [ ] `.env` and `.env.local` are in `.gitignore`
- [ ] No secrets in code or comments
- [ ] Environment variables are set in Vercel + Railway dashboards
- [ ] Database is migrated on production
- [ ] Bot webhook is set to production URL
- [ ] Frontend API URL points to production backend
- [ ] Test end-to-end flow in production