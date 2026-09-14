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
  process.env.LOG_FILE ?? path.resolve(process.cwd(), "logs", "app.log");

/**
 * Build the write destination based on environment:
 *   - test    → stdout (never touch disk during tests)
 *   - dev     → pretty-printed stdout via pino-pretty transport
 *   - prod    → async file stream in ./logs/app.log (auto-created)
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

  return pino.destination({
    dest: LOG_FILE,
    sync: false,
    mkdir: true, // creates ./logs/ if missing
  });
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
      "secret",
      "*.secret",
      "apiKey",
      "*.apiKey",

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
     * Recursively serializes `cause` so the original stack (preserved by
     * internalServerError({ cause })) shows up in logs and Sentry.
     */
    err: (err: unknown) => {
      if (!(err instanceof Error)) {
        return err;
      }

      const e = err as Error & {
        code?: string;
        statusCode?: number;
        status?: number;
        isOperational?: boolean;
        cause?: unknown;
      };

      return {
        type: e.name,
        message: e.message,
        stack: e.stack,

        // ApiError extras
        code: e.code,
        statusCode: e.statusCode ?? e.status,
        isOperational: e.isOperational,

        // Preserve the underlying error for 500s
        cause:
          e.cause instanceof Error
            ? {
                type: e.cause.name,
                message: e.cause.message,
                stack: e.cause.stack,
                code: (e.cause as Error & { code?: string }).code,
              }
            : e.cause,
      };
    },

    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: req.headers, // sensitive ones redacted above
      remoteAddress: req.remoteAddress,
      params: req.params,
      query: req.query,
    }),

    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.getHeaders(),
    }),
  },
};

// In test, use pino's default stdout stream — no filesystem, no worker threads.
export const logger = IS_TEST
  ? pino(pinoOptions)
  : pino(pinoOptions, buildDestination());
