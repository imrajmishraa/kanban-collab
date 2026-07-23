import { ApiError } from "../utils/ApiError";
import { handleMongooseError } from "./handler/mongoose";
import { handleZodError } from "./handler/zod";
import { handleRedisError } from "./handler/redis";
import { internalServerError } from "./handler/custom";

export const normalizeError = (err: unknown): ApiError => {
  if (err instanceof ApiError) {
    return err;
  }

  return (
    handleMongooseError(err) ??
    handleRedisError(err) ??
    internalServerError()
  );
};
