import multer from "multer";

import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

export function handleMulterError(err: unknown): ApiError | null {
  if (!(err instanceof multer.MulterError)) {
    return null;
  }

  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return new ApiError(
        HTTP_STATUS.PAYLOAD_TOO_LARGE,
        ERROR_MESSAGE.FILE_SIZE_EXCEEDED,
      );

    case "LIMIT_FILE_COUNT":
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.FILE_COUNT_EXCEEDED,
      );

    case "LIMIT_UNEXPECTED_FILE":
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.UNEXPECTED_FILE,
      );

    case "LIMIT_FIELD_COUNT":
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.FIELD_COUNT_EXCEEDED,
      );

    case "LIMIT_FIELD_KEY":
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.FIELD_NAME_TOO_LONG,
      );

    case "LIMIT_FIELD_VALUE":
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.FIELD_VALUE_TOO_LONG,
      );

    case "LIMIT_PART_COUNT":
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.PART_COUNT_EXCEEDED,
      );

    default:
      return new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_MESSAGE.FILE_UPLOAD_FAILED,
      );
  }
}
