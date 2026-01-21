# Boundary Insights - Complete Setup Guide (Bun)

This guide will help you set up and run Boundary Insights using **Bun** as the runtime.

## Prerequisites

1. **Bun** installed (v1.0+)
   - Install from: https://bun.sh
   - Verify: `bun --version`

2. **PostgreSQL** installed and running
   - PostgreSQL 14+ recommended
   - You'll need a database created (we'll do this in setup)

3. **Node.js** (optional, for Next.js frontend)
   - Next.js can run with Bun, but if you prefer Node: Node.js 18+

---

## Project Structure

```
boundary-insights/
├── backend/              # Express + TypeScript API
│   ├── data/ipl/        # Your IPL JSON files go here (NOT in public)
│   ├── prisma/          # Database schema & migrations
│   ├── scripts/         # Data ingestion script
│   └── src/             # Backend source code
└── frontend/            # Next.js frontend (or boundary-insights-frontend/)
    ├── app/             # Next.js App Router pages
    └── src/             # Frontend source code
```

---

## Step-by-Step Setup

### Step 1: Install Dependencies

#### Backend
```bash
cd backend
bun install
```

#### Frontend
```bash
cd frontend  # or boundary-insights-frontend
bun install
```

---

### Step 2: Database Setup

#### 2.1 Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE boundary_insights;

# Exit psql
\q
```

#### 2.2 Configure Environment Variables

**Backend** - Create `backend/.env`:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/boundary_insights?schema=public"

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS (Frontend URL)
CORS_ORIGIN=http://localhost:3000

# API Base URL
API_BASE_URL=http://localhost:4000
```

**Frontend** - Create `frontend/.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

> **Note**: Replace `username:password` with your actual PostgreSQL credentials.

---

### Step 3: Database Schema Migration

```bash
cd backend

# Generate Prisma Client
bun run prisma:generate

# Run migrations to create tables
bun run prisma:migrate

# (Optional) Open Prisma Studio to inspect database
bun run prisma:studio
```

This creates all tables: `Season`, `Team`, `Player`, `Match`, `Delivery`.

---

### Step 4: Import IPL Data

**IMPORTANT**: Your IPL JSON files must be placed in `backend/data/ipl/` (not in public folder).

The ingestion script will:
- Recursively scan all JSON files in `backend/data/ipl/`
- Parse each match JSON
- Normalize and insert into PostgreSQL
- Skip duplicates (idempotent)

#### Run Import Script:

```bash
cd backend
bun run import:ipl
```

**Expected Output:**
```
Starting IPL data import for Boundary Insights...
Data root: /path/to/backend/data/ipl
Found 500 JSON files to process.
Imported match from match_info/match1.json
Imported match from match_info/match2.json
...
```

**Troubleshooting:**
- If you get "No such file or directory" for `data/ipl`, make sure JSON files are in `backend/data/ipl/`
- If you get database connection errors, check your `DATABASE_URL` in `.env`
- If imports fail for specific files, check the JSON structure matches expected format

---

### Step 5: Start Backend Server

```bash
cd backend
bun run dev
```

**Expected Output:**
```
Boundary Insights backend listening on port 4000
```

**Verify it's working:**
- Open http://localhost:4000/api/health
- Open http://localhost:4000/docs (Swagger UI)

---

### Step 6: Start Frontend Development Server

```bash
cd frontend  # or boundary-insights-frontend
bun run dev
```

**Expected Output:**
```
▲ Next.js 14.2.3
- Local:        http://localhost:3000
```

**Verify it's working:**
- Open http://localhost:3000
- You should see the Dashboard with charts and data

---

## Verification Checklist

✅ Backend is running on `http://localhost:4000`  
✅ Frontend is running on `http://localhost:3000`  
✅ Health check works: `http://localhost:4000/api/health`  
✅ Swagger docs accessible: `http://localhost:4000/docs`  
✅ Database has data (check via `bun run prisma:studio`)  
✅ Frontend can fetch data from backend APIs  

---

## Common Issues & Solutions

### Issue: "Cannot find module '@prisma/client'"
**Solution**: Run `bun run prisma:generate` in the backend folder.

### Issue: "DATABASE_URL not set"
**Solution**: Make sure `backend/.env` exists and has `DATABASE_URL` set correctly.

### Issue: "Port 4000 already in use"
**Solution**: Either stop the process using port 4000, or change `PORT` in `backend/.env`.

### Issue: Frontend can't connect to backend
**Solution**: 
- Verify backend is running
- Check `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local` matches backend URL
- Check CORS settings in backend (ensure `CORS_ORIGIN` includes frontend URL)

### Issue: "No data showing in frontend"
**Solution**:
- Run the import script: `cd backend && bun run import:ipl`
- Check database has data: `bun run prisma:studio`
- Check browser console for API errors
- Verify backend endpoints return data: `http://localhost:4000/api/analytics/top-batsmen?limit=10`

### Issue: JSON import fails for specific files
**Solution**:
- Check JSON file structure matches expected format (see ingestion script comments)
- Some files may have different structures - you may need to adjust `scripts/importIplData.ts`
- Check console output for specific error messages

---

## Production Build & Deployment

### Backend Build

```bash
cd backend
bun run build
bun run start
```

### Frontend Build

```bash
cd frontend
bun run build
bun run start
```

### Deployment

**Backend (Render/Railway):**
1. Connect your repository
2. Set environment variables (especially `DATABASE_URL`)
3. Build command: `cd backend && bun install && bun run prisma:generate && bun run prisma:migrate:prod`
4. Start command: `cd backend && bun run start`

**Frontend (Vercel):**
1. Connect your repository
2. Set root directory to `frontend` (or `boundary-insights-frontend`)
3. Add environment variable: `NEXT_PUBLIC_API_BASE_URL` (your deployed backend URL)
4. Deploy

---

## Scripts Reference

### Backend Scripts (`backend/package.json`)

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run prisma:generate` - Generate Prisma Client
- `bun run prisma:migrate` - Run database migrations (dev)
- `bun run prisma:migrate:prod` - Run migrations (production)
- `bun run prisma:studio` - Open Prisma Studio (database GUI)
- `bun run import:ipl` - Import IPL JSON data into database

### Frontend Scripts (`frontend/package.json`)

- `bun run dev` - Start Next.js dev server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

---

## Data Structure Notes

- **IPL JSON files** are placed in `backend/data/ipl/` and are **never exposed** to the frontend
- Data flows: `JSON files → Ingestion Script → PostgreSQL → Backend API → Frontend`
- The ingestion script is **idempotent** - safe to run multiple times
- Each match is identified by `externalKey` (file path relative to `data/ipl/`)

---

## Need Help?

- Check the main `BoundaryInsights-README.md` for architecture details
- Review Prisma schema: `backend/prisma/schema.prisma`
- Check API documentation: `http://localhost:4000/docs`
- Inspect database: `bun run prisma:studio`

---

## Next Steps

1. ✅ Complete setup and verify everything works
2. Customize the frontend UI/styling
3. Add more analytics endpoints as needed
4. Deploy to production (Vercel + Render/Railway)

Happy coding! 🚀
