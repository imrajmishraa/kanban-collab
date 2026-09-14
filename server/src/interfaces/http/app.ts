import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import crypto from "node:crypto";

import { ENV } from "../../config/env";
import { httpLogger } from "../../infrastructure/logging/childLogger";

import healthzRoute from "./routes/healthz/healthz.route";
import authRoute from "./routes/auth/auth.route";
import oauthRoute from "./routes/auth/oauthRoutes";
import kanbanRoute from "./routes/kanban/kanban.routes";
import dashboardRoutes from "./routes/dashboard/dashboard";
import workspaceRoute from "./routes/kanban/workspace/workspaceRoutes";

import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";

// APP

const app = express();

if (ENV.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

// RATE LIMITERS

const globalLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests from this IP. Please try again later.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: ENV.AUTH_RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

// SECURITY

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: [
          "'self'",
          ENV.CLIENT_URL,
          "ws:",
          "wss:",
          ...ENV.CORS_ORIGINS,
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

app.use(
  cors({
    origin: ENV.CORS_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-Id",
      "X-CSRF-Token",
    ],
    exposedHeaders: ["X-Request-Id", "Retry-After"],
    maxAge: 600,
  }),
);

// PARSERS

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// REQUEST ID + LOGGING

app.use((req: Request, res: Response, next: NextFunction) => {
  const incoming = req.headers["x-request-id"];
  const requestId =
    typeof incoming === "string" && incoming.length > 0
      ? incoming
      : crypto.randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    httpLogger.debug(
      {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
        ip: req.ip,
      },
      "HTTP request",
    );
  });

  next();
});

// ROUTES

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

app.use("/api/v1", globalLimiter);
app.use("/healthz", healthzRoute);

// OAuth before auth — public routes, must not be shadowed
app.use("/api/v1/auth/oauth", oauthRoute);
app.use("/api/v1/auth", authLimiter, authRoute);

app.use("/api/v1", kanbanRoute);
app.use("/api/v1/workspaces", workspaceRoute);
app.use("/api/v1/dashboard", dashboardRoutes);

// TERMINAL

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
