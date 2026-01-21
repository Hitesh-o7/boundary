import { Request, Response } from "express";
import { prisma } from "@prisma/clientInstance";

export const healthCheck = async (_req: Request, res: Response) => {
  try {
    // Simple DB round-trip to verify connectivity
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      service: "Boundary Insights Backend",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "Boundary Insights Backend",
      timestamp: new Date().toISOString(),
      details: "Database connectivity issue"
    });
  }
};

