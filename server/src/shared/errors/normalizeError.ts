import { ApiError } from "../utils/ApiError";
import { handleMongooseError } from "./handler/mongoose";
import { handleRedisError } from "./handler/redis";
import { handleZodError } from "./handler/zod";
import { handleJwtError } from "./handler/jwt";
import { internalServerError } from "./handler/custom";

export const normalizeError = (err: unknown): ApiError => {
  if (err instanceof ApiError) {
    return err;
  }

  return (
    handleMongooseError(err) ??
    handleRedisError(err) ??
    handleZodError(err) ??
    handleJwtError(err) ??
    internalServerError()
  );
};
