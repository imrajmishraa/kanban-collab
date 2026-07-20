import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import healthzRouter from "./routes/healthz/healthz.route";

import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errors";

export function createApp(): Express {
  const app = express();

  /**
   * Security Middleware
   */
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", "https://cdn.jsdelivr.net"], // Allow CDN scripts (e.g., Mermaid)
         styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
         fontSrc: ["'self'", "https://fonts.gstatic.com"],
         connectSrc: ["'self'", "wss://collaboration.enterprise.com"]
       }
     },
     crossOriginEmbedderPolicy: true,
     crossOriginOpenerPolicy: { policy: "same-origin" },
     referrerPolicy: { policy: "strict-origin-when-cross-origin" }
   }));


  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  /**
   * Request Parsers
   */
  app.use(express.json());

  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  app.use(cookieParser());

  /**
   * HTTP Logger
   */
  app.use(morgan("dev"));

  /**
   * Health Check
   */
  app.get("/", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Kanban Collaboration Platform API",
    });
  });

  /**
   * API Routes
   */
  app.use("/api/v1", healthzRouter);

  /**
   * 404 Handler
   */
  app.use(notFoundHandler);

  /**
   * Global Error Handler
   */
  app.use(errorHandler);

  return app;
}
