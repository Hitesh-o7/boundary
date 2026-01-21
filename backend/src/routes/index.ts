import { Router } from "express";
import { router as healthRouter } from "./healthRoutes";
import { router as analyticsRouter } from "./analyticsRoutes";
import { router as matchRouter } from "./matchRoutes";

export const router = Router();

router.use("/health", healthRouter);
router.use("/analytics", analyticsRouter);
router.use("/matches", matchRouter);

