import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

/**
 * 500 — genuine unexpected failure.
 *
 * `isOperational: false` marks this as a bug rather than an expected
 * condition. Your error handler can use that flag to:
 *   - Log at `error` level (vs `warn` for operational errors)
 *   - Send to Sentry / Grafana / on-call alerting
 *   - Omit stack traces from the response in production
 */
export function internalServerError(
  options: { cause?: unknown; stack?: string } = {},
): ApiError {
  const err = new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
    {
      code: "INTERNAL_SERVER_ERROR",
      isOperational: false,
      stack: options.stack,
    },
  );

  // Preserve the original error for logging without exposing it to clients
  if (options.cause) {
    (err as { cause?: unknown }).cause = options.cause;
  }

  return err;
}

/**
 * 400 — the path or query parameter wasn't a valid Mongo ObjectId.
 *
 * This is client-triggerable, so it's operational (not a bug) — the
 * client just sent malformed input.
 */
export function invalidObjectIdError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.INVALID_OBJECT_ID,
    { code: "INVALID_OBJECT_ID" },
  );
}
