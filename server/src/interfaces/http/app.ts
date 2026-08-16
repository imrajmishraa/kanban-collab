import express, { Request, Response, NextFunction } from "express";

import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";

import healthzRoute from "./routes/healthz/healthz.route";
import authRoute from "./routes/auth/auth.route";
import kanbanRoute from "./routes/kanban/kanban.routes";
import dashboardRoutes from "./routes/dashboard/dashboard";

import { logger } from "../../infrastructure/logging/logger";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";

import { ENV } from "../../config/env";

const app = express();

// =======================================
// Security Middlewares
// =======================================

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],

        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],

        fontSrc: ["'self'", "https://fonts.gstatic.com"],

        connectSrc: [
          "'self'",
          ENV.CLIENT_URL,
          "ws:",
          "wss:",
          "wss://collaboration.enterprise.com",
        ],
      },
    },

    crossOriginEmbedderPolicy: true,

    crossOriginOpenerPolicy: {
      policy: "same-origin",
    },

    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
  }),
);

// =======================================
// CORS
// =======================================

app.use(
  cors({
    origin: ENV.NODE_ENV === "production" ? ENV.CLIENT_URL : true,

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// =======================================
// Body Parsers
// =======================================

app.use(
  express.json({
    limit: "10kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

// =======================================
// Sanitization
// =======================================

app.use(mongoSanitize());

// =======================================
// Cookie Parser
// =======================================

app.use(cookieParser());

// =======================================
// HTTP Request Logger
// =======================================

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(
    {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    },
    "Incoming request",
  );

  next();
});

// =======================================
// Health Check
// =======================================

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

// =======================================
// API Routes
// =======================================

app.use("/api/v1", healthzRoute);

app.use("/api/v1/auth", authRoute);

app.use("/api/v1", kanbanRoute);

app.use("/api/v1", dashboardRoutes);



// =======================================
// 404 Handler
// =======================================

app.use(notFoundHandler);

// =======================================
// Global Error Handler
// =======================================

app.use(errorHandler);

export { app };
