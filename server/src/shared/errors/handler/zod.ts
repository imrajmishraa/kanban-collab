import { ZodError } from "zod";
import { ApiError } from "../../../shared/utils/ApiError";

export interface FormattedZodError {
  field: string;
  message: string;
  code: string;
}

export const handleZodError = (err: unknown): ApiError | null => {
  if (!(err instanceof ZodError)) {
    return null;
  }

  // Safely format each validation issue
  const formattedErrors: FormattedZodError[] = err.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : "root",
    message: issue.message,
    code: issue.code,
  }));

  return new ApiError(422, "Validation failed", formattedErrors);
};
