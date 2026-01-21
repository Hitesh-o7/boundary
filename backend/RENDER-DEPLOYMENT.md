# Render Deployment Guide - Fix "Table Does Not Exist" Error

## The Problem

**Error:** `table 'public.Delivery' does not exist`

**Root Cause:** Migrations were NOT run on your production database.

## The Solution

### Step 1: Verify Local Migrations Work

Before deploying, test locally:

```bash
cd backend

# Generate Prisma Client
bun run prisma:generate

# Check what migrations exist
bunx prisma migrate status

# Apply all pending migrations
bunx prisma migrate deploy
```

You should see:
```
✓ Database is in sync with Prisma schema
```

### Step 2: Configure Render Build Command

In your Render service settings, set:

**Build Command:**
```bash
cd backend && bun install && bunx prisma generate && bunx prisma migrate deploy
```

**Why each part:**
- `cd backend` → Navigate to backend folder
- `bun install` → Install dependencies
- `bunx prisma generate` → Generate Prisma Client for production
- `bunx prisma migrate deploy` → **Run migrations on production DB**

**Start Command:**
```bash
cd backend && bun run start
```

### Step 3: Set Environment Variables in Render

**Required:**
```env
DATABASE_URL=postgresql://user:pass@host:port/dbname?schema=public
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://your-frontend.vercel.app
```

**CRITICAL:** Ensure `DATABASE_URL` points to your **Render PostgreSQL** instance!

### Step 4: Deploy

1. Push your code to GitHub
2. Render will automatically deploy
3. **Watch the build logs** for:

```
✓ Migrations applied successfully
[Prisma] ✅ Database connected successfully
Boundary Insights backend listening on port 4000
```

### Step 5: Verify Tables Exist

Connect to your Render PostgreSQL database:

```bash
# Get connection string from Render dashboard
psql "your-render-postgres-url"

# List all tables
\dt

# Should see:
# public | Season   | table | ...
# public | Team     | table | ...
# public | Player   | table | ...
# public | Match    | table | ...
# public | Delivery | table | ...
```

If `Delivery` table is missing, migrations didn't run!

### Step 6: Manual Migration (If Auto-Deploy Failed)

If migrations still aren't running, manually deploy them:

```bash
# From your local machine, connecting to Render DB
DATABASE_URL="your-render-postgres-url" bunx prisma migrate deploy

# Or from Render shell (if available)
bunx prisma migrate deploy
```

## Common Mistakes

### ❌ Wrong: Build command without migrations
```bash
bun install && bun run build
```

### ✅ Correct: Build command WITH migrations
```bash
cd backend && bun install && bunx prisma generate && bunx prisma migrate deploy && bun run build
```

### ❌ Wrong: DATABASE_URL points to local DB
```env
DATABASE_URL=postgresql://localhost:5432/boundary_insights
```

### ✅ Correct: DATABASE_URL points to Render PostgreSQL
```env
DATABASE_URL=postgresql://boundary_user:xxx@oregon-postgres.render.com/boundary_db_xxx
```

## Schema Changes Made

### Enhanced All Models with Explicit Table Mapping

**Added `@@map("TableName")` to all models:**

```prisma
model Season {
  ...
  @@map("Season")  // ← Explicit table name
}

model Team {
  ...
  @@map("Team")
}

model Player {
  ...
  @@map("Player")
}

model Match {
  ...
  @@map("Match")
}

model Delivery {
  ...
  @@map("Delivery")  // ← Critical for analytics queries
}
```

**Why:**
- Makes table names explicit (no ambiguity)
- PostgreSQL uses quoted identifiers → case-sensitive
- Ensures Prisma looks for exact table name `"Delivery"` not `"delivery"`

## After Deployment

### Test All Analytics Endpoints

```bash
# Replace with your Render URL
export RENDER_URL="https://your-app.onrender.com"

# 1. Health check
curl $RENDER_URL/

# 2. Team performance (uses Match + Team tables)
curl $RENDER_URL/api/analytics/team-performance

# 3. Top batsmen (uses Delivery + Player tables)
curl $RENDER_URL/api/analytics/top-batsmen?limit=5

# 4. Top bowlers (uses Delivery + Player tables)
curl $RENDER_URL/api/analytics/top-bowlers?limit=5
```

**Expected Results:**

✅ All return JSON arrays:
```json
[
  {"playerId": 1, "playerName": "Player Name", "totalRuns": 500},
  ...
]
```

❌ If you get this:
```json
{
  "error": "Failed to fetch top bowlers",
  "message": "table 'public.Delivery' does not exist"
}
```

**Solution:** Migrations didn't run! Check build logs and re-run:
```bash
DATABASE_URL="render-url" bunx prisma migrate deploy
```

## Debugging Production Errors

### Check Render Logs

Look for these log patterns:

**✅ Success:**
```
[Prisma] Initializing with log levels: error, warn
[Prisma] DATABASE_URL set: true
[Prisma] ✅ Database connected successfully
Boundary Insights backend listening on port 4000
```

**❌ Failure:**
```
[Prisma] ❌ Database connection FAILED
[Service] CRITICAL ERROR in getTopBowlers
Error code: P2021
table 'public.Delivery' does not exist
```

### Error Code Reference

- **P2021** → Table doesn't exist → **Run migrations**
- **P1001** → Can't reach DB → **Check DATABASE_URL**
- **P1002** → Timeout → **Check DB connection limits**
- **P2002** → Unique constraint → **Check duplicate data**

## Import Data After Migrations

After tables are created, import your IPL data:

```bash
# Option 1: One-time job in Render
bunx bun run scripts/importIplData.ts

# Option 2: From local machine to Render DB
DATABASE_URL="render-db-url" bun run import:ipl
```

## Summary

**What Was Fixed:**

1. ✅ Added explicit `@@map()` to all models
2. ✅ Enhanced error logging shows exact table name issues
3. ✅ Database connection test on startup
4. ✅ Try-catch blocks prevent 502, return 500 with details

**What You Need to Do:**

1. Update Render build command to include `bunx prisma migrate deploy`
2. Verify `DATABASE_URL` points to Render PostgreSQL
3. Deploy and watch logs for migration success
4. Test all `/api/analytics/*` endpoints
5. Import data if needed

**Result:**

- ✅ No more 502 errors
- ✅ Detailed error messages if issues occur
- ✅ Tables exist in production
- ✅ Analytics routes return real data
