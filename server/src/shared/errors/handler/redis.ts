import { ApiError } from "../../../shared/utils/ApiError.js";

export const handleRedisError = (err: unknown): ApiError | null => {
  if (!(err instanceof Error)) {
    return null;
  }

  switch ((err as NodeJS.ErrnoException).code) {
    case "ECONNREFUSED":
      return new ApiError(503, "Redis connection refused.");

    case "ETIMEDOUT":
      return new ApiError(503, "Redis connection timed out.");

    case "ECONNRESET":
      return new ApiError(503, "Redis connection was reset.");

    default:
      return null;
  }
};
