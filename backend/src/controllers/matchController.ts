import { Request, Response } from "express";
import { z } from "zod";
import { listMatches } from "@services/matchService";

const matchListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1)),
  pageSize: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  seasonId: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().optional()),
  teamId: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().optional())
});

/**
 * @openapi
 * /matches:
 *   get:
 *     summary: List matches (paginated)
 *     tags:
 *       - Matches
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Page size (default 20)
 *       - in: query
 *         name: seasonId
 *         schema:
 *           type: integer
 *         description: Filter matches by season ID
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: integer
 *         description: Filter matches where team participated
 *     responses:
 *       200:
 *         description: Paginated list of matches
 */
export const listMatchesHandler = async (req: Request, res: Response) => {
  try {
    const parseResult = matchListQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid query params", details: parseResult.error });
    }

    const { page, pageSize, seasonId, teamId } = parseResult.data;
    console.log(`[Matches] Fetching page ${page}, size ${pageSize}, season ${seasonId}, team ${teamId}`);
    const result = await listMatches(page, pageSize, { seasonId, teamId });
    console.log(`[Matches] Successfully fetched ${result.items.length} matches`);
    res.json(result);
  } catch (error: any) {
    console.error("[Matches] Error in listMatchesHandler:", error);
    console.error("[Matches] Error stack:", error.stack);
    res.status(500).json({ 
      error: "Failed to fetch matches", 
      message: error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }
};

