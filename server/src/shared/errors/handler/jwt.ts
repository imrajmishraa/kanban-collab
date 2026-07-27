import jwt from "jsonwebtoken";

import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

export function handleJwtError(err: unknown): ApiError | null {
  if (err instanceof jwt.TokenExpiredError) {
    return new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_MESSAGE.ACCESS_TOKEN_EXPIRED,
    );
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_MESSAGE.ACCESS_TOKEN_INVALID,
    );
  }

  if (err instanceof jwt.NotBeforeError) {
    return new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_MESSAGE.ACCESS_TOKEN_NOT_ACTIVE,
    );
  }

  return null;
}
