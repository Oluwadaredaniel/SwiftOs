# DEPLOYMENT.md
## Shipping SwiftyOS to Production

---

## Pre-Deployment Checklist

Before pushing to production:

- [ ] All tests pass locally
- [ ] Zero console errors
- [ ] TypeScript compiles (`npm run build`)
- [ ] Frontend responsive (tested on mobile)
- [ ] API endpoints respond with correct data
- [ ] Database migrations run without error
- [ ] Environment variables are set in hosting dashboards
- [ ] Git is clean (all changes committed)

---

## Local to Staging (Day 2-3)

### Frontend: Deploy to Vercel (Easy)

**First time:**
```bash
npm i -g vercel
vercel login         # Sign up with GitHub
cd swiftyos
vercel --prod        # Deploy to production
```

Vercel will output: `https://swiftyos.vercel.app`

**Subsequent pushes:**
```bash
git push origin main  # Vercel auto-deploys on push
```

To manually deploy:
```bash
vercel --prod
```

### Backend: Deploy to Railway

**First time:**
```bash
npm i -g railway
railway login        # Sign up with GitHub
cd swiftyos-backend
railway init         # Create new project
railway add          # Add PostgreSQL (optional, use SQLite for hackathon)
railway up           # Deploy
```

Railway will output: `https://swiftyos-backend.railway.app`

**Subsequent pushes:**
```bash
git push origin main  # Railway auto-deploys on push
```

To manually deploy:
```bash
railway up
```

### Database: Initialize on Production

**SQLite (easiest for hackathon):**
```bash
# Just push code; database file is created automatically
```

**PlanetScale (if you want managed DB):**

1. Create free account: https://planetscale.com
2. Create database named `swiftyos`
3. Get connection string
4. Set `DATABASE_URL` in Railway dashboard
5. Run migrations:
   ```bash
   DATABASE_URL=<your_url> npx prisma migrate deploy
   ```

---

## Setting Up Telegram Bot Webhook

After deploying backend, register webhook with Telegram:

```bash
curl -X POST https://api.telegram.org/bot{TOKEN}/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://swiftyos-backend.railway.app/webhook"}'
```

**Verify webhook is set:**
```bash
curl https://api.telegram.org/bot{TOKEN}/getWebhookInfo
```

Should return:
```json
{
  "url": "https://swiftyos-backend.railway.app/webhook",
  "has_custom_certificate": false,
  "pending_update_count": 0
}
```

---

## Connect Frontend to Production Backend

Update frontend environment on Vercel:

1. Go to Vercel dashboard
2. Select `swiftyos` project
3. Click "Settings"
4. Go to "Environment Variables"
5. Add/update:
   ```
   NEXT_PUBLIC_API_URL = https://swiftyos-backend.railway.app
   NEXT_PUBLIC_USE_MOCK = false
   ```
6. Redeploy:
   ```bash
   vercel --prod
   ```

---

## Testing Production Deployment

### Test 1: Frontend Loads
```bash
curl https://swiftyos.vercel.app
# Should return HTML
```

### Test 2: API Responds
```bash
curl -H "x-init-data: test" https://swiftyos-backend.railway.app/health
# Should return { "status": "ok" }
```

### Test 3: Bot Webhook Works
Send a message to your bot in Telegram. It should respond with `/start` command menu.

### Test 4: Mini App Opens
1. Open Telegram
2. Find your bot (@SwiftyOS_bot)
3. Send `/start`
4. Tap "Open SwiftyOS" button
5. Mini App should load on vercel.app domain

### Test 5: User Flow
In the Mini App:
1. [ ] Balance loads (from backend API)
2. [ ] Can send money (updates state)
3. [ ] Can create bill (saved to backend)
4. [ ] Can split payment (all participants list)
5. [ ] Transaction history shows all actions

---

## Rollback (If Something Breaks)

### Frontend
```bash
vercel rollback
# Revert to previous deployment
```

Or redeploy specific commit:
```bash
git revert <commit_hash>
git push origin main
```

### Backend
```bash
railway rollback
```

Or manually:
```bash
git revert <commit_hash>
git push origin main
railway up
```

---

## Monitoring & Debugging

### Frontend (Vercel)

View logs:
```bash
vercel logs              # Real-time logs
vercel logs --follow     # Stream logs
```

### Backend (Railway)

View logs in Railway dashboard:
1. Open project
2. Click "Deployments"
3. Select latest deployment
4. View build + runtime logs

Or via CLI:
```bash
railway logs
railway logs --follow
```

### Database Issues

Check PlanetScale dashboard:
- Connections used
- Slow queries
- Backup status

For SQLite, inspect locally:
```bash
sqlite3 data.db ".tables"
```

---

## Performance Optimization

### Frontend

```bash
# Check bundle size
npm run build
# Look for warnings about large chunks
```

Optimize with:
- Image optimization (Next.js Image component)
- Code splitting (dynamic imports)
- Remove unused packages

### Backend

```bash
# Check database query performance
DATABASE_URL=... npx prisma studio
# Inspect data, run queries
```

Optimize with:
- Database indexes (on frequently queried fields)
- Query pagination (limit results)
- Caching (Redis if needed)

---

## Environment-Specific Behavior

### Development (localhost)
```bash
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_URL=http://localhost:3001
```
- Mock data
- Fast feedback
- Easy debugging

### Staging (vercel.app / railway.app)
```bash
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=https://swiftyos-backend.railway.app
```
- Real API (if available)
- Production-like environment
- Public tests

### Production (custom domain, if later)
```bash
NEXT_PUBLIC_API_URL=https://api.swiftyos.app
```
- Real API
- Custom domain
- Monitoring & analytics

---

## Scaling After Hackathon

### Database
- Migrate from SQLite to PlanetScale
- Add indexes on `user_id`, `split_id`, `bill_id`
- Set up automated backups

### Backend
- Add caching (Redis)
- Add rate limiting
- Add request logging
- Set up error monitoring (Sentry)

### Frontend
- Add analytics (Vercel Analytics)
- Monitor Core Web Vitals
- Set up A/B testing

---

## Continuous Deployment (Optional)

With GitHub Actions, every push to `main` auto-deploys:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - run: railway up --token ${{ secrets.RAILWAY_TOKEN }}
```

---

## Troubleshooting Deployment

**Issue: "Vercel build fails"**
- Check build logs in Vercel dashboard
- Make sure all imports are correct
- Check environment variables are set
- Test `npm run build` locally first

**Issue: "Railway deployment hangs"**
- Check if database migration is stuck
- Restart deployment
- Check logs for errors
- Verify DATABASE_URL is correct

**Issue: "Bot webhook not receiving updates"**
- Check webhook URL is correct: `railway logs`
- Check bot token is set
- Send test update: `/start` command in Telegram
- Check if webhook secret is correct (advanced)

**Issue: "Frontend can't reach backend"**
- Check `NEXT_PUBLIC_API_URL` is set in Vercel
- Test backend is running: `curl <url>/health`
- Check CORS headers in Express
- Verify both are on public HTTPS (required for Mini App)

**Issue: "Database migration fails"**
- Check `DATABASE_URL` format is correct
- Verify database exists
- Run migration locally first to test
- Check Prisma schema is valid

---

## Security Checklist

Before going live:

- [ ] Remove console.logs with sensitive data
- [ ] Set secure CORS origin (not `*`)
- [ ] Validate all user input on backend
- [ ] Use HTTPS everywhere (automatic on Vercel + Railway)
- [ ] Rotate bot token if ever exposed
- [ ] Don't log full API responses
- [ ] Set rate limits on endpoints
- [ ] Use environment variables for all secrets

---

## Final Checklist (Before Demo)

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Database initialized and migrated
- [ ] Bot webhook set to production URL
- [ ] Frontend API URL points to production backend
- [ ] All 3 modules working (Wallet, Bills, Splits)
- [ ] Zero console errors
- [ ] Bot `/start` command opens Mini App
- [ ] Demo script rehearsed
- [ ] Judges can test live

You're ready to ship. Good luck! 🚀