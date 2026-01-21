import { Request, Response } from "express";
import { z } from "zod";
import {
  getTopBatsmen,
  getTopBowlers,
  getTeamPerformanceSummary
} from "@services/analyticsService";

const paginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .pipe(z.number().int().min(1).max(100))
});

/**
 * @openapi
 * /analytics/top-batsmen:
 *   get:
 *     summary: Top batsmen by total runs
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of players to return (default 10)
 *     responses:
 *       200:
 *         description: List of top batsmen
 */
export const getTopBatsmenHandler = async (req: Request, res: Response) => {
  const parseResult = paginationSchema.safeParse(req.query);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid query params", details: parseResult.error });
  }

  const { limit } = parseResult.data;
  const data = await getTopBatsmen(limit);
  res.json(data);
};

/**
 * @openapi
 * /analytics/top-bowlers:
 *   get:
 *     summary: Top bowlers by wickets
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of players to return (default 10)
 *     responses:
 *       200:
 *         description: List of top bowlers
 */
export const getTopBowlersHandler = async (req: Request, res: Response) => {
  const parseResult = paginationSchema.safeParse(req.query);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid query params", details: parseResult.error });
  }

  const { limit } = parseResult.data;
  const data = await getTopBowlers(limit);
  res.json(data);
};

/**
 * @openapi
 * /analytics/team-performance:
 *   get:
 *     summary: Team performance summary
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Performance summary per team
 */
export const getTeamPerformance = async (_req: Request, res: Response) => {
  const data = await getTeamPerformanceSummary();
  res.json(data);
};

