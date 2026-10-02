import path from "node:path";
import pino from "pino";
import { ENV } from "../../config/env";

const IS_DEV = ENV.NODE_ENV === "development";
const IS_TEST = ENV.NODE_ENV === "test";

/**
 * Log file path — env-driven with a safe default.
 * Never default to /var/log (needs root; fails in CI + macOS).
 * Add `LOG_FILE=...` to env.ts if you want to override in production.
 */
const LOG_FILE =
  process.env["LOG_FILE"] ?? path.resolve(process.cwd(), "logs", "app.log");


/**
 * Anything both destinations share that we may need to drain on shutdown.
 * Both pino transports (ThreadStream) and pino.destination (SonicBoom)
 * expose flushSync().
 */
type Flushable = { flushSync: () => void };

let destination: Flushable | undefined;

/**
 * Build the write destination based on environment:
 *   - test    → pino's default stdout (never touch disk during tests)
 *   - dev     → pretty-printed stdout via pino-pretty transport
 *   - prod    → rotating file transport: a new file every day AND
 *               whenever the current one reaches 50 MB (whichever
 *               comes first). Without rotation, app.log grows without
 *               bound — a production hazard on a long-lived server.
 *
 * pino-roll runs in a worker thread, like pino-pretty — it must be
 * installed as a runtime dependency (not dev).
 */
function buildDestination() {
  if (IS_DEV) {
    return pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
      },
    });
  }

  return pino.transport({
    target: "pino-roll",
    options: {
      file: LOG_FILE,
      frequency: "daily",
      size: "50m",
      mkdir: true, // creates ./logs/ if missing
    },
  });
}

/**
 * Flush any buffered log lines synchronously — call this from your
 * graceful-shutdown handler (SIGTERM/SIGINT) AFTER closing servers and
 * DB connections, so the final "shutting down" entries actually reach
 * disk. Safe to call multiple times; no-op when logging to stdout.
 */
export function flushLogger(): void {
  destination?.flushSync();
}

/**
 * Serializes an error chain recursively (depth-capped so a cyclic
 * cause chain can't hang the logger).
 */
function serializeError(err: unknown, depth = 0): Record<string, unknown> {
  if (!(err instanceof Error)) {
    return { value: err };
  }

  const e = err as Error & {
    code?: string;
    statusCode?: number;
    status?: number;
    isOperational?: boolean;
    cause?: unknown;
  };

  const out: Record<string, unknown> = {
    type: e.name,
    message: e.message,
    stack: e.stack,

    // ApiError extras
    code: e.code,
    statusCode: e.statusCode ?? e.status,
    isOperational: e.isOperational,
  };

  if (depth < 3 && e.cause !== undefined) {
    out["cause"] = serializeError(e.cause, depth + 1);
  }

  return out;
}


const pinoOptions: pino.LoggerOptions = {
  level: ENV.LOG_LEVEL,

  base: {
    service: "kanban-collaboration-server",
    environment: ENV.NODE_ENV,
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: [
      // ─── Request / response headers ─────────────────────────────────
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['set-cookie']",
      "req.headers['x-api-key']",
      "req.headers['x-csrf-token']",
      "res.headers['set-cookie']",

      // ─── Parsed cookies (express cookie-parser output) ──────────────
      // This is where the refresh token actually lives at runtime —
      // `req.cookies.refreshToken` — so the whole jar gets redacted.
      "req.cookies",
      "*.cookies",
      "cookies",

      // ─── Request bodies (zod-validatable payloads) ──────────────────
      "req.body.password",
      "req.body.newPassword",
      "req.body.currentPassword",
      "req.body.confirmPassword",
      "req.body.token",
      "req.body.accessToken",
      "req.body.refreshToken",
      "req.body.apiKey",
      "req.body.secret",

      // ─── Body / payload — both top-level and nested ─────────────────
      "password",
      "*.password",
      "passwordHash",
      "*.passwordHash",
      "token",
      "*.token",
      "accessToken",
      "*.accessToken",
      "refreshToken",
      "*.refreshToken",
      "refreshTokenHash",
      "*.refreshTokenHash",
      "secret",
      "*.secret",
      "apiKey",
      "*.apiKey",
      "authorization",
      "*.authorization",

      // ─── PII ────────────────────────────────────────────────────────
      "creditCard",
      "*.creditCard",
      "cvv",
      "*.cvv",
      "ssn",
      "*.ssn",
    ],
    censor: "[REDACTED]",
  },

  serializers: {
    /**
     * Error serializer aligned with our ApiError shape.
     *
     *   ApiError: { statusCode, code, isOperational, message, stack, cause? }
     *   Error:    { message, stack }
     *
     * Serializes the full `cause` chain (up to depth 3) so the original
     * stack preserved by ApiError's `{ cause }` option shows up in logs
     * and in any downstream log shipper.
     */
    err: (err: unknown) => serializeError(err),

    req: (req: {
      method?: string;
      url?: string;
      headers?: unknown;
      params?: unknown;
      query?: unknown;
      ip?: string;
      socket?: { remoteAddress?: string };
    }) => ({
      method: req.method,
      url: req.url,
      headers: req.headers, // sensitive ones redacted above
      // FIX: was `req.remoteAddress` — that property doesn't exist on an
      // Express request, so it always serialized as undefined and got
      // dropped from the log line. req.ip respects express "trust proxy".
      remoteAddress: req.ip ?? req.socket?.remoteAddress,
      params: req.params,
      query: req.query,
    }),

    res: (res: { statusCode?: number; getHeaders?: () => unknown }) => ({
      statusCode: res.statusCode,
      headers: res.getHeaders?.(),
    }),
  },
};

// In test, use pino's default stdout stream — no filesystem, no worker
// threads. Otherwise, build the destination once and remember it so
// flushLogger() can drain it on shutdown.
function buildLogger(): pino.Logger {
  if (IS_TEST) return pino(pinoOptions);

  const dest = buildDestination();
  destination = dest;
  return pino(pinoOptions, dest);
}

export const logger = buildLogger();
