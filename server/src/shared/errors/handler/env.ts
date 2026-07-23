import { ApiError } from "../../../shared/utils/ApiError";

export const missingEnvVariable = (name: string) =>
  new ApiError(500, `Missing environment variable: ${name}`);

export const invalidEnvVariable = (name: string, value: string) =>
  new ApiError(
    500,
    `Invalid value "${value}" for environment variable: ${name}`
  );
