# DEPENDENCIES.md
## Packages & Why Each One

---

## Frontend Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "@tailwindcss/forms": "^0.5.4",
    "zustand": "^4.4.0",
    "framer-motion": "^10.16.0",
    "@telegram-apps/sdk": "^0.1.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-form": "^0.0.3",
    "@radix-ui/react-popover": "^1.0.0",
    "@radix-ui/react-toast": "^1.1.0",
    "@radix-ui/react-slot": "^1.0.0",
    "lucide-react": "^0.284.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### Why Each Package

| Package | Why |
|---------|-----|
| **next** | React framework with built-in SSR, routing, API routes (backend can be Next.js API routes) |
| **react** | Core UI library, team familiar, huge ecosystem |
| **tailwindcss** | Rapid CSS utility classes, dark mode built-in, mobile-first |
| **zustand** | Lightweight state (30KB), simpler than Redux, perfect for hackathon |
| **framer-motion** | Smooth animations, spring physics, low learning curve |
| **@telegram-apps/sdk** | Official Telegram SDK for Mini Apps |
| **@radix-ui/react-*** | Unstyled UI primitives for accessible, customizable components |
| **lucide-react** | Lightweight icon library |

---

## Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.0",
    "dotenv": "^16.3.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "grammy": "^1.20.0",
    "crypto": "built-in"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "nodemon": "^3.0.0"
  }
}
```

### Why Each Package

| Package | Why |
|---------|-----|
| **express** | Lightweight HTTP server, perfect for simple APIs |
| **cors** | Handle cross-origin requests (frontend on Vercel, backend on Railway) |
| **dotenv** | Environment variables (API keys, tokens) |
| **prisma** | TypeScript ORM, auto-migrations, SQLite for dev, scales to Postgres |
| **grammy** | Modern Telegram bot library, TypeScript-first |
| **tsx** | Run TypeScript directly without build step |

---

## Database Choices

### Development (SQLite)
- No setup required
- File-based (`./data.db`)
- Perfect for hackathon prototyping
- Migrate to Postgres later if needed

### Production (PlanetScale or Turso)
- Serverless MySQL/PostgreSQL
- Free tier sufficient for hackathon
- Easy migration from SQLite

```bash
# Prisma handles both seamlessly
# Just change DATABASE_URL in .env
```

---

## Hosting Choices

### Frontend (Vercel)
- Free tier: Unlimited builds & deployments
- Built-in Next.js optimizations
- Edge functions (if needed)
- Automatic HTTPS, CDN

**Deploy:**
```bash
vercel --prod
```

### Backend (Railway or Render)
- Railway: $5/month free credits (enough for hackathon)
- Render: Free tier with cold starts
- Both support Node.js with zero config

**Deploy:**
```bash
# Railway
railway up

# Or Render
render deploy
```

### Database (SQLite dev, PlanetScale prod)
- SQLite file in repo (not recommended prod, but fine for demo)
- PlanetScale: Free tier, instant scaling
- Turso: Similar to PlanetScale

---

## Why NOT Certain Packages

| Package | Why We Skip It |
|---------|---|
| Redux | Too much boilerplate for 72-hour hackathon |
| Apollo/GraphQL | REST API is simpler, less setup |
| NestJS | Too heavyweight; Express is enough |
| Webpack | Next.js handles bundling automatically |
| Tailwind UI / Shadcn | We'll build custom components to match design |
| Jest/Vitest | No time for unit tests; integration testing > unit testing |
| Stripe | Payment already handled by SwiftyEx / VTpass APIs |

---

## Package Install Command

```bash
# Frontend
npm create next-app@latest swiftyos --typescript --tailwind --eslint
cd swiftyos
npm install zustand framer-motion @telegram-apps/sdk lucide-react @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-form @radix-ui/react-popover @radix-ui/react-toast @radix-ui/react-slot

# Backend (separate folder)
mkdir swiftyos-backend && cd swiftyos-backend
npm init -y
npm install express cors dotenv prisma @prisma/client grammy
npm install -D typescript @types/express @types/node tsx nodemon

# Initialize Prisma
npx prisma init
```

---

## Version Pinning Strategy

**For hackathon: pin to latest stable versions.**

```json
{
  "dependencies": {
    "next": "14.0.3",
    "react": "18.2.0",
    "zustand": "4.4.1",
    "framer-motion": "10.16.4"
  }
}
```

**After hackathon:** use `^` for minor version bumps:
```json
{
  "dependencies": {
    "next": "^14.0.0"
  }
}
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Mini App load | < 2s |
| API response | < 500ms |
| Database query | < 100ms |
| Bundle size | < 150KB (gzipped) |
| Lighthouse score | > 90 |

**Strategies:**
- Next.js Image optimization
- Code splitting with dynamic imports
- Memoization with `React.memo`
- Zustand for minimal re-renders
- SQLite indexes on common queries

---

## Troubleshooting Dependencies

**Issue: Tailwind classes not applying**
```bash
# Make sure postcss.config.js exists
# and tailwind.config.js has correct paths
npm run dev  # Restart dev server
```

**Issue: Prisma client not found**
```bash
npx prisma generate
npm i @prisma/client
```

**Issue: Telegram SDK not loading**
- Ensure app is in Telegram context
- Check script tag in `_app.tsx`
- Verify bot token is set

**Issue: CORS errors**
```ts
// In Express
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

---

## Summary

**Frontend stack:** Next.js + React + Tailwind + Zustand + Framer Motion  
**Backend stack:** Express + Prisma + SQLite + grammy  
**Database:** SQLite (dev) → PlanetScale (prod)  
**Hosting:** Vercel (frontend) + Railway (backend)

All packages are battle-tested, production-ready, but lightweight enough for rapid development.