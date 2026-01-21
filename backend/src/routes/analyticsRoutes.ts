import { Router } from "express";
import {
  getTopBatsmenHandler,
  getTopBowlersHandler,
  getTeamPerformance
} from "@controllers/analyticsController";

export const router = Router();

router.get("/top-batsmen", getTopBatsmenHandler);
router.get("/top-bowlers", getTopBowlersHandler);
router.get("/team-performance", getTeamPerformance);

