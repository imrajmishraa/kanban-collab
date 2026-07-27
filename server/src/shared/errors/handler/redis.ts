import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

export function handleRedisError(err: unknown): ApiError | null {
  if (!(err instanceof Error)) {
    return null;
  }

  const error = err as NodeJS.ErrnoException;

  switch (error.code) {
    case "ECONNREFUSED":
      return new ApiError(
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_MESSAGE.REDIS_CONNECTION_REFUSED,
      );

    case "ETIMEDOUT":
      return new ApiError(
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_MESSAGE.REDIS_CONNECTION_TIMEOUT,
      );

    case "ECONNRESET":
      return new ApiError(
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_MESSAGE.REDIS_CONNECTION_RESET,
      );

    default:
      return null;
  }
}
