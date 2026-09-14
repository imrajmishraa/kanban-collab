import multer from "multer";

import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

/**
 * Matches Multer's `MulterError` and maps each limit code to a 4xx ApiError.
 *
 * Returns `null` for anything else so the error chain continues.
 *
 * Reference: https://github.com/expressjs/multer/blob/master/lib/multer-error.js
 */
export function handleMulterError(err: unknown): ApiError | null {
  if (!(err instanceof multer.MulterError)) {
    return null;
  }

  // Multer attaches the offending field name — pass it through when present.
  const field = (err as multer.MulterError & { field?: string }).field;

  switch (err.code) {
    // ── File size ─────────────────────────────────────────────────────────────
    case "LIMIT_FILE_SIZE":
      return new ApiError(
        HTTP_STATUS.PAYLOAD_TOO_LARGE,
        ERROR_MESSAGE.FILE_SIZE_EXCEEDED,
        {
          errors: field
            ? [
                {
                  field,
                  message: `File in '${field}' exceeds the size limit.`,
                  code: err.code,
                },
              ]
            : [],
          code: "FILE_SIZE_EXCEEDED",
        },
      );

    // ── File count ────────────────────────────────────────────────────────────
    case "LIMIT_FILE_COUNT":
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.FILE_COUNT_EXCEEDED,
        {
          errors: field
            ? [
                {
                  field,
                  message: `Too many files uploaded to '${field}'.`,
                  code: err.code,
                },
              ]
            : [],
          code: "FILE_COUNT_EXCEEDED",
        },
      );

    // ── Unexpected file (wrong field name) ────────────────────────────────────
    case "LIMIT_UNEXPECTED_FILE":
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.UNEXPECTED_FILE,
        {
          errors: field
            ? [
                {
                  field,
                  message: `Unexpected file field '${field}'.`,
                  code: err.code,
                },
              ]
            : [],
          code: "UNEXPECTED_FILE",
        },
      );

    // ── Field count ───────────────────────────────────────────────────────────
    case "LIMIT_FIELD_COUNT":
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.FIELD_COUNT_EXCEEDED,
        { code: "FIELD_COUNT_EXCEEDED" },
      );

    // ── Field name too long ───────────────────────────────────────────────────
    case "LIMIT_FIELD_KEY":
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.FIELD_NAME_TOO_LONG,
        {
          errors: field
            ? [
                {
                  field,
                  message: `Field name '${field}' is too long.`,
                  code: err.code,
                },
              ]
            : [],
          code: "FIELD_NAME_TOO_LONG",
        },
      );

    // ── Field value too long ──────────────────────────────────────────────────
    case "LIMIT_FIELD_VALUE":
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.FIELD_VALUE_TOO_LONG,
        {
          errors: field
            ? [
                {
                  field,
                  message: `Value in '${field}' is too long.`,
                  code: err.code,
                },
              ]
            : [],
          code: "FIELD_VALUE_TOO_LONG",
        },
      );

    // ── Part count (multipart/form-data parts) ────────────────────────────────
    case "LIMIT_PART_COUNT":
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.PART_COUNT_EXCEEDED,
        { code: "PART_COUNT_EXCEEDED" },
      );

    // ── Any other Multer error ────────────────────────────────────────────────
    default:
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.FILE_UPLOAD_FAILED,
        { code: "FILE_UPLOAD_FAILED" },
      );
  }
}
