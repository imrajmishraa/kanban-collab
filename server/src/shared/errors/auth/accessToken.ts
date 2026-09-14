import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

/**
 * 401 — access token was structurally valid but the signature check failed,
 * or the token was malformed.
 *
 * Client behavior: log the user out and ask them to sign in again.
 * (Do NOT try to refresh — an invalid token usually means tampering.)
 */
export function invalidAccessTokenError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.ACCESS_TOKEN_INVALID,
    { code: "ACCESS_TOKEN_INVALID" },
  );
}

/**
 * 401 — access token is well-formed and signed correctly, but its `exp`
 * claim is in the past.
 *
 * Client behavior: call /auth/refresh to get a new access token, then
 * retry the original request. This is the HAPPY PATH for token expiry.
 */
export function expiredAccessTokenError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.ACCESS_TOKEN_EXPIRED,
    { code: "ACCESS_TOKEN_EXPIRED" },
  );
}

/**
 * 401 — access token is well-formed but its `nbf` (not before) claim is
 * in the future.
 *
 * Client behavior: rare. Usually indicates clock skew between servers
 * or a misconfigured token issuer. Surface as "try again shortly".
 */
export function accessTokenNotActiveError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.ACCESS_TOKEN_NOT_ACTIVE,
    { code: "ACCESS_TOKEN_NOT_ACTIVE" },
  );
}

/**
 * 401 — no access token was provided at all (missing Authorization header,
 * or the header didn't start with "Bearer ").
 *
 * Client behavior: treat as anonymous, or redirect to login.
 */
export function missingAccessTokenError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.ACCESS_TOKEN_MISSING,
    { code: "ACCESS_TOKEN_MISSING" },
  );
}
