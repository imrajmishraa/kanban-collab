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
import notesRoute from "./routes/notes/notes.routes";
import notificationsRoute from "./routes/notifications/notifications.routes";
import cronRoute from "./routes/internal/cron.route";

import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { issueCsrfCookie, csrfProtection } from "./middleware/csrf.middleware";

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

// CSRF — issue a readable token cookie, then require it back on unsafe methods.
app.use(issueCsrfCookie);
app.use(csrfProtection);

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
app.use("/", healthzRoute);

/*
 * The login budget, applied where guessing happens.
 *
 * `authLimiter` has `skipSuccessfulRequests: true`, so only *failures* count —
 * which is what a credential-guessing limit should measure, and the opposite of
 * what the rest of this router needed. It used to sit on the whole of
 * `/api/v1/auth`, so a 401 from `/me` (an expired access token) or `/refresh` (a
 * stale cookie) burned the same 15-minute budget as a wrong password. On a
 * shared or NAT address, a handful of idle tabs could lock everyone behind it
 * out of logging in.
 *
 * Now:
 *   - `/register` and `/login` keep the login budget, by prefix, before the
 *     router below claims them.
 *   - `/refresh`, `/logout` and `/me` fall through to `globalLimiter` — a 401
 *     from those is a normal state, not an attack.
 *   - `/oauth` was mounted *before* this line and so was never limited at all.
 *     It hits the provider on every call, so it now shares the budget; the
 *     start redirect is a 302 and therefore still skipped as a success.
 *
 * Order matters: the prefix mounts must precede `authRoute`, and `/oauth` must
 * precede the bare `/auth` mount or it is shadowed.
 */
app.use("/api/v1/auth/oauth", authLimiter, oauthRoute);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth", authRoute);

app.use("/api/v1", kanbanRoute);
app.use("/api/v1/workspaces", workspaceRoute);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/notes", notesRoute);
app.use("/api/v1/notifications", notificationsRoute);

// Scheduled jobs, invoked over HTTP by an external scheduler. Secret-guarded;
// serverless has no long-lived process for `node-cron` to live in.
app.use("/api/v1/internal/cron", cronRoute);

// TERMINAL

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
