import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

/**
 * 401 — refresh token was structurally valid but the signature check failed,
 * or the token was malformed.
 *
 * Client behavior: force logout. Do NOT retry with this token.
 */
export function invalidRefreshTokenError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.INVALID_REFRESH_TOKEN,
    { code: "REFRESH_TOKEN_INVALID" },
  );
}

/**
 * 401 — refresh token is well-formed and signed correctly, but its `exp`
 * claim is in the past.
 *
 * Client behavior: force logout and redirect to login.
 */
export function expiredRefreshTokenError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.REFRESH_TOKEN_EXPIRED,
    { code: "REFRESH_TOKEN_EXPIRED" },
  );
}

/**
 * 401 — no refresh token was provided (cookie missing).
 *
 * Client behavior: treat as unauthenticated, redirect to login.
 */
export function missingRefreshTokenError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.REFRESH_TOKEN_MISSING,
    { code: "REFRESH_TOKEN_MISSING" },
  );
}

/**
 * 401 — refresh token's `nbf` (not before) claim is in the future.
 *
 * Client behavior: rare — usually clock skew. Surface as "try again shortly".
 */
export function refreshTokenNotActiveError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.REFRESH_TOKEN_NOT_ACTIVE,
    { code: "REFRESH_TOKEN_NOT_ACTIVE" },
  );
}

/**
 * 401 — a rotated refresh token was replayed.
 *
 * This is a SECURITY event: all sessions for the user have been revoked
 * by `refresh.ts` before this error is thrown.
 *
 * Client behavior: force logout and, ideally, surface a message like
 * "Your session expired for security reasons. Please sign in again."
 */
export function refreshTokenReuseError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.REFRESH_TOKEN_REUSE_DETECTED,
    {
      code: "REFRESH_TOKEN_REUSE_DETECTED",
      // Expected condition — the rotation defense triggered as designed.
      // isOperational stays true so it logs at warn, not error.
      isOperational: true,
    },
  );
}




export function sessionRevokedError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.SESSION_REVOKED,
    { code: "SESSION_REVOKED" },
  );
}