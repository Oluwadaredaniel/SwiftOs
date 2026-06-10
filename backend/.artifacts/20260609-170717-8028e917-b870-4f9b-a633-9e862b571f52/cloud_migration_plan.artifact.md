# SwiftyOS Cloud Migration Plan

## 1. Fix Render Deployment (Backend)
Render is failing because it's looking for `package.json` in the root, but our backend is in the `backend/` folder.

- **Action:** In your Render Dashboard, go to **Settings** -> **Root Directory** and set it to `backend`.
- **Alternative:** If you can't find that setting, change your **Build Command** to `cd backend && npm install && npm run build` and your **Start Command** to `cd backend && npm start`.

## 2. Database: PostgreSQL (Supabase)
We need to update the backend to use PostgreSQL instead of SQLite.

### Steps:
1. Get the **Transaction Connection String** from Supabase (Settings -> Database). It should look like: `postgres://postgres.[ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`.
2. Update `.env` in the backend with this URL.

### Code Updates:
#### [schema.prisma](file:///C:/Users/hp/Documents/Code Projects/Swift/backend/prisma/schema.prisma)
- Change `provider = "sqlite"` to `provider = "postgresql"`.
- Run `npx prisma generate`.
- Run `npx prisma migrate dev --name init_postgres`.

## 3. Frontend: Vercel
- **Root Directory:** Set to `frontend`.
- **Environment Variable:** `NEXT_PUBLIC_API_URL` = Your Render Backend URL.
