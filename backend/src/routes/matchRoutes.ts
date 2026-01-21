import { Router } from "express";
import { listMatchesHandler } from "@controllers/matchController";

export const router = Router();

router.get("/", listMatchesHandler);

