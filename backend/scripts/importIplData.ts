/**
 * Boundary Insights - IPL Data Ingestion Script
 *
 * This repo’s bundled IPL dataset is in an EntitySport-style JSON shape:
 * - `data/ipl/match_info/*.json` contains match metadata (season, teams, toss, venue, date, winner)
 * - `data/ipl/match_innings_commentary/*.json` contains ball-by-ball commentary with over/ball, batsman_id, bowler_id, runs, extras, wickets
 *
 * The earlier version of this script scanned *all* JSON files under `data/ipl/`
 * (including batting/bowling stats), which caused most rows to fall back to
 * `"Unknown Team"` / `"Unknown Player"`.
 *
 * This version only ingests actual match files and joins deliveries using `match_id`.
 * Idempotency is guaranteed via `Match.externalKey = String(match_id)`.
 */

import path from "path";
import fs from "fs/promises";
import dotenv from "dotenv";
import { prisma } from "../src/prisma/clientInstance";

dotenv.config();

const DATA_ROOT = path.resolve(process.cwd(), "data/ipl");

type RawMatchJson = any;

type MatchInfo = {
  match_id: number;
  match_number?: string | number;
  title?: string;
  short_title?: string;
  subtitle?: string;
  competition?: { season?: string | number; abbr?: string; title?: string };
  teama?: { team_id?: number; name?: string; short_name?: string };
  teamb?: { team_id?: number; name?: string; short_name?: string };
  date_start?: string;
  timestamp_start?: number;
  venue?: { name?: string; location?: string };
  toss?: { winner?: number; decision?: number; text?: string };
  winning_team_id?: number;
  result_type?: number;
  status_note?: string;
  match_dls_affected?: string | boolean;
  umpires?: string;
};

type CommentaryInnings = {
  match: { status?: any; game_state?: any };
  inning: { number: number; batting_team_id: number; fielding_team_id: number };
  teams: { tid: number; title: string; abbr?: string }[];
  players: { pid: number; title: string; batting_style?: string; bowling_style?: string; role?: string }[];
  commentaries: Array<{
    over: string | number;
    ball: string | number;
    batsman_id: number;
    bowler_id: number;
    run: number | string;
    bat_run?: number | string;
    wideball?: boolean;
    noball?: boolean;
    bye_run?: number | string;
    legbye_run?: number | string;
    penalty_run?: number | string;
    wicket_batsman_id?: number | string | null;
    how_out?: string | null;
    batsmen?: Array<{ batsman_id: number }>;
  }>;
};

async function walkJsonFiles(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkJsonFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      files.push(fullPath);
    }
  }
  return files;
}

async function ensureSeason(year: number | string | undefined): Promise<number> {
  const numericYear = typeof year === "string" ? parseInt(year, 10) : year;
  const resolvedYear = Number.isFinite(numericYear) ? (numericYear as number) : 0;

  const seasonName = resolvedYear === 0 ? "Unknown Season" : `IPL ${resolvedYear}`;

  const season = await prisma.season.upsert({
    where: { year: resolvedYear },
    create: {
      year: resolvedYear,
      name: seasonName
    },
    update: {
      name: seasonName
    }
  });

  return season.id;
}

async function ensureTeam(name: string | undefined | null): Promise<number> {
  const normalized = (name || "Unknown Team").trim();
  const team = await prisma.team.upsert({
    where: { name: normalized },
    create: { name: normalized },
    update: {}
  });
  return team.id;
}

async function ensurePlayer(name: string | undefined | null): Promise<number> {
  const normalized = (name || "Unknown Player").trim();

  // `Player.name` is not marked unique in the Prisma schema, so we cannot use upsert(where: { name }).
  // Keep it simple: find-or-create by name.
  const existing = await prisma.player.findFirst({ where: { name: normalized } });
  if (existing) return existing.id;

  const created = await prisma.player.create({ data: { name: normalized } });
  return created.id;
}

function mapDismissalKind(kindRaw: string | undefined | null) {
  if (!kindRaw) return null;
  const kind = kindRaw.toLowerCase();
  if (kind.includes("bowled")) return "BOWLED";
  if (kind.includes("caught")) return "CAUGHT";
  if (kind === "lbw") return "LBW";
  if (kind.includes("run out") || kind.includes("runout")) return "RUN_OUT";
  if (kind.includes("stumped")) return "STUMPED";
  if (kind.includes("hit wicket")) return "HIT_WICKET";
  if (kind.includes("retired hurt")) return "RETIRED_HURT";
  if (kind.includes("obstructing")) return "OBSTRUCTING_FIELD";
  if (kind.includes("hit ball twice")) return "HIT_BALL_TWICE";
  return null;
}

function toInt(v: unknown, fallback = 0): number {
  const n = typeof v === "string" ? parseInt(v, 10) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function parseDateFromMatchInfo(info: MatchInfo): Date {
  if (info.date_start) {
    const d = new Date(info.date_start.replace(" ", "T") + "Z");
    if (!Number.isNaN(d.valueOf())) return d;
  }
  if (info.timestamp_start) return new Date(info.timestamp_start * 1000);
  return new Date();
}

async function loadMatchInfoIndex(): Promise<Map<string, MatchInfo>> {
  const matchInfoDir = path.join(DATA_ROOT, "match_info");
  const files = await walkJsonFiles(matchInfoDir);
  const index = new Map<string, MatchInfo>();
  for (const file of files) {
    try {
      const raw = await fs.readFile(file, "utf-8");
      const info: MatchInfo = JSON.parse(raw);
      const base = path.basename(file).replace(/_info\.json$/i, "");
      if (base && typeof info?.match_id === "number") {
        index.set(base, info);
      }
    } catch {
      // ignore bad json
    }
  }
  return index;
}

function commentaryFileToMatchInfoBaseName(filePath: string): string | null {
  const name = path.basename(filePath);
  // innings_1_<MATCH_BASE>_match_innings_1_commentary.json
  const m = name.match(/^innings_\d+_(.+)_match_innings_\d+_commentary\.json$/i);
  return m?.[1] ?? null;
}

async function importMatchFromCommentaryFile(filePath: string, matchInfoIndex: Map<string, MatchInfo>) {
  const rawContent = await fs.readFile(filePath, "utf-8");
  const json: CommentaryInnings = JSON.parse(rawContent);

  const fileName = path.basename(filePath);
  const base = commentaryFileToMatchInfoBaseName(filePath);
  const matchInfo = base ? matchInfoIndex.get(base) ?? null : null;
  if (!matchInfo) {
    console.warn(`Skipping commentary file (no match_info join): ${fileName}`);
    return;
  }

  const externalKey = String(matchInfo.match_id);

  // Idempotency: if a match with this externalKey already exists and has deliveries, skip.
  const existing = await prisma.match.findUnique({
    where: { externalKey },
    include: { deliveries: { take: 1 } }
  });
  if (existing && existing.deliveries.length > 0) {
    return;
  }

  const seasonYear = matchInfo.competition?.season;
  const seasonId = await ensureSeason(seasonYear);

  const homeTeamName = matchInfo.teama?.name;
  const awayTeamName = matchInfo.teamb?.name;
  const homeTeamId = await ensureTeam(homeTeamName);
  const awayTeamId = await ensureTeam(awayTeamName);

  const city = matchInfo.venue?.location ?? null;
  const venue = matchInfo.venue?.name ?? null;
  const matchDate = parseDateFromMatchInfo(matchInfo);

  // toss/winner in match_info are numeric team IDs
  const teamIdToName = new Map<number, string>(
    [matchInfo.teama, matchInfo.teamb]
      .map((t) => [toInt(t?.team_id, 0), (t?.name || "").trim()] as const)
      .filter((x) => x[0] && x[1])
  );
  const tossWinnerName = matchInfo.toss?.winner ? teamIdToName.get(matchInfo.toss.winner) : null;
  const tossWinnerTeamId = tossWinnerName ? await ensureTeam(tossWinnerName) : null;
  const tossDecision =
    matchInfo.toss?.decision === 1 ? "BAT" : matchInfo.toss?.decision === 2 ? "BOWL" : null;

  const winnerName = matchInfo.winning_team_id ? teamIdToName.get(matchInfo.winning_team_id) : null;
  const winnerTeamId = winnerName ? await ensureTeam(winnerName) : null;

  // result_type isn’t a perfect mapping; keep it simple for now
  const resultType =
    matchInfo.result_type === 2 ? "NORMAL" : matchInfo.result_type === 3 ? "TIE" : matchInfo.result_type === 4 ? "NO_RESULT" : null;

  const dlApplied = String(matchInfo.match_dls_affected).toLowerCase() === "true";

  const umpire1 = matchInfo.umpires ? matchInfo.umpires.split(",")[0]?.trim() : null;
  const umpire2 = matchInfo.umpires ? matchInfo.umpires.split(",")[1]?.trim() : null;

  // Build maps from the commentary payload (ids -> names)
  const playerIdToName = new Map<number, string>(
    (json.players || []).map((p) => [p.pid, (p.title || "").trim()] as const)
  );

  // Use inning-level team IDs for accurate batting/bowling team on each delivery
  const inningNumber = toInt(json.inning?.number, 0);
  const battingTid = toInt(json.inning?.batting_team_id, 0);
  const bowlingTid = toInt(json.inning?.fielding_team_id, 0);

  // Prefer team names from match_info for canonical Team rows
  const battingTeamName =
    teamIdToName.get(battingTid) ?? (json.teams || []).find((t) => t.tid === battingTid)?.title ?? null;
  const bowlingTeamName =
    teamIdToName.get(bowlingTid) ?? (json.teams || []).find((t) => t.tid === bowlingTid)?.title ?? null;

  const battingTeamId = await ensureTeam(battingTeamName);
  const bowlingTeamId = await ensureTeam(bowlingTeamName);

  await prisma.$transaction(async (tx) => {
    const match =
      existing ??
      (await tx.match.create({
        data: {
          externalKey,
          seasonId,
          city,
          venue,
          matchDate,
          homeTeamId,
          awayTeamId,
          tossWinnerTeamId,
          tossDecision: tossDecision as any,
          resultType: resultType as any,
          winnerTeamId,
          resultMargin: null,
          resultBy: null,
          dlApplied,
          umpire1,
          umpire2
        }
      }));

    // Import deliveries from commentaries array
    for (const c of json.commentaries || []) {
      const overNumber = toInt(c.over, 0);
      const ballInOver = toInt(c.ball, 0);
      if (!Number.isFinite(overNumber) || !Number.isFinite(ballInOver)) continue;

      const strikerName = playerIdToName.get(toInt(c.batsman_id, 0)) ?? null;
      const bowlerName = playerIdToName.get(toInt(c.bowler_id, 0)) ?? null;

      const strikerId = await ensurePlayer(strikerName);
      const bowlerId = await ensurePlayer(bowlerName);

      // non-striker: use the “other” batsman in the batsmen array when present
      const batsmenIds = (c.batsmen || []).map((b) => toInt(b.batsman_id, 0)).filter(Boolean);
      const nonStrikerPid = batsmenIds.find((id) => id && id !== toInt(c.batsman_id, 0)) ?? null;
      const nonStrikerName = nonStrikerPid ? playerIdToName.get(nonStrikerPid) ?? null : null;
      const nonStrikerId = await ensurePlayer(nonStrikerName);

      const runsTotal = toInt(c.run, 0);
      const runsBatsman = toInt(c.bat_run ?? 0, 0);
      const runsExtras = Math.max(0, runsTotal - runsBatsman);

      const dismissalKind = mapDismissalKind(c.how_out ?? null);
      const dismissedPid = c.wicket_batsman_id ? toInt(c.wicket_batsman_id, 0) : null;
      const dismissedName = dismissedPid ? playerIdToName.get(dismissedPid) ?? null : null;
      const dismissedPlayerId = dismissedPid ? await ensurePlayer(dismissedName) : null;

      await tx.delivery.upsert({
        where: {
          matchId_inningNumber_overNumber_ballInOver: {
            matchId: match.id,
            inningNumber,
            overNumber,
            ballInOver
          }
        },
        create: {
          matchId: match.id,
          inningNumber,
          overNumber,
          ballInOver,
          battingTeamId,
          bowlingTeamId,
          strikerId,
          nonStrikerId,
          bowlerId,
          runsBatsman,
          runsExtras,
          runsTotal,
          isWide: Boolean(c.wideball),
          isNoBall: Boolean(c.noball),
          isBye: toInt(c.bye_run, 0) > 0,
          isLegBye: toInt(c.legbye_run, 0) > 0,
          isPenalty: toInt(c.penalty_run, 0) > 0,
          dismissalKind: dismissalKind as any,
          dismissedPlayerId
        },
        update: {
          runsBatsman,
          runsExtras,
          runsTotal,
          isWide: Boolean(c.wideball),
          isNoBall: Boolean(c.noball),
          isBye: toInt(c.bye_run, 0) > 0,
          isLegBye: toInt(c.legbye_run, 0) > 0,
          isPenalty: toInt(c.penalty_run, 0) > 0,
          dismissalKind: dismissalKind as any,
          dismissedPlayerId
        }
      });
    }
  });
}

async function main() {
  console.log("Starting IPL data import for Boundary Insights...");
  console.log(`Data root: ${DATA_ROOT}`);

  try {
    const matchInfoIndex = await loadMatchInfoIndex();
    console.log(`Loaded ${matchInfoIndex.size} match_info records.`);

    const commentaryDir = path.join(DATA_ROOT, "match_innings_commentary");
    const files = await walkJsonFiles(commentaryDir);
    console.log(`Found ${files.length} innings commentary JSON files to process.`);

    for (const file of files) {
      try {
        await importMatchFromCommentaryFile(file, matchInfoIndex);
      } catch (err) {
        console.error(`Failed to import file ${file}`, err);
      }
    }
  } catch (err) {
    console.error("Fatal error during IPL import", err);
  } finally {
    await prisma.$disconnect();
  }
}

// Allow running via `npm run import:ipl`
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();

