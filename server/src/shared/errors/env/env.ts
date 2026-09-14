import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

/**
 * 500 — a required environment variable is missing.
 *
 * Fired at boot by env validation. Never surfaces to a client; `main.ts`
 * catches it, logs at fatal level, and exits.
 *
 * `isOperational: false` marks this as a configuration bug (not an expected
 * condition) so it routes to alerting instead of being silently logged.
 */
export function missingEnvVariable(name: string): ApiError {
  return new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    `Missing environment variable: ${name}`,
    {
      code: "MISSING_ENV_VARIABLE",
      isOperational: false,
      data: { envVar: name },
    },
  );
}

/**
 * 500 — an environment variable is set but has an invalid value
 * (wrong format, out of range, failed regex, etc.).
 *
 * Fired at boot by env validation. Never surfaces to a client.
 * `isOperational: false` — this is a deployment misconfiguration.
 */
export function invalidEnvVariable(name: string, value: string): ApiError {
  return new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    `Invalid value "${value}" for environment variable: ${name}`,
    {
      code: "INVALID_ENV_VARIABLE",
      isOperational: false,
      data: { envVar: name, value },
    },
  );
}
