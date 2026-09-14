import { ApiError } from "../utils/ApiError";

import { internalServerError } from "./handler/generic";
import { handleJwtError } from "./handler/jwt";
import { handleMongooseError } from "./handler/mongoose";
import { handleMulterError } from "./handler/multer";
import { handleRedisError } from "./handler/redis";
import { handleZodError } from "./handler/zod";

type ErrorMatcher = (err: unknown) => ApiError | null;

/**
 * Ordered list of matchers. First non-null result wins.
 *
 * Order rationale (cosmetic — no two matchers share a class):
 *   1. Mongoose  — CastError, ValidationError, duplicate keys
 *   2. Zod       — request body / params / query validation
 *   3. JWT       — access / refresh token failures
 *   4. Multer    — file upload limit errors
 *   5. Redis     — cache & pub-sub connectivity failures
 */
const MATCHERS: readonly ErrorMatcher[] = Object.freeze([
  handleMongooseError,
  handleZodError,
  handleJwtError,
  handleMulterError,
  handleRedisError,
]);

/**
 * Convert any thrown value into a non-null `ApiError`.
 *
 * Guarantees:
 *   - Already-normalized ApiErrors pass through unchanged
 *   - First matching matcher wins
 *   - Fallback 500 preserves the original error as `.cause` for logging
 *     and captures the original stack when available
 */
export function normalizeError(err: unknown): ApiError {
  // ── 1. Already normalized ────────────────────────────────────────────────
  if (err instanceof ApiError) {
    return err;
  }

  // ── 2. Try each matcher ──────────────────────────────────────────────────
  for (const match of MATCHERS) {
    const apiError = match(err);
    if (apiError) return apiError;
  }

  // ── 3. Fallback — preserve the original for logging ──────────────────────
  return internalServerError({
    cause: err,
    stack: err instanceof Error ? err.stack : undefined,
  });
}
