import { ApiError } from "../utils/ApiError";

import { internalServerError } from "./handler/custom";
import { handleJwtError } from "./handler/jwt";
import { handleMongooseError } from "./handler/mongoose";
import { handleMulterError } from "./handler/multer";
import { handleRedisError } from "./handler/redis";
import { handleZodError } from "./handler/zod";

type ErrorHandler = (err: unknown) => ApiError | null;

const handlers: readonly ErrorHandler[] = Object.freeze([
  handleMongooseError,
  handleZodError,
  handleJwtError,
  handleMulterError,
  handleRedisError,
]);

export function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) {
    return err;
  }

  for (const handler of handlers) {
    const normalizedError = handler(err);

    if (normalizedError) {
      return normalizedError;
    }
  }

  return internalServerError();
}
