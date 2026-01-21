import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import { router as apiRouter } from "@routes/index";
import { swaggerUi, swaggerSpec } from "@openapi/swagger";

dotenv.config();

export const createApp = (): Application => {
  const app = express();

  // Basic security middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(morgan("dev"));

  // Health check root shortcut
  app.get("/", (_req, res) => {
    res.json({ name: "Boundary Insights Backend", status: "ok" });
  });

  // API routes
  app.use("/api", apiRouter);

  // Swagger documentation
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Global error handler
  app.use(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error(err);
      const status = err.status || 500;
      res.status(status).json({
        error: {
          message: err.message || "Internal Server Error",
          details: err.details || undefined
        }
      });
    }
  );

  return app;
};

