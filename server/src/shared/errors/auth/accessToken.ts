import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

export function invalidAccessTokenError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.ACCESS_TOKEN_INVALID,
  );
}

export function expiredAccessTokenError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.ACCESS_TOKEN_EXPIRED,
  );
}

export function missingAccessTokenError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.ACCESS_TOKEN_MISSING,
  );
}

export function accessTokenNotActiveError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.ACCESS_TOKEN_NOT_ACTIVE,
  );
}
