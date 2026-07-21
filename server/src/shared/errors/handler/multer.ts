import multer from "multer";
import { ApiError } from "../../../shared/utils/ApiError";

export const handleMulterError = (err: unknown): ApiError | null => {
  if (!(err instanceof multer.MulterError)) {
    return null;
  }

  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return new ApiError(413, "File size exceeded");

    case "LIMIT_FILE_COUNT":
      return new ApiError(400, "Too many files uploaded");

    case "LIMIT_UNEXPECTED_FILE":
      return new ApiError(400, "Unexpected file received");

    default:
      return new ApiError(400, err.message);
  }
};
