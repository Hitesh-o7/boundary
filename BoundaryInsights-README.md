## Boundary Insights - IPL Data Platform

Boundary Insights is an end‑to‑end IPL analytics platform. It ingests raw IPL JSON scorecards into PostgreSQL, exposes a typed REST API with OpenAPI/Swagger documentation, and provides a modern Next.js dashboard for teams, players, and matches.

### Tech Stack

- **Backend**: Bun, Express, TypeScript, PostgreSQL, Prisma ORM, OpenAPI (Swagger)
- **Frontend**: Next.js App Router, TypeScript, Tailwind CSS, Recharts
- **Deployment**:
  - **Frontend**: Vercel
  - **Backend**: Render or Railway (any Node/Bun + PostgreSQL host)

> **Note**: This project uses **Bun** as the runtime. Make sure you have Bun installed (https://bun.sh) before starting.

---

## Architecture Overview

- **Backend (`backend/`)**
  - Express + TypeScript REST API
  - PostgreSQL via Prisma
  - One‑time IPL JSON → DB ingestion script
  - Analytics endpoints for batsmen, bowlers, and team performance
  - Matches listing with pagination and filters
  - OpenAPI spec + Swagger UI at `/docs`
- **Frontend (`boundary-insights-frontend/`)**
  - Next.js App Router (dashboard, teams, players)
  - Tailwind CSS UI
  - Recharts visualisations
  - Fetches **only** aggregated data from backend APIs (no direct JSON access)

Raw IPL JSON files **never** leave the backend; they live under `backend/data/ipl/` and are used only once for ingestion.

---

## Folder Structure

- **`backend/`**
  - `package.json` – backend scripts and dependencies
  - `tsconfig.json` – TypeScript config (path aliases for routes/controllers/services/prisma)
  - `prisma/`
    - `schema.prisma` – Prisma models & enums
    - `migrations/0001_init/` – initial DB schema migration
  - `src/`
    - `app.ts` – Express app wiring (middleware, routes, Swagger, error handler)
    - `server.ts` – HTTP server bootstrap
    - `routes/`
      - `index.ts` – mounts module routers under `/api`
      - `healthRoutes.ts` – health endpoint
      - `analyticsRoutes.ts` – analytics endpoints
      - `matchRoutes.ts` – matches endpoints
    - `controllers/`
      - `healthController.ts` – health check logic
      - `analyticsController.ts` – validates queries, calls analytics services
      - `matchController.ts` – validates pagination/filters, calls match service
    - `services/`
      - `analyticsService.ts` – DB aggregations for top batsmen/bowlers and team performance
      - `matchService.ts` – paginated match listing
    - `prisma/`
      - `clientInstance.ts` – singleton `PrismaClient`
    - `openapi/`
      - `swagger.ts` – Swagger spec generation and UI mounting
  - `scripts/`
    - `importIplData.ts` – IPL ingestion script (JSON → DB)
  - `data/ipl/**` – **your IPL JSON files go here** (nested folders allowed; never exposed over HTTP)

- **`boundary-insights-frontend/`**
  - `package.json` – Next.js app scripts and dependencies
  - `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`
  - `app/`
    - `layout.tsx` – root layout, navigation, global shell
    - `globals.css` – Tailwind + base styles
    - `page.tsx` – **Dashboard** (charts + recent matches)
    - `teams/page.tsx` – **Teams** table
    - `players/page.tsx` – **Players** charts
  - `src/`
    - `services/api.ts` – typed API client for backend
    - `components/` – (placeholder for future UI components)
    - `hooks/` – (placeholder for custom hooks)

---

## Database Schema

### Core Tables

- **`Season`**
  - **Columns**: `id`, `year` (unique), `name`, timestamps
  - **Purpose**: Groups matches by IPL season/year.

- **`Team`**
  - **Columns**: `id`, `name` (unique), `shortName`, `city`, timestamps
  - **Relations**:
    - `homeMatches`, `awayMatches` (home/away in `Match`)
    - `tossWins`, `matchWins` (toss winner / match winner)
    - `battingInnings`, `bowlingInnings` (from `Delivery`)

- **`Player`**
  - **Columns**: `id`, `name`, `fullName`, `country`, `battingStyle`, `bowlingStyle`, `role`, timestamps
  - **Relations**:
    - `battingDeliveries` (as striker)
    - `nonStrikerDeliveries`
    - `bowlingDeliveries`
    - `dismissals` (player being dismissed)

- **`Match`**
  - **Columns**:
    - `id` (PK), `externalKey` (unique key derived from JSON file path)
    - `seasonId` (FK → `Season`)
    - `city`, `venue`, `matchDate`, `matchNumber`
    - `team1Id` (home), `team2Id` (away)
    - `tossWinnerTeamId`, `tossDecision`
    - `resultType` (`NORMAL`, `TIE`, `NO_RESULT`)
    - `winnerTeamId`, `resultMargin`, `resultBy` (`runs`/`wickets`)
    - `dlApplied`, `umpire1`, `umpire2`, timestamps
  - **Indexes**: by `seasonId+matchDate`, teams, winner

- **`Delivery`**
  - **Columns**:
    - `id` (BIGSERIAL PK), `matchId` (FK → `Match`)
    - `inningNumber`, `overNumber`, `ballInOver`
    - `battingTeamId`, `bowlingTeamId`
    - `strikerId`, `nonStrikerId`, `bowlerId` (FK → `Player`)
    - `runsBatsman`, `runsExtras`, `runsTotal`
    - `isWide`, `isNoBall`, `isBye`, `isLegBye`, `isPenalty`
    - `dismissalKind` (enum) & `dismissedPlayerId`
  - **Uniqueness**: `(matchId, inningNumber, overNumber, ballInOver)` unique constraint

### Enums

- **`MatchResultType`**: `NORMAL`, `TIE`, `NO_RESULT`
- **`TossDecision`**: `BAT`, `BOWL`
- **`DismissalKind`**: `BOWLED`, `CAUGHT`, `LBW`, `RUN_OUT`, `STUMPED`, `HIT_WICKET`, `RETIRED_HURT`, `OBSTRUCTING_FIELD`, `HIT_BALL_TWICE`

This schema is optimised for analytics queries on batting, bowling, team performance, and match listings.

---

## Data Ingestion Strategy (JSON → DB)

**Location**: `backend/scripts/importIplData.ts`  
**JSON root**: `backend/data/ipl/**`

- **Recursive scanning**
  - Walks all subfolders under `backend/data/ipl/`
  - Processes every `*.json` file
- **Idempotency**
  - `Match.externalKey` is set to the JSON file’s relative path
  - On re‑runs, the script:
    - Skips matches that already have deliveries
    - Or (optionally) clears and re‑imports deliveries when needed
- **Mapping assumptions**
  - Expects a common IPL JSON shape with:
    - `info`: metadata (`season`, `city`, `venue`, `teams`, `toss`, `outcome`, `umpires`, `dates`)
    - `innings`: array of innings with overs and deliveries
  - Over/ball, runs, extras, and wickets are mapped into the `Delivery` table
  - Teams and players are created/upserted on‑the‑fly by name
- **Usage**
  - Place raw IPL JSON files in `backend/data/ipl/` (any folder hierarchy)
  - From `backend/`:
    - `bun install`
    - Configure `DATABASE_URL` in `.env`
    - Run migrations: `bun run prisma:migrate`
    - Import IPL data: `bun run import:ipl`

> If your JSON format differs, adjust the mapping logic in `importIplData.ts` but keep `externalKey` and unique delivery constraints for idempotency.

---

## Backend API

Base URL (local): **`http://localhost:4000/api`**

- **Health**
  - **`GET /health`**
  - Quick service + DB connectivity check.

- **Analytics**
  - **`GET /analytics/top-batsmen?limit=10`**
    - **Description**: Top batsmen by total runs scored (ball‑by‑ball).
    - **Query**:
      - `limit` (optional, default 10, max 100)
  - **`GET /analytics/top-bowlers?limit=10`**
    - **Description**: Top bowlers by number of wickets (based on dismissal events).
    - **Query**:
      - `limit` (optional, default 10, max 100)
  - **`GET /analytics/team-performance`**
    - **Description**: Per‑team summary (matches played, wins, losses, ties, no results).

- **Matches**
  - **`GET /matches`**
    - **Description**: Paginated list of matches.
    - **Query**:
      - `page` (default `1`, min `1`)
      - `pageSize` (default `20`, max `100`)
      - `seasonId` (optional)
      - `teamId` (optional; matches where team played)

All request validation is performed using **Zod** in controllers before hitting services.

---

## Swagger / OpenAPI

- **Route**: `http://localhost:4000/docs`
- **Spec**: Generated via `swagger-jsdoc` from JSDoc annotations in:
  - `backend/src/routes/*.ts`
  - `backend/src/controllers/*.ts`
- Documents:
  - Health endpoints
  - Analytics endpoints
  - Matches listing endpoint

---

## Frontend Pages & Components

Base URL (local): **`http://localhost:3000`**

- **Dashboard (`/`)**
  - **Data Sources**:
    - `GET /analytics/top-batsmen`
    - `GET /analytics/top-bowlers`
    - `GET /analytics/team-performance`
    - `GET /matches` (recent N matches)
  - **Visuals**:
    - Recharts bar chart for top batsmen by runs
    - Recharts bar chart for top bowlers by wickets
    - Stacked bar chart for team performance (wins/losses/ties/no‑results)
    - Table of recent matches (season, teams, venue, winner)

- **Teams (`/teams`)**
  - **Data**: `GET /analytics/team-performance`
  - **UI**: Table listing each team with:
    - Matches played, wins, losses, ties, no result
    - Win percentage

- **Players (`/players`)**
  - **Data**:
    - `GET /analytics/top-batsmen?limit=10`
    - `GET /analytics/top-bowlers?limit=10`
  - **UI**:
    - Bar chart of top 10 batsmen (runs)
    - Bar chart of top 10 bowlers (wickets)

- **Shared Frontend Utilities**
  - `src/services/api.ts`:
    - Typed wrappers around backend endpoints
    - Reads `NEXT_PUBLIC_API_BASE_URL` so the same code works locally and on Vercel

> The frontend **never** reads raw JSON files. It only uses the REST API, which in turn reads from PostgreSQL.

---

## Setup Instructions

### 1. Backend (Local)

**Requirements**:
- Bun 1.0+ (https://bun.sh)
- PostgreSQL database (local or remote)

**Steps**:
1. `cd backend`
2. `bun install`
3. Create `.env` in `backend/`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
CORS_ORIGIN="http://localhost:3000"
PORT=4000
```

4. Apply migrations:

```bash
bun run prisma:migrate
```

5. Add IPL JSON files to `backend/data/ipl/` (nested folders allowed).
6. Ingest data:

```bash
bun run import:ipl
```

7. Start backend:

```bash
bun run dev
```

Backend is now running at `http://localhost:4000` with:
- API at `http://localhost:4000/api`
- Swagger UI at `http://localhost:4000/docs`

### 2. Frontend (Local)

**Requirements**:
- Bun 1.0+ (or Node.js 18+)

**Steps**:
1. `cd boundary-insights-frontend` (or `frontend`)
2. `bun install`
3. Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000/api"
```

4. Start dev server:

```bash
bun run dev
```

Open `http://localhost:3000` to view Boundary Insights.

---

## Deployment

### Backend (Render, Railway, etc.)

1. **Create PostgreSQL instance** and get its connection string.
2. **Deploy backend**:
   - Build command: `cd backend && bun install && bun run build`
   - Start command: `cd backend && bun run start`
   - Environment variables:
     - `DATABASE_URL` – from your DB provider
     - `PORT` – e.g. `4000` (match your service config)
     - `CORS_ORIGIN` – your Vercel frontend URL (e.g. `https://boundary-insights.vercel.app`)
3. Run migrations on the deployed DB (once):
   - Either via CI/CD step: `cd backend && bun run prisma:migrate:prod`
4. Upload IPL JSON files to `backend/data/ipl/` on the host (e.g. via repo or storage mount).
5. Execute the import script once (e.g. Render/Railway one‑off job):
   - `cd backend && bun run import:ipl`

### Frontend (Vercel)

1. Create a new Vercel project from `boundary-insights-frontend`.
2. Set environment variable:
   - `NEXT_PUBLIC_API_BASE_URL="https://YOUR-BACKEND-HOST/api"`
3. Deploy with defaults (`bun run build` / `bun run start` handled by Vercel, or use Node.js).

---

## Environment Variables

**Backend (`backend/.env`)**
- `DATABASE_URL` – PostgreSQL connection string
- `CORS_ORIGIN` – Allowed frontend origin
- `PORT` – Backend port (default 4000)

**Frontend (`boundary-insights-frontend/.env.local`)**
- `NEXT_PUBLIC_API_BASE_URL` – Fully qualified backend API base URL

---

## Assumptions and Trade‑offs

- IPL JSON structure varies across datasets; this project assumes a common `info` + `innings` shape.
  - Mapping logic in `importIplData.ts` is defensive and may need minor tweaks for your exact dataset.
- Player and team identity is **name‑based**:
  - Same‑name players across seasons are treated as one record.
  - For stricter identity, extend the schema with unique identifiers.
- Analytics focus on:
  - Aggregate batting runs (no strike rate/average yet)
  - Aggregate bowling wickets (no economy/average yet)
  - Simple team win/loss summaries
  - These can be extended with more complex derived metrics and filters.
- JSON files are **never** exposed to the frontend:
  - Only the database is queried via REST APIs.

---

## Screenshots (Placeholders)

- **Dashboard View**
  - _Add screenshot: `dashboard.png`_
- **Teams Table**
  - _Add screenshot: `teams.png`_
- **Players Charts**
  - _Add screenshot: `players.png`_

---

## Next Steps / Extensions

- Add filters by season, team, and venue in the frontend.
- Player detail pages (batting & bowling splits).
- Advanced metrics: strike rate, economy, average, phase‑wise stats (powerplay, middle, death).
- Role‑aware player clustering and comparators.

