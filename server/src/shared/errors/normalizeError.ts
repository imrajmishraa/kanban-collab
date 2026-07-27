import { ApiError } from "../utils/ApiError";

import { internalServerError } from "./handler/custom";
import { handleJwtError } from "./handler/jwt";
import { handleMongooseError } from "./handler/mongoose";
import { handleRedisError } from "./handler/redis";
import { handleZodError } from "./handler/zod";

const handlers = Object.freeze([
  handleMongooseError,
  handleRedisError,
  handleZodError,
  handleJwtError,
]);

export function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) {
    return err;
  }

  for (const handler of handlers) {
    const normalized = handler(err);

    if (normalized) {
      return normalized;
    }
  }

  return internalServerError();
}
