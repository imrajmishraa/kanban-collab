import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

export type RateLimitType =
  | "login"
  | "signup"
  | "refresh"
  | "chat"
  | "otp"
  | "upload"
  | "api";

interface RateLimitConfig {
  message: string;
  code: string;
  /** Seconds until the client may retry — surfaced as `Retry-After`. */
  retryAfterSeconds: number;
}

const RATE_LIMIT_CONFIG: Record<RateLimitType, RateLimitConfig> = {
  login: {
    message: ERROR_MESSAGE.RATE_LIMIT_LOGIN,
    code: "RATE_LIMIT_LOGIN",
    retryAfterSeconds: 15 * 60, // 15 minutes
  },
  signup: {
    message: ERROR_MESSAGE.RATE_LIMIT_SIGNUP,
    code: "RATE_LIMIT_SIGNUP",
    retryAfterSeconds: 60 * 60, // 1 hour
  },
  refresh: {
    message: ERROR_MESSAGE.RATE_LIMIT_REFRESH,
    code: "RATE_LIMIT_REFRESH",
    retryAfterSeconds: 60, // 1 minute
  },
  chat: {
    message: ERROR_MESSAGE.RATE_LIMIT_CHAT,
    code: "RATE_LIMIT_CHAT",
    retryAfterSeconds: 10,
  },
  otp: {
    message: ERROR_MESSAGE.RATE_LIMIT_OTP,
    code: "RATE_LIMIT_OTP",
    retryAfterSeconds: 10 * 60,
  },
  upload: {
    message: ERROR_MESSAGE.RATE_LIMIT_UPLOAD,
    code: "RATE_LIMIT_UPLOAD",
    retryAfterSeconds: 60,
  },
  api: {
    message: ERROR_MESSAGE.RATE_LIMIT_GENERIC,
    code: "RATE_LIMIT_GENERIC",
    retryAfterSeconds: 60,
  },
};

/**
 * Build a 429 ApiError for a given rate-limit bucket.
 *
 * The `Retry-After` header should be set by the middleware that throws this:
 *
 *   const err = rateLimitError("login");
 *   res.setHeader("Retry-After", err.retryAfterSeconds);
 *   throw err;
 */
export function rateLimitError(type: RateLimitType = "api"): ApiError {
  const { message, code, retryAfterSeconds } = RATE_LIMIT_CONFIG[type];

  return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message, {
    code,
    data: { retryAfterSeconds },
    isOperational: true,
  });
}
