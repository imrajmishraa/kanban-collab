import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

/**
 * Shape of the error objects thrown by `ioredis` / `node-redis`.
 * Both libraries attach a `code` on network failures, but some app-level
 * errors (ReplyError, MaxRetriesPerRequestError) only carry `name`.
 */
interface RedisErrorLike extends Error {
  code?: string;
  name: string;
}

const REDIS_NETWORK_CODES = new Set([
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ECONNRESET",
  "EPIPE",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "ENETUNREACH",
]);

const REDIS_APP_ERROR_NAMES = new Set([
  "ReplyError",
  "MaxRetriesPerRequestError",
  "ClusterAllFailedError",
  "AbortError",
  "ConnectionTimeoutError",
]);

/**
 * Map a Redis error to an ApiError (503) or return `null` for non-Redis errors.
 *
 * Distinguishes:
 *   - Network-level failures (ECONNREFUSED / ETIMEDOUT / ECONNRESET / …)
 *   - Application-level Redis errors (ReplyError, MaxRetriesPerRequestError, …)
 *
 * Client can branch on `err.code`:
 *   - "REDIS_CONNECTION_REFUSED"
 *   - "REDIS_CONNECTION_TIMEOUT"
 *   - "REDIS_CONNECTION_RESET"
 *   - "REDIS_UNAVAILABLE"
 */
export function handleRedisError(err: unknown): ApiError | null {
  if (!(err instanceof Error)) return null;

  const error = err as RedisErrorLike;

  // ── Network-level failures ────────────────────────────────────────────────
  if (error.code && REDIS_NETWORK_CODES.has(error.code)) {
    switch (error.code) {
      case "ECONNREFUSED":
        return new ApiError(
          HTTP_STATUS.SERVICE_UNAVAILABLE,
          ERROR_MESSAGE.REDIS_CONNECTION_REFUSED,
          { code: "REDIS_CONNECTION_REFUSED" },
        );

      case "ETIMEDOUT":
        return new ApiError(
          HTTP_STATUS.SERVICE_UNAVAILABLE,
          ERROR_MESSAGE.REDIS_CONNECTION_TIMEOUT,
          { code: "REDIS_CONNECTION_TIMEOUT" },
        );

      case "ECONNRESET":
        return new ApiError(
          HTTP_STATUS.SERVICE_UNAVAILABLE,
          ERROR_MESSAGE.REDIS_CONNECTION_RESET,
          { code: "REDIS_CONNECTION_RESET" },
        );

      // Any other network code → generic unavailable
      default:
        return new ApiError(
          HTTP_STATUS.SERVICE_UNAVAILABLE,
          ERROR_MESSAGE.REDIS_UNAVAILABLE,
          {
            code: "REDIS_UNAVAILABLE",
            isOperational: true,
          },
        );
    }
  }

  // ── Application-level Redis errors ────────────────────────────────────────
  if (REDIS_APP_ERROR_NAMES.has(error.name)) {
    return new ApiError(
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      ERROR_MESSAGE.REDIS_UNAVAILABLE,
      {
        code: "REDIS_UNAVAILABLE",
        isOperational: true,
      },
    );
  }

  // Not a Redis error — let the next handler try
  return null;
}
