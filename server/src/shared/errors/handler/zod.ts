import { ZodError } from "zod";

import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

interface FormattedZodError {
  field: string;
  message: string;
  code: string;
}

export function handleZodError(err: unknown): ApiError | null {
  if (!(err instanceof ZodError)) {
    return null;
  }

  const formattedErrors: FormattedZodError[] = err.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : "root",
    message: issue.message,
    code: issue.code,
  }));

  return new ApiError(
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    ERROR_MESSAGE.VALIDATION_FAILED,
    formattedErrors,
  );
}
