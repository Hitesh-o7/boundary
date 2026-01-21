-- Prisma migration for Boundary Insights initial schema
-- This mirrors prisma/schema.prisma and is provided so the project
-- has a starting migration checked into version control.

CREATE TYPE "MatchResultType" AS ENUM ('NORMAL', 'TIE', 'NO_RESULT');

CREATE TYPE "TossDecision" AS ENUM ('BAT', 'BOWL');

CREATE TYPE "DismissalKind" AS ENUM (
  'BOWLED',
  'CAUGHT',
  'LBW',
  'RUN_OUT',
  'STUMPED',
  'HIT_WICKET',
  'RETIRED_HURT',
  'OBSTRUCTING_FIELD',
  'HIT_BALL_TWICE'
);

CREATE TABLE "Season" (
  "id" SERIAL PRIMARY KEY,
  "year" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "Season_year_key" ON "Season"("year");

CREATE TABLE "Team" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "shortName" TEXT,
  "city" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
CREATE INDEX "Team_shortName_idx" ON "Team"("shortName");

CREATE TABLE "Player" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "fullName" TEXT,
  "country" TEXT,
  "battingStyle" TEXT,
  "bowlingStyle" TEXT,
  "role" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "Player_name_idx" ON "Player"("name");

CREATE TABLE "Match" (
  "id" SERIAL PRIMARY KEY,
  "externalKey" TEXT,
  "seasonId" INTEGER NOT NULL,
  "city" TEXT,
  "venue" TEXT,
  "matchDate" TIMESTAMPTZ NOT NULL,
  "matchNumber" INTEGER,
  "team1Id" INTEGER NOT NULL,
  "team2Id" INTEGER NOT NULL,
  "tossWinnerTeamId" INTEGER,
  "tossDecision" "TossDecision",
  "resultType" "MatchResultType",
  "winnerTeamId" INTEGER,
  "resultMargin" INTEGER,
  "resultBy" TEXT,
  "dlApplied" BOOLEAN DEFAULT FALSE,
  "umpire1" TEXT,
  "umpire2" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "Match"
  ADD CONSTRAINT "Match_seasonId_fkey"
  FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Match"
  ADD CONSTRAINT "Match_team1Id_fkey"
  FOREIGN KEY ("team1Id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Match"
  ADD CONSTRAINT "Match_team2Id_fkey"
  FOREIGN KEY ("team2Id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Match"
  ADD CONSTRAINT "Match_tossWinnerTeamId_fkey"
  FOREIGN KEY ("tossWinnerTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Match"
  ADD CONSTRAINT "Match_winnerTeamId_fkey"
  FOREIGN KEY ("winnerTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Match_externalKey_key" ON "Match"("externalKey");
CREATE INDEX "Match_seasonId_matchDate_idx" ON "Match"("seasonId", "matchDate");
CREATE INDEX "Match_team1Id_idx" ON "Match"("team1Id");
CREATE INDEX "Match_team2Id_idx" ON "Match"("team2Id");
CREATE INDEX "Match_winnerTeamId_idx" ON "Match"("winnerTeamId");

CREATE TABLE "Delivery" (
  "id" BIGSERIAL PRIMARY KEY,
  "matchId" INTEGER NOT NULL,
  "inningNumber" INTEGER NOT NULL,
  "overNumber" INTEGER NOT NULL,
  "ballInOver" INTEGER NOT NULL,
  "battingTeamId" INTEGER NOT NULL,
  "bowlingTeamId" INTEGER NOT NULL,
  "strikerId" INTEGER NOT NULL,
  "nonStrikerId" INTEGER NOT NULL,
  "bowlerId" INTEGER NOT NULL,
  "runsBatsman" INTEGER NOT NULL DEFAULT 0,
  "runsExtras" INTEGER NOT NULL DEFAULT 0,
  "runsTotal" INTEGER NOT NULL DEFAULT 0,
  "isWide" BOOLEAN NOT NULL DEFAULT FALSE,
  "isNoBall" BOOLEAN NOT NULL DEFAULT FALSE,
  "isBye" BOOLEAN NOT NULL DEFAULT FALSE,
  "isLegBye" BOOLEAN NOT NULL DEFAULT FALSE,
  "isPenalty" BOOLEAN NOT NULL DEFAULT FALSE,
  "dismissalKind" "DismissalKind",
  "dismissedPlayerId" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "Delivery"
  ADD CONSTRAINT "Delivery_matchId_fkey"
  FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Delivery"
  ADD CONSTRAINT "Delivery_battingTeamId_fkey"
  FOREIGN KEY ("battingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Delivery"
  ADD CONSTRAINT "Delivery_bowlingTeamId_fkey"
  FOREIGN KEY ("bowlingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Delivery"
  ADD CONSTRAINT "Delivery_strikerId_fkey"
  FOREIGN KEY ("strikerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Delivery"
  ADD CONSTRAINT "Delivery_nonStrikerId_fkey"
  FOREIGN KEY ("nonStrikerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Delivery"
  ADD CONSTRAINT "Delivery_bowlerId_fkey"
  FOREIGN KEY ("bowlerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Delivery"
  ADD CONSTRAINT "Delivery_dismissedPlayerId_fkey"
  FOREIGN KEY ("dismissedPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Delivery_match_inning_over_ball_key"
  ON "Delivery"("matchId", "inningNumber", "overNumber", "ballInOver");

CREATE INDEX "Delivery_matchId_idx" ON "Delivery"("matchId");
CREATE INDEX "Delivery_battingTeamId_idx" ON "Delivery"("battingTeamId");
CREATE INDEX "Delivery_bowlingTeamId_idx" ON "Delivery"("bowlingTeamId");
CREATE INDEX "Delivery_strikerId_idx" ON "Delivery"("strikerId");
CREATE INDEX "Delivery_bowlerId_idx" ON "Delivery"("bowlerId");

