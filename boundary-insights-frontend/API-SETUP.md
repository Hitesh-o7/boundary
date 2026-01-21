# Frontend API Configuration

## Quick Fix for 404 Errors

If you're seeing errors like `Cannot GET /analytics/top-bowlers`, the issue is with your API configuration.

### Solution

Create a file called `.env.local` in the `boundary-insights-frontend` folder with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

**IMPORTANT:** The URL must end with `/api` because the backend mounts all routes there!

### Why This Matters

**Backend Structure:**
```
app.ts        → Mounts everything at /api
routes/index.ts   → Mounts analytics at /analytics  
analyticsRoutes.ts → Has /top-batsmen, /top-bowlers, etc.
```

**Full Backend Routes:**
- `http://localhost:4000/api/analytics/top-batsmen`
- `http://localhost:4000/api/analytics/top-bowlers`
- `http://localhost:4000/api/analytics/team-performance`
- `http://localhost:4000/api/matches`

**Frontend API Service:**
- Reads `NEXT_PUBLIC_API_BASE_URL` from environment
- Adds route paths like `/analytics/top-batsmen`
- Result: `{baseUrl}/analytics/top-batsmen`

### After Creating .env.local

1. **Stop the dev server** (Ctrl+C)
2. **Restart it:**
   ```bash
   bun run dev
   ```
3. **Refresh your browser** (hard refresh: Ctrl+Shift+R)

### Verify It's Working

Open browser console (F12) and check:
- ✅ No 404 errors
- ✅ API calls go to `http://localhost:4000/api/analytics/*`
- ✅ Dashboard shows real data (matches, teams, players)

### If Still Not Working

**1. Check backend is running:**
```bash
cd backend
bun run dev
```
Should show: `Boundary Insights backend listening on port 4000`

**2. Test backend directly:**
Open: `http://localhost:4000/api/analytics/team-performance`
Should return JSON with team data.

**3. Check frontend environment:**
The api.ts file now has automatic `/api` suffix handling, so even if you forget it in .env.local, it should still work.

## Code Changes Made

**File: `src/services/api.ts`**

Added safeguard to automatically append `/api` if missing:
```typescript
// Validate API_BASE_URL ends with /api to prevent 404 errors
const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
```

This ensures the API calls always hit the correct backend routes, even if .env.local is misconfigured.
