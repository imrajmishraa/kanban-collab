import { ApiError } from "../../../shared/utils/ApiError";

export const handleRateLimitError = (
  type: "login" | "signup" | "chat" | "otp" | "api",
) => {
  switch (type) {
    case "login":
      return new ApiError(
        429,
        "Too many login attempts. Try again in 15 minutes.",
      );

    case "signup":
      return new ApiError(429, "Too many accounts created from this IP.");

    case "chat":
      return new ApiError(429, "You're sending messages too quickly.");

    case "otp":
      return new ApiError(429, "OTP request limit exceeded.");

    default:
      return new ApiError(429, "Too many requests.");
  }
};
