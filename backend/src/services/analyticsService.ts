import { prisma } from "@prisma/clientInstance";

export interface TopBatsman {
  playerId: number;
  playerName: string;
  totalRuns: number;
}

export interface TopBowler {
  playerId: number;
  playerName: string;
  wickets: number;
}

export interface TeamPerformance {
  teamId: number;
  teamName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  noResults: number;
}

export async function getTopBatsmen(limit: number): Promise<TopBatsman[]> {
  try {
    console.log(`[Service] getTopBatsmen: Querying deliveries for top ${limit} batsmen`);
    
    // Test DB connection first
    await prisma.$queryRaw`SELECT 1`;
    console.log("[Service] Database connection OK");
    
    const grouped = await prisma.delivery.groupBy({
      by: ["strikerId"],
      _sum: { runsBatsman: true },
      orderBy: { _sum: { runsBatsman: "desc" } },
      take: limit
    });
    
    console.log(`[Service] Found ${grouped.length} batsmen groups`);

    if (grouped.length === 0) {
      console.warn("[Service] No batsmen data found - returning empty array");
      return [];
    }

    const playerIds = grouped.map((g) => g.strikerId);
    console.log(`[Service] Fetching ${playerIds.length} player details`);
    
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds } }
    });
    
    console.log(`[Service] Retrieved ${players.length} player records`);

    const playerMap = new Map(players.map((p) => [p.id, p.name]));

    const result = grouped.map((g) => ({
      playerId: g.strikerId,
      playerName: playerMap.get(g.strikerId) ?? "Unknown",
      totalRuns: g._sum.runsBatsman ?? 0
    }));
    
    console.log(`[Service] Returning ${result.length} batsmen`);
    return result;
  } catch (error: any) {
    console.error("[Service] CRITICAL ERROR in getTopBatsmen:", error);
    console.error("[Service] Error name:", error.name);
    console.error("[Service] Error message:", error.message);
    console.error("[Service] Error code:", error.code);
    if (error.meta) console.error("[Service] Error meta:", error.meta);
    throw new Error(`Database query failed for top batsmen: ${error.message}`);
  }
}

export async function getTopBowlers(limit: number): Promise<TopBowler[]> {
  try {
    console.log(`[Service] getTopBowlers: Querying deliveries for top ${limit} bowlers`);
    
    // Test DB connection first
    await prisma.$queryRaw`SELECT 1`;
    console.log("[Service] Database connection OK");
    
    const grouped = await prisma.delivery.groupBy({
      by: ["bowlerId"],
      where: {
        dismissalKind: {
          not: null
        }
      },
      _count: { dismissalKind: true },
      orderBy: { _count: { dismissalKind: "desc" } },
      take: limit
    });
    
    console.log(`[Service] Found ${grouped.length} bowler groups`);

    if (grouped.length === 0) {
      console.warn("[Service] No bowler data found - returning empty array");
      return [];
    }

    const playerIds = grouped.map((g) => g.bowlerId);
    console.log(`[Service] Fetching ${playerIds.length} player details`);
    
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds } }
    });
    
    console.log(`[Service] Retrieved ${players.length} player records`);
    
    const playerMap = new Map(players.map((p) => [p.id, p.name]));

    const result = grouped.map((g) => ({
      playerId: g.bowlerId,
      playerName: playerMap.get(g.bowlerId) ?? "Unknown",
      wickets: g._count.dismissalKind ?? 0
    }));
    
    console.log(`[Service] Returning ${result.length} bowlers`);
    return result;
  } catch (error: any) {
    console.error("[Service] CRITICAL ERROR in getTopBowlers:", error);
    console.error("[Service] Error name:", error.name);
    console.error("[Service] Error message:", error.message);
    console.error("[Service] Error code:", error.code);
    if (error.meta) console.error("[Service] Error meta:", error.meta);
    throw new Error(`Database query failed for top bowlers: ${error.message}`);
  }
}

export async function getTeamPerformanceSummary(): Promise<TeamPerformance[]> {
  try {
    console.log("[Service] getTeamPerformanceSummary: Executing raw SQL query");
    
    // Test DB connection first
    await prisma.$queryRaw`SELECT 1`;
    console.log("[Service] Database connection OK");
    
    // Raw SQL is convenient for this aggregated view
    const rows = await prisma.$queryRaw<
      {
        team_id: number;
        team_name: string;
        matches_played: number;
        wins: number;
        losses: number;
        ties: number;
        no_results: number;
      }[]
    >`
      SELECT
        t.id AS team_id,
        t.name AS team_name,
        COUNT(DISTINCT m.id) AS matches_played,
        COUNT(DISTINCT CASE WHEN m."winnerTeamId" = t.id THEN m.id END) AS wins,
        COUNT(DISTINCT CASE
          WHEN m."winnerTeamId" IS NOT NULL
           AND m."winnerTeamId" != t.id
           AND (m."team1Id" = t.id OR m."team2Id" = t.id)
        THEN m.id END) AS losses,
        COUNT(DISTINCT CASE WHEN m."resultType" = 'TIE' THEN m.id END) AS ties,
        COUNT(DISTINCT CASE WHEN m."resultType" = 'NO_RESULT' THEN m.id END) AS no_results
      FROM "Team" t
      JOIN "Match" m ON m."team1Id" = t.id OR m."team2Id" = t.id
      GROUP BY t.id, t.name
      ORDER BY wins DESC, matches_played DESC;
    `;
    
    console.log(`[Service] Query returned ${rows.length} teams`);

    if (rows.length === 0) {
      console.warn("[Service] No team performance data found - returning empty array");
      return [];
    }

    const result = rows.map((r) => ({
      teamId: r.team_id,
      teamName: r.team_name,
      matchesPlayed: Number(r.matches_played),
      wins: Number(r.wins),
      losses: Number(r.losses),
      ties: Number(r.ties),
      noResults: Number(r.no_results)
    }));
    
    console.log(`[Service] Returning ${result.length} team performance records`);
    return result;
  } catch (error: any) {
    console.error("[Service] CRITICAL ERROR in getTeamPerformanceSummary:", error);
    console.error("[Service] Error name:", error.name);
    console.error("[Service] Error message:", error.message);
    console.error("[Service] Error code:", error.code);
    if (error.meta) console.error("[Service] Error meta:", error.meta);
    throw new Error(`Database query failed for team performance: ${error.message}`);
  }
}

