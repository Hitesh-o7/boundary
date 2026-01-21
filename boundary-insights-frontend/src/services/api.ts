const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    // Frontend never sends or receives raw JSON files; only aggregated API data.
    headers: {
      "Content-Type": "application/json",
      ...(init && init.headers)
    },
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  return (await res.json()) as T;
}

export interface TopBatsmanDto {
  playerId: number;
  playerName: string;
  totalRuns: number;
}

export interface TopBowlerDto {
  playerId: number;
  playerName: string;
  wickets: number;
}

export interface TeamPerformanceDto {
  teamId: number;
  teamName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  noResults: number;
}

export interface PaginatedMatchesDto {
  items: {
    id: number;
    seasonYear: number;
    matchDate: string;
    city: string | null;
    venue: string | null;
    homeTeam: string;
    awayTeam: string;
    winnerTeam: string | null;
  }[];
  total: number;
  page: number;
  pageSize: number;
}

export function getTopBatsmen(limit = 5): Promise<TopBatsmanDto[]> {
  return fetchJson<TopBatsmanDto[]>(`/analytics/top-batsmen?limit=${limit}`);
}

export function getTopBowlers(limit = 5): Promise<TopBowlerDto[]> {
  return fetchJson<TopBowlerDto[]>(`/analytics/top-bowlers?limit=${limit}`);
}

export function getTeamPerformance(): Promise<TeamPerformanceDto[]> {
  return fetchJson<TeamPerformanceDto[]>("/analytics/team-performance");
}

export function getMatches(page = 1, pageSize = 20): Promise<PaginatedMatchesDto> {
  return fetchJson<PaginatedMatchesDto>(`/matches?page=${page}&pageSize=${pageSize}`);
}

