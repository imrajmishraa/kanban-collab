export const ERROR_MESSAGE = {
  // Generic
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  BAD_REQUEST: "Bad Request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not Found",

  // Validation
  VALIDATION_FAILED: "Validation failed",
  INVALID_OBJECT_ID: "Invalid Object ID",
  DUPLICATE_RESOURCE: "Duplicate resource",

  // Access Token
  INVALID_ACCESS_TOKEN: "Invalid access token.",
  ACCESS_TOKEN_EXPIRED: "Access token has expired.",
  ACCESS_TOKEN_MISSING: "Access token is missing.",
  ACCESS_TOKEN_NOT_ACTIVE: "Access token is not active yet.",

  // Refresh Token
  INVALID_REFRESH_TOKEN: "Invalid refresh token.",
  REFRESH_TOKEN_EXPIRED: "Refresh token has expired.",
  REFRESH_TOKEN_MISSING: "Refresh token is missing.",
  REFRESH_TOKEN_REUSE_DETECTED: "Refresh token reuse detected.",

  // Authentication
  EMAIL_ALREADY_EXISTS: "Email already exists.",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password.",
  USER_NOT_FOUND: "User not found.",

  // File Upload
  FILE_UPLOAD_FAILED: "File upload failed.",
  FILE_SIZE_EXCEEDED: "File size exceeds the allowed limit.",
  FILE_COUNT_EXCEEDED: "Too many files uploaded.",
  UNEXPECTED_FILE: "Unexpected file received.",
  FIELD_COUNT_EXCEEDED: "Too many form fields.",
  FIELD_NAME_TOO_LONG: "Form field name is too long.",
  FIELD_VALUE_TOO_LONG: "Form field value is too long.",
  PART_COUNT_EXCEEDED: "Too many multipart form parts.",

  // Redis
  REDIS_CONNECTION_REFUSED: "Redis connection refused.",
  REDIS_CONNECTION_TIMEOUT: "Redis connection timed out.",
  REDIS_CONNECTION_RESET: "Redis connection was reset.",
  REDIS_UNAVAILABLE: "Redis service is unavailable.",

  // Rate Limiting
  RATE_LIMIT_LOGIN: "Too many login attempts. Please try again in 15 minutes.",
  RATE_LIMIT_SIGNUP:
    "Too many accounts have been created from this IP address.",
  RATE_LIMIT_CHAT: "You're sending messages too quickly.",
  RATE_LIMIT_OTP: "OTP request limit exceeded. Please try again later.",
  RATE_LIMIT_GENERIC: "Too many requests. Please try again later.",
} as const;
