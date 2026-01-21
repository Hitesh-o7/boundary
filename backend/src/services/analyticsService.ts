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
  const grouped = await prisma.delivery.groupBy({
    by: ["strikerId"],
    _sum: { runsBatsman: true },
    orderBy: { _sum: { runsBatsman: "desc" } },
    take: limit
  });

  const playerIds = grouped.map((g) => g.strikerId);
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } }
  });

  const playerMap = new Map(players.map((p) => [p.id, p.name]));

  return grouped.map((g) => ({
    playerId: g.strikerId,
    playerName: playerMap.get(g.strikerId) ?? "Unknown",
    totalRuns: g._sum.runsBatsman ?? 0
  }));
}

export async function getTopBowlers(limit: number): Promise<TopBowler[]> {
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

  const playerIds = grouped.map((g) => g.bowlerId);
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } }
  });
  const playerMap = new Map(players.map((p) => [p.id, p.name]));

  return grouped.map((g) => ({
    playerId: g.bowlerId,
    playerName: playerMap.get(g.bowlerId) ?? "Unknown",
    wickets: g._count.dismissalKind ?? 0
  }));
}

export async function getTeamPerformanceSummary(): Promise<TeamPerformance[]> {
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

  return rows.map((r) => ({
    teamId: r.team_id,
    teamName: r.team_name,
    matchesPlayed: Number(r.matches_played),
    wins: Number(r.wins),
    losses: Number(r.losses),
    ties: Number(r.ties),
    noResults: Number(r.no_results)
  }));
}

