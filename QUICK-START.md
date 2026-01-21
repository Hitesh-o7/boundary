# Boundary Insights - Quick Start Guide (Bun)

Get up and running in 5 minutes!

## Prerequisites

- ✅ **Bun** installed: https://bun.sh (`bun --version`)
- ✅ **PostgreSQL** running locally or remotely

---

## Step 1: Install Dependencies

```bash
# Backend
cd backend
bun install

# Frontend
cd ../frontend  # or boundary-insights-frontend
bun install
```

---

## Step 2: Setup Database

### Create Database
```bash
psql -U postgres
CREATE DATABASE boundary_insights;
\q
```

### Configure Backend
Create `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/boundary_insights?schema=public"
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

### Run Migrations
```bash
cd backend
bun run prisma:generate
bun run prisma:migrate
```

---

## Step 3: Import Data

**Your IPL JSON files should be in:** `backend/data/ipl/`

```bash
cd backend
bun run import:ipl
```

---

## Step 4: Start Servers

### Terminal 1 - Backend
```bash
cd backend
bun run dev
```
✅ Backend: http://localhost:4000  
✅ API Docs: http://localhost:4000/docs

### Terminal 2 - Frontend
```bash
cd frontend  # or boundary-insights-frontend
bun run dev
```
✅ Frontend: http://localhost:3000

---

## Verify Everything Works

1. ✅ Backend health: http://localhost:4000/api/health
2. ✅ Swagger docs: http://localhost:4000/docs
3. ✅ Frontend dashboard: http://localhost:3000

---

## Common Issues

**"Cannot find module '@prisma/client'"**  
→ Run `cd backend && bun run prisma:generate`

**"DATABASE_URL not set"**  
→ Create `backend/.env` with your database URL

**"Port already in use"**  
→ Change `PORT` in `backend/.env` or stop the conflicting process

**Frontend shows no data**  
→ Make sure you ran `bun run import:ipl` and check browser console

---

## Next Steps

- Read full setup guide: `SETUP-GUIDE.md`
- Check architecture: `BoundaryInsights-README.md`
- Explore API docs: http://localhost:4000/docs

---

**Need help?** Check `SETUP-GUIDE.md` for detailed troubleshooting!
