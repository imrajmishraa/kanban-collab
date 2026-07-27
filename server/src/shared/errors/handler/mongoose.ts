import mongoose from "mongoose";

import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

export function handleMongooseError(err: unknown): ApiError | null {
  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_MESSAGE.INVALID_OBJECT_ID,
      [`Invalid '${err.path}'.`],
    );
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_MESSAGE.VALIDATION_FAILED,
      [...new Set(Object.values(err.errors).map((e) => e.message))],
    );
  }

  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    const entries = Object.entries(err.keyValue ?? {});

    return new ApiError(
      HTTP_STATUS.CONFLICT,
      ERROR_MESSAGE.DUPLICATE_RESOURCE,
      entries.map(([field, value]) => `${field} '${value}' already exists.`),
    );
  }

  return null;
}
