import type { Request, Response, NextFunction } from "express";

import { httpLogger } from "../../../infrastructure/logging/childLogger";
import { normalizeError } from "../../../shared/errors/normalizeError";
import { ENV } from "../../../config/env";

/**
 * Terminal error middleware.
 *
 * Express detects error handlers by function arity — this MUST have exactly
 * 4 parameters. Removing `next` silently turns it into a normal middleware.
 *
 * Flow:
 *   1. If headers are already sent → delegate to Express (can't change status)
 *   2. Normalize anything thrown into an ApiError
 *   3. Log at the right level based on `isOperational`
 *   4. Respond with an ApiResponse-shaped envelope
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // ── 1. Response already started (streaming, partial write) ───────────────
  // We can't change the status code or body now — delegate.
  if (res.headersSent) {
    next(err);
    return;
  }

  // ── 2. Normalize everything into an ApiError ─────────────────────────────
  const error = normalizeError(err);

  // ── 3. Log — level depends on isOperational ──────────────────────────────
  // Expected conditions (401, 404, 409, 422, 429) → warn
  // Bugs / infra failures (500) → error, with the original preserved as
  // `.cause` so the log shows the real stack.
  const logPayload = {
    err: error, // ApiError — pino's err serializer unwraps .cause recursively
    statusCode: error.statusCode,
    code: error.code,
    isOperational: error.isOperational,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    requestId: req.id, // set by the request-id middleware in server.ts
  };

  if (error.isOperational) {
    httpLogger.warn(logPayload, error.message);
  } else {
    httpLogger.error(logPayload, error.message);
  }

  // ── 4. Build response envelope ────────────────────────────────────────────
  const body: Record<string, unknown> = {
    statusCode: error.statusCode,
    success: false,
    message: error.message,
    errors: error.errors,
    data: error.data,
  };

  // Include the machine-readable code only when present
  if (error.code) {
    body.code = error.code;
  }

  // Expose the stack in dev for non-operational errors — never in production
  if (ENV.NODE_ENV === "development" && !error.isOperational && error.stack) {
    body.stack = error.stack;
  }

  res.status(error.statusCode).json(body);
}
