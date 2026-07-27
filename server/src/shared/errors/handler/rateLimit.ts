import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

export function rateLimitError(
  type: "login" | "signup" | "chat" | "otp" | "api",
): ApiError {
  switch (type) {
    case "login":
      return new ApiError(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        ERROR_MESSAGE.RATE_LIMIT_LOGIN,
      );

    case "signup":
      return new ApiError(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        ERROR_MESSAGE.RATE_LIMIT_SIGNUP,
      );

    case "chat":
      return new ApiError(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        ERROR_MESSAGE.RATE_LIMIT_CHAT,
      );

    case "otp":
      return new ApiError(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        ERROR_MESSAGE.RATE_LIMIT_OTP,
      );

    default:
      return new ApiError(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        ERROR_MESSAGE.RATE_LIMIT_GENERIC,
      );
  }
}
