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
  try {
    const parseResult = paginationSchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid query params", details: parseResult.error });
    }

    const { limit } = parseResult.data;
    console.log(`[Analytics] Fetching top ${limit} batsmen...`);
    const data = await getTopBatsmen(limit);
    console.log(`[Analytics] Successfully fetched ${data.length} batsmen`);
    res.json(data);
  } catch (error: any) {
    console.error("[Analytics] Error in getTopBatsmenHandler:", error);
    console.error("[Analytics] Error stack:", error.stack);
    console.error("[Analytics] Error details:", JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: "Failed to fetch top batsmen", 
      message: error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }
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
  try {
    const parseResult = paginationSchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid query params", details: parseResult.error });
    }

    const { limit } = parseResult.data;
    console.log(`[Analytics] Fetching top ${limit} bowlers...`);
    const data = await getTopBowlers(limit);
    console.log(`[Analytics] Successfully fetched ${data.length} bowlers`);
    res.json(data);
  } catch (error: any) {
    console.error("[Analytics] Error in getTopBowlersHandler:", error);
    console.error("[Analytics] Error stack:", error.stack);
    console.error("[Analytics] Error details:", JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: "Failed to fetch top bowlers", 
      message: error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }
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
  try {
    console.log("[Analytics] Fetching team performance summary...");
    const data = await getTeamPerformanceSummary();
    console.log(`[Analytics] Successfully fetched ${data.length} teams`);
    res.json(data);
  } catch (error: any) {
    console.error("[Analytics] Error in getTeamPerformance:", error);
    console.error("[Analytics] Error stack:", error.stack);
    console.error("[Analytics] Error details:", JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: "Failed to fetch team performance", 
      message: error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }
};

