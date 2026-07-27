import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

export function invalidRefreshTokenError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.INVALID_REFRESH_TOKEN,
  );
}

export function expiredRefreshTokenError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.REFRESH_TOKEN_EXPIRED,
  );
}

export function missingRefreshTokenError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.REFRESH_TOKEN_MISSING,
  );
}

export function refreshTokenReuseDetectedError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.REFRESH_TOKEN_REUSE_DETECTED,
  );
}

export function refreshTokenNotActiveError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.REFRESH_TOKEN_NOT_ACTIVE,
  );
}