import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

export function missingEnvVariable(name: string): ApiError {
  return new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    `Missing environment variable: ${name}`,
  );
}

export function invalidEnvVariable(name: string, value: string): ApiError {
  return new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    `Invalid value "${value}" for environment variable: ${name}`,
  );
}
