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

  // Authentication
  ACCESS_TOKEN_INVALID: "Invalid access token.",
  ACCESS_TOKEN_EXPIRED: "Access token expired.",
  ACCESS_TOKEN_MISSING: "Access token missing.",
  ACCESS_TOKEN_NOT_ACTIVE: "Access token is not active yet.",

  // Refresh Token
  INVALID_REFRESH_TOKEN: "Invalid refresh token.",
  REFRESH_TOKEN_EXPIRED: "Refresh token has expired.",
  REFRESH_TOKEN_MISSING: "Refresh token is missing.",
  REFRESH_TOKEN_REUSE_DETECTED: "Refresh token reuse detected.",
  REFRESH_TOKEN_NOT_ACTIVE: "Refresh token is not active yet.",

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

  // Board
  BOARD_NOT_FOUND: "Board not found.",
  BOARD_ID_REQUIRED: "Board ID is required.",
  BOARD_ACCESS_DENIED: "Access to this board is denied.",
  GUEST_CANNOT_MODIFY_BOARD: "Guests are not allowed to modify boards.",
  BOARD_ID_AND_QUERY_REQUIRED:
    "Both 'boardId' and query parameters are required.",

  // Workspace
  CREATE_WORKSPACE_FAILED: "Failed to create workspace.",
  ADMIN_ACCESS_REQUIRED: "Admin privileges are required.",
  ADMIN_OR_OWNER_ACCESS_REQUIRED: "Admin or owner privileges are required.",
  WORKSPACE_ID_REQUIRED: "Workspace ID is required.",
  USER_ALREADY_WORKSPACE_MEMBER: "User is already a member of this workspace.",
  WORKSPACE_MEMBER_REQUIRED: "You must be a member of this workspace.",

  // Card
  CARD_NOT_FOUND: "Card not found.",

  // File Upload
  WORKSPACE_ACCESS_DENIED: "You do not have access to this workspace.",
  ATTACHMENT_FIELDS_REQUIRED: "fileName, fileType, and cardId are required.",
  GUEST_CANNOT_UPLOAD_ATTACHMENT: "Guests cannot upload attachments.",
} as const;
