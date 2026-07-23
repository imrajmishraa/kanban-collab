import jwt from "jsonwebtoken";
import { ApiError } from "../../../shared/utils/ApiError";
import { invalidAccessTokenError, expiredAccessTokenError } from "../auth/accessToken";


export const handleJwtError = (err: unknown): ApiError | null => {
  if (err instanceof jwt.TokenExpiredError) {
    return expiredAccessTokenError();
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return invalidAccessTokenError();
  }

  if (err instanceof jwt.NotBeforeError ) {
    return new ApiError(401, "Token is not active yet.")
  }

  return null;
};
