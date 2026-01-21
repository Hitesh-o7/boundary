import { prisma } from "@prisma/clientInstance";

export interface MatchListItem {
  id: number;
  seasonYear: number;
  matchDate: string;
  city: string | null;
  venue: string | null;
  homeTeam: string;
  awayTeam: string;
  winnerTeam: string | null;
}

export interface PaginatedMatches {
  items: MatchListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MatchFilters {
  seasonId?: number;
  teamId?: number;
}

export async function listMatches(
  page: number,
  pageSize: number,
  filters: MatchFilters
): Promise<PaginatedMatches> {
  const where: any = {};

  if (filters.seasonId) {
    where.seasonId = filters.seasonId;
  }

  if (filters.teamId) {
    where.OR = [{ homeTeamId: filters.teamId }, { awayTeamId: filters.teamId }];
  }

  const [total, matches] = await Promise.all([
    prisma.match.count({ where }),
    prisma.match.findMany({
      where,
      include: {
        season: true,
        homeTeam: true,
        awayTeam: true,
        winnerTeam: true
      },
      orderBy: { matchDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  const items: MatchListItem[] = matches.map((m) => ({
    id: m.id,
    seasonYear: m.season.year,
    matchDate: m.matchDate.toISOString(),
    city: m.city,
    venue: m.venue,
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    winnerTeam: m.winnerTeam?.name ?? null
  }));

  return {
    items,
    total,
    page,
    pageSize
  };
}

