![Dashboard](screenshot/image.png)


<div align="center">

# 🏏 Boundary Insights  
### IPL Data Analytics Platform

A full-stack web application to store, analyze, and visualize  
**Indian Premier League (IPL)** data using modern web technologies.

</div>

---

## 📖 Overview

Boundary Insights is a full-stack analytics platform built as part of an
internship assignment. The application ingests IPL data, stores it in a
PostgreSQL database, exposes structured APIs, and presents insights through
an interactive dashboard.

The goal of this project is to demonstrate **database design, backend API
development, frontend analytics, and cloud deployment fundamentals**.

---

## 🧠 System Architecture
Frontend (Next.js)
↓
Backend (Node.js + Express)
↓
PostgreSQL (Prisma ORM)


---

## 📂 Dataset

**Indian Premier League Dataset**  
File: `Indian_Premier_League_2022-03-26.zip`

Includes:
- Matches & seasons
- Teams & players
- Ball-by-ball delivery data
- Batting & bowling statistics

The dataset was analyzed and modeled into a relational schema.

---

## 🗄️ Database Design

- Database: **PostgreSQL**
- ORM: **Prisma**

Core tables:
- `Match`
- `Team`
- `Player`
- `Delivery`
- `Season`

Schema changes are managed using Prisma migrations, and data is imported via
a custom ingestion script.

---

## 🔧 Backend

### Tech Stack
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Swagger (OpenAPI)

### Features
- REST APIs returning JSON
- Pagination and filtering
- Input validation and error handling
- Health check endpoint
- Swagger UI for API documentation

### Key Endpoints

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/api/health` | Health check |
| GET | `/api/matches` | List matches |
| GET | `/api/teams` | List teams |
| GET | `/api/players` | List players |
| GET | `/api/analytics/top-batsmen` | Top batsmen |
| GET | `/api/analytics/top-bowlers` | Top bowlers |

Swagger documentation is available at:  
`<BACKEND_URL>/docs`

---

## 🎨 Frontend

### Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Recharts

### UI Features
- Dashboard with KPI cards
- Analytics charts (bar, line, radial)
- Table views with pagination
- Loading, empty, and error states
- Responsive layout

Pages:
- Dashboard
- Teams
- Players
- Analytics

---

## 🚀 Deployment

### Backend
- Platform: Render  
- URL:  
`https://bond.hiteshthakur.space`

### Frontend
- Platform: Vercel  
- URL:  
`https://bond.hiteshthakur.space`

---

## ⚙️ Environment Variables

### Backend
```env
DATABASE_URL=
PORT=
NODE_ENV=production
CORS_ORIGIN=https://bond.hiteshthakur.space
API_BASE_URL=https://bond.hiteshthakur.space

NEXT_PUBLIC_API_BASE_URL=https://bond.hiteshthakur.space


🛠️ Local Setup
Prerequisites

Node.js or Bun

PostgreSQL

Backend
cd backend
bun install
bun run prisma:generate
bun run prisma:migrate
bun run import:ipl
bun run dev

Frontend
cd boundary-insights-frontend
bun install
bun run dev

👤 Author

Hitesh Thakur
