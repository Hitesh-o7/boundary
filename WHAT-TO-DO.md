# What You Need To Do - Boundary Insights Setup Checklist

## ✅ Completed For You

1. ✅ Backend structure with Express + TypeScript + Prisma
2. ✅ Frontend structure with Next.js App Router
3. ✅ Database schema (PostgreSQL with Prisma)
4. ✅ Data ingestion script for IPL JSON files
5. ✅ REST API endpoints (health, analytics, matches)
6. ✅ Swagger/OpenAPI documentation
7. ✅ All code updated for **Bun** runtime
8. ✅ Setup guides created

---

## 📋 Your Action Items

### 1. Install Bun (if not already installed)

```bash
# Install Bun from https://bun.sh
# Or use:
curl -fsSL https://bun.sh/install | bash

# Verify
bun --version
```

---

### 2. Install PostgreSQL (if not already installed)

- Download from: https://www.postgresql.org/download/
- Or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`

---

### 3. Create Database

```bash
psql -U postgres
CREATE DATABASE boundary_insights;
\q
```

---

### 4. Install Backend Dependencies

```bash
cd backend
bun install
```

---

### 5. Configure Backend Environment

Create `backend/.env` file:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/boundary_insights?schema=public"
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
API_BASE_URL=http://localhost:4000
```

**⚠️ IMPORTANT**: Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual PostgreSQL credentials!

---

### 6. Setup Database Schema

```bash
cd backend

# Generate Prisma Client
bun run prisma:generate

# Run migrations to create tables
bun run prisma:migrate
```

---

### 7. Verify IPL Data Location

**Your IPL JSON files should be in:** `backend/data/ipl/`

The folder structure should look like:
```
backend/
  data/
    ipl/
      match_info/
        match1.json
        match2.json
      ...
```

---

### 8. Import IPL Data

```bash
cd backend
bun run import:ipl
```

This will:
- Scan all JSON files in `backend/data/ipl/`
- Parse and normalize data
- Insert into PostgreSQL
- Show progress in console

**Expected output:**
```
Starting IPL data import for Boundary Insights...
Data root: /path/to/backend/data/ipl
Found X JSON files to process.
Imported match from match_info/match1.json
...
```

---

### 9. Install Frontend Dependencies

```bash
cd frontend  # or boundary-insights-frontend (whichever folder name you have)
bun install
```

---

### 10. Configure Frontend Environment

Create `frontend/.env.local` (or `boundary-insights-frontend/.env.local`):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

---

### 11. Start Backend Server

**Terminal 1:**
```bash
cd backend
bun run dev
```

**Expected output:**
```
Boundary Insights backend listening on port 4000
```

**Verify:**
- Open http://localhost:4000/api/health
- Open http://localhost:4000/docs (Swagger UI)

---

### 12. Start Frontend Server

**Terminal 2:**
```bash
cd frontend  # or boundary-insights-frontend
bun run dev
```

**Expected output:**
```
▲ Next.js 14.2.3
- Local:        http://localhost:3000
```

**Verify:**
- Open http://localhost:3000
- You should see the Dashboard with charts

---

## 🎯 Quick Verification Checklist

✅ Bun installed (`bun --version`)  
✅ PostgreSQL running  
✅ Database `boundary_insights` created  
✅ Backend dependencies installed (`cd backend && bun install`)  
✅ Backend `.env` file created with correct `DATABASE_URL`  
✅ Database migrations run (`bun run prisma:migrate`)  
✅ IPL JSON files in `backend/data/ipl/`  
✅ Data imported (`bun run import:ipl`)  
✅ Frontend dependencies installed (`cd frontend && bun install`)  
✅ Frontend `.env.local` created  
✅ Backend running on http://localhost:4000  
✅ Frontend running on http://localhost:3000  
✅ Health check works: http://localhost:4000/api/health  
✅ Swagger docs accessible: http://localhost:4000/docs  
✅ Frontend dashboard shows data  

---

## 📚 Documentation Files

- **`QUICK-START.md`** - 5-minute quick setup
- **`SETUP-GUIDE.md`** - Comprehensive setup with troubleshooting
- **`BoundaryInsights-README.md`** - Full architecture and API documentation

---

## 🐛 Common Issues & Quick Fixes

### "Cannot find module '@prisma/client'"
```bash
cd backend
bun run prisma:generate
```

### "DATABASE_URL not set"
→ Create `backend/.env` with your PostgreSQL connection string

### "Port 4000 already in use"
→ Change `PORT=5000` in `backend/.env` (and update frontend `.env.local`)

### Frontend shows "Failed to fetch"
→ Make sure backend is running and `NEXT_PUBLIC_API_BASE_URL` is correct

### Import script says "No files found"
→ Verify JSON files are in `backend/data/ipl/` (not `public/` or elsewhere)

### Import fails with database errors
→ Check `DATABASE_URL` in `backend/.env` is correct and database exists

---

## 🚀 Next Steps After Setup

1. Explore the dashboard at http://localhost:3000
2. Check API documentation at http://localhost:4000/docs
3. Customize UI/colors in frontend components
4. Add more analytics endpoints if needed
5. Deploy to production (see deployment section in README)

---

## 📝 Folder Organization (Optional)

If you want both `backend/` and `frontend/` inside a single parent folder:

```bash
# Create parent folder
mkdir boundary-insights
cd boundary-insights

# Move folders
mv ../backend .
mv ../frontend .  # or mv ../boundary-insights-frontend ./frontend
```

Then update paths accordingly (they should mostly work as-is since paths are relative).

---

**That's it! Follow the checklist above and you'll be up and running.** 🎉

Need help? Check `SETUP-GUIDE.md` for detailed troubleshooting!
