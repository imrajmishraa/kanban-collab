import { ApiError } from "../../../shared/utils/ApiError";
import mongoose from "mongoose";

export const handleMongooseError = (err: unknown): ApiError | null => {
  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(400, "Invalid ObjectId");
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return new ApiError(
      400,
      "Validation failed",
      Object.values(err.errors).map((e) => e.message),
    );
  }

  return null;
};
