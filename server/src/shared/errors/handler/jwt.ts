import jwt from "jsonwebtoken";

import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

/**
 * FALLBACK matcher for raw `jsonwebtoken` errors that escaped the
 * use-case layer's error mapping (see `infrastructure/security/jwt.ts`).
 *
 * Normal auth flows should never reach this — `verifyAccessToken()` and
 * `verifyRefreshToken()` already convert JWT failures into specific
 * `ApiError`s (ACCESS_TOKEN_EXPIRED, REFRESH_TOKEN_REUSE_DETECTED, etc.)
 * with the right `code` for the client to branch on.
 *
 * This handler exists so that if a raw JWT error ever surfaces (e.g. from
 * a middleware that calls `jwt.verify()` directly), it still becomes a
 * clean 401 rather than a 500.
 */
export function handleJwtError(err: unknown): ApiError | null {
  if (err instanceof jwt.TokenExpiredError) {
    return new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_MESSAGE.ACCESS_TOKEN_EXPIRED,
      { code: "ACCESS_TOKEN_EXPIRED" },
    );
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_MESSAGE.ACCESS_TOKEN_INVALID,
      { code: "ACCESS_TOKEN_INVALID" },
    );
  }

  if (err instanceof jwt.NotBeforeError) {
    return new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_MESSAGE.ACCESS_TOKEN_NOT_ACTIVE,
      { code: "ACCESS_TOKEN_NOT_ACTIVE" },
    );
  }

  return null;
}
