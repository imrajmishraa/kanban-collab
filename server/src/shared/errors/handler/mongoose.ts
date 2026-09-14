import mongoose from "mongoose";

import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

/**
 * Matches Mongoose / MongoDB driver errors and converts them to ApiError.
 *
 * Handles:
 *   - CastError                 → 400 (invalid ObjectId, wrong type)
 *   - ValidationError           → 400/422 (schema validation failed)
 *   - MongoServerError 11000    → 409 (unique index violation)
 *
 * Returns `null` for anything else so the error chain can try the next matcher.
 */
export function handleMongooseError(err: unknown): ApiError | null {
  // ── 1. CastError — bad ObjectId or wrong field type ───────────────────────
  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_MESSAGE.INVALID_OBJECT_ID,
      {
        errors: [
          {
            field: err.path,
            message: `Invalid value for '${err.path}'.`,
            code: "CAST_ERROR",
          },
        ],
        code: "INVALID_OBJECT_ID",
      },
    );
  }

  // ── 2. ValidationError — schema-level validation failed ───────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
      code: "VALIDATION_ERROR",
    }));

    return new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_MESSAGE.VALIDATION_FAILED,
      {
        errors,
        code: "VALIDATION_FAILED",
      },
    );
  }

  // ── 3. Duplicate key (unique index violation) ─────────────────────────────
  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    const entries = Object.entries(err.keyValue ?? {});

    const errors = entries.map(([field, value]) => ({
      field,
      message: `${field} '${String(value)}' already exists.`,
      code: "DUPLICATE_KEY",
    }));

    return new ApiError(
      HTTP_STATUS.CONFLICT,
      ERROR_MESSAGE.DUPLICATE_RESOURCE,
      {
        errors,
        code: "DUPLICATE_RESOURCE",
      },
    );
  }

  // Not a Mongoose error we recognize
  return null;
}
