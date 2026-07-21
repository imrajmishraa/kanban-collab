import { ZodError } from "zod";
import { ApiError } from "../../../shared/utils/ApiError";

export const handleZodError = (err: unknown): ApiError | null => {
  if (!(err instanceof ZodError)) {
    return null;
  }

  return new ApiError(
    422,
    "Validation failed",
    err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    })),
  );
};
