import { ApiError } from "../utils/ApiError";

import { handleZodError } from "./handler/zod";
import { handleRedisError } from "./handler/redis";

export const normalizeError = (err: unknown): ApiError => {
  if (err instanceof ApiError) {
    return err;
  }

  return (
    handleZodError(err) ??
    handleRedisError(err) ??
    new ApiError(500, "Internal Server Error")
  );
};
