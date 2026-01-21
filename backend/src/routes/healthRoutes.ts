import { Router } from "express";
import { healthCheck } from "@controllers/healthController";

export const router = Router();

router.get("/", healthCheck);

