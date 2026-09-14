// server/src/shared/constants/error.ts

export const ERROR_MESSAGE = {
  // GENERIC

  INTERNAL_SERVER_ERROR: "Internal Server Error",
  BAD_REQUEST: "Bad Request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not Found",
  METHOD_NOT_ALLOWED: "Method not allowed.",
  REQUEST_TIMEOUT: "Request timed out.",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable.",
  NOT_IMPLEMENTED: "Feature not implemented.",

  // VALIDATION

  VALIDATION_FAILED: "Validation failed",
  INVALID_OBJECT_ID: "Invalid Object ID",
  DUPLICATE_RESOURCE: "Duplicate resource",
  MISSING_REQUIRED_FIELD: "A required field is missing.",
  INVALID_INPUT_FORMAT: "Input has an invalid format.",
  PAYLOAD_TOO_LARGE: "Payload is too large.",
  UNSUPPORTED_MEDIA_TYPE: "Unsupported media type.",

  // ACCESS TOKEN

  ACCESS_TOKEN_INVALID: "Invalid access token.",
  ACCESS_TOKEN_EXPIRED: "Access token expired.",
  ACCESS_TOKEN_MISSING: "Access token missing.",
  ACCESS_TOKEN_NOT_ACTIVE: "Access token is not active yet.",

  // REFRESH TOKEN

  INVALID_REFRESH_TOKEN: "Invalid refresh token.",
  REFRESH_TOKEN_EXPIRED: "Refresh token has expired.",
  REFRESH_TOKEN_MISSING: "Refresh token is missing.",
  REFRESH_TOKEN_REUSE_DETECTED: "Refresh token reuse detected.",
  REFRESH_TOKEN_NOT_ACTIVE: "Refresh token is not active yet.",

  // SESSION

  SESSION_NOT_FOUND: "Session not found.",
  SESSION_REVOKED: "Session has been revoked.",
  SESSION_EXPIRED: "Session has expired.",
  SESSION_LIMIT_REACHED: "Maximum active sessions reached.",

  // CREDENTIALS / ACCOUNT

  EMAIL_ALREADY_EXISTS: "Email already exists.",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password.",
  USER_NOT_FOUND: "User not found.",
  PASSWORD_TOO_WEAK: "Password does not meet security requirements.",
  PASSWORD_MISMATCH: "Passwords do not match.",
  EMAIL_NOT_VERIFIED: "Email address has not been verified.",
  ACCOUNT_DISABLED: "Account has been disabled.",
  ACCOUNT_LOCKED: "Account is locked. Please contact support.",

  // AUTHORIZATION / ROLES

  INSUFFICIENT_PERMISSIONS:
    "You do not have permission to perform this action.",
  OWNER_ACCESS_REQUIRED: "Owner privileges are required.",
  ADMIN_ACCESS_REQUIRED: "Admin privileges are required.",
  ADMIN_OR_OWNER_ACCESS_REQUIRED: "Admin or owner privileges are required.",
  MEMBER_ACCESS_REQUIRED:
    "You must be a workspace member to perform this action.",
  GUEST_ACTION_FORBIDDEN: "Guests are not allowed to perform this action.",

  // OAUTH

  OAUTH_UNKNOWN_PROVIDER: "Unknown OAuth provider.",
  OAUTH_PROVIDER_DISABLED: "This sign-in method is not available right now.",
  OAUTH_INVALID_STATE:
    "OAuth state is invalid or expired. Please try signing in again.",
  OAUTH_EXCHANGE_FAILED: "Failed to complete sign-in with the provider.",
  OAUTH_PROFILE_FETCH_FAILED: "Failed to fetch your profile from the provider.",
  OAUTH_EMAIL_NOT_VERIFIED: "Your email is not verified with the provider.",
  OAUTH_PROVIDER_ALREADY_LINKED:
    "This account is already linked to your profile.",
  OAUTH_CANNOT_UNLINK_LAST_PROVIDER: "Cannot remove your only sign-in method.",
  OAUTH_PROVIDER_NOT_LINKED: "This account is not linked to your profile.",

  // WORKSPACE

  CREATE_WORKSPACE_FAILED: "Failed to create workspace.",
  WORKSPACE_NOT_FOUND: "Workspace not found.",
  WORKSPACE_ID_REQUIRED: "Workspace ID is required.",
  WORKSPACE_ACCESS_DENIED: "You do not have access to this workspace.",
  WORKSPACE_MEMBER_REQUIRED: "You must be a member of this workspace.",
  USER_ALREADY_WORKSPACE_MEMBER: "User is already a member of this workspace.",
  USER_NOT_WORKSPACE_MEMBER: "User is not a member of this workspace.",
  WORKSPACE_MEMBER_LIMIT_REACHED: "Workspace member limit reached.",
  WORKSPACE_SLUG_TAKEN: "Workspace slug is already taken.",
  WORKSPACE_DELETION_FAILED: "Workspace deletion failed.",
  WORKSPACE_DELETION_ALREADY_STARTED: "Workspace deletion already scheduled.",
  WORKSPACE_DELETION_NOT_PENDING: "No pending deletion to cancel.",
  WORKSPACE_LAST_OWNER: "Cannot remove the last owner of a workspace.",

  // BOARD

  BOARD_NOT_FOUND: "Board not found.",
  BOARD_ID_REQUIRED: "Board ID is required.",
  BOARD_ACCESS_DENIED: "Access to this board is denied.",
  BOARD_ID_AND_QUERY_REQUIRED:
    "Both 'boardId' and query parameters are required.",
  BOARD_NAME_REQUIRED: "Board name is required.",
  BOARD_LIMIT_REACHED: "Board limit reached for this workspace.",
  GUEST_CANNOT_MODIFY_BOARD: "Guests are not allowed to modify boards.",

  // COLUMN

  COLUMN_NOT_FOUND: "Column not found.",
  COLUMN_ID_REQUIRED: "Column ID is required.",
  COLUMN_NAME_REQUIRED: "Column name is required.",
  COLUMN_LIMIT_REACHED: "Maximum number of columns reached for this board.",
  COLUMN_NOT_EMPTY: "Cannot delete a column that still contains cards.",
  COLUMN_ORDER_CONFLICT: "Column order conflict detected. Please retry.",

  // CARD

  CARD_NOT_FOUND: "Card not found.",
  CARD_ID_REQUIRED: "Card ID is required.",
  CARD_TITLE_REQUIRED: "Card title is required.",
  CARD_ARCHIVED: "Card is archived and cannot be modified.",
  CARD_ORDER_CONFLICT: "Card order conflict detected. Please retry.",
  CARD_MOVE_ACROSS_BOARD_FORBIDDEN: "Cards cannot be moved across boards.",

  // COMMENT

  COMMENT_NOT_FOUND: "Comment not found.",
  COMMENT_ID_REQUIRED: "Comment ID is required.",
  COMMENT_TEXT_REQUIRED: "Comment text cannot be empty.",
  COMMENT_EDIT_FORBIDDEN: "You can only edit your own comments.",
  COMMENT_DELETE_FORBIDDEN: "You can only delete your own comments.",

  // ACTIVITY LOG

  ACTIVITY_NOT_FOUND: "Activity log entry not found.",
  ACTIVITY_INVALID_ACTION_TYPE: "Invalid activity action type.",

  // NOTIFICATION

  NOTIFICATION_NOT_FOUND: "Notification not found.",
  NOTIFICATION_ID_REQUIRED: "Notification ID is required.",
  NOTIFICATION_ACCESS_DENIED: "You do not have access to this notification.",
  NOTIFICATION_ALREADY_READ: "Notification has already been marked as read.",
  NOTIFICATION_PREFERENCES_NOT_FOUND: "Notification preferences not found.",
  NOTIFICATION_INVALID_TYPE: "Invalid notification type.",
  NOTIFICATION_CHANNEL_UNAVAILABLE: "Notification channel is unavailable.",

  // ATTACHMENTS

  ATTACHMENT_FIELDS_REQUIRED: "fileName, fileType, and cardId are required.",
  ATTACHMENT_NOT_FOUND: "Attachment not found.",
  ATTACHMENT_ACCESS_DENIED: "You do not have access to this attachment.",
  GUEST_CANNOT_UPLOAD_ATTACHMENT: "Guests cannot upload attachments.",

  // FILE UPLOAD

  FILE_UPLOAD_FAILED: "File upload failed.",
  FILE_SIZE_EXCEEDED: "File size exceeds the allowed limit.",
  FILE_COUNT_EXCEEDED: "Too many files uploaded.",
  FILE_TYPE_NOT_ALLOWED: "File type is not allowed.",
  UNEXPECTED_FILE: "Unexpected file received.",
  FIELD_COUNT_EXCEEDED: "Too many form fields.",
  FIELD_NAME_TOO_LONG: "Form field name is too long.",
  FIELD_VALUE_TOO_LONG: "Form field value is too long.",
  PART_COUNT_EXCEEDED: "Too many multipart form parts.",

  // STORAGE (S3 / MinIO)

  STORAGE_UNAVAILABLE: "Storage service is unavailable.",
  STORAGE_UPLOAD_FAILED: "Failed to upload file to storage.",
  STORAGE_DELETE_FAILED: "Failed to delete file from storage.",
  STORAGE_PRESIGN_FAILED: "Failed to generate a signed URL.",
  STORAGE_BUCKET_NOT_CONFIGURED: "Storage bucket is not configured.",

  // REDIS

  REDIS_CONNECTION_REFUSED: "Redis connection refused.",
  REDIS_CONNECTION_TIMEOUT: "Redis connection timed out.",
  REDIS_CONNECTION_RESET: "Redis connection was reset.",
  REDIS_UNAVAILABLE: "Redis service is unavailable.",
  REDIS_PUBLISH_FAILED: "Failed to publish message to Redis.",
  REDIS_SUBSCRIBE_FAILED: "Failed to subscribe to Redis channel.",

  // DATABASE

  DB_CONNECTION_FAILED: "Database connection failed.",
  DB_QUERY_FAILED: "Database query failed.",
  DB_DUPLICATE_KEY: "A resource with this identifier already exists.",
  DB_TRANSACTION_FAILED: "Database transaction failed.",

  // EMAIL / SMS / PUSH

  EMAIL_SEND_FAILED: "Failed to send email.",
  EMAIL_PROVIDER_UNAVAILABLE: "Email service is unavailable.",
  SMS_SEND_FAILED: "Failed to send SMS.",
  SMS_PROVIDER_UNAVAILABLE: "SMS service is unavailable.",
  PUSH_SEND_FAILED: "Failed to send push notification.",
  PUSH_SUBSCRIPTION_INVALID: "Invalid push subscription.",
  PUSH_PROVIDER_UNAVAILABLE: "Push notification service is unavailable.",

  // RATE LIMITING

  RATE_LIMIT_LOGIN: "Too many login attempts. Please try again in 15 minutes.",
  RATE_LIMIT_SIGNUP:
    "Too many accounts have been created from this IP address.",
  RATE_LIMIT_REFRESH: "Too many refresh attempts. Please try again shortly.",
  RATE_LIMIT_CHAT: "You're sending messages too quickly.",
  RATE_LIMIT_OTP: "OTP request limit exceeded. Please try again later.",
  RATE_LIMIT_UPLOAD: "Upload limit reached. Please try again later.",
  RATE_LIMIT_GENERIC: "Too many requests. Please try again later.",

  // WEBSOCKET

  WEBSOCKET_INVALID_COLLABORATION_MESSAGE: "Invalid collaboration message.",
  WEBSOCKET_EMPTY_COLLABORATION_MESSAGE:
    "Cannot decode an empty collaboration message.",
  WEBSOCKET_UPGRADE_REQUIRED: "This endpoint requires a WebSocket upgrade.",
  WEBSOCKET_UPGRADE_FAILED: "WebSocket upgrade failed.",
  WEBSOCKET_UNAUTHORIZED: "WebSocket connection is not authenticated.",
  WEBSOCKET_FORBIDDEN: "You are not authorized to join this channel.",
  WEBSOCKET_MESSAGE_TOO_LARGE: "WebSocket message exceeds the size limit.",
  WEBSOCKET_INVALID_MESSAGE_FORMAT: "WebSocket message has an invalid format.",
  WEBSOCKET_RATE_LIMITED: "Too many WebSocket messages. Please slow down.",
  WEBSOCKET_CONNECTION_LIMIT_REACHED: "Maximum concurrent connections reached.",
  WEBSOCKET_CHANNEL_NOT_FOUND: "Requested WebSocket channel does not exist.",
  WEBSOCKET_SESSION_EXPIRED: "WebSocket session has expired. Please reconnect.",

  // YJS / COLLABORATION

  YJS_INVALID_UPDATE: "Invalid Yjs update payload.",
  YJS_EMPTY_UPDATE: "Cannot apply an empty Yjs update.",
  YJS_DOC_NOT_FOUND: "Collaboration document not found.",
  YJS_DOC_LOAD_FAILED: "Failed to load the collaboration document.",
  YJS_DOC_PERSIST_FAILED: "Failed to persist the collaboration document.",
  YJS_SNAPSHOT_FAILED: "Failed to write Yjs snapshot.",
  YJS_AWARENESS_INVALID: "Invalid awareness payload.",
  YJS_AWARENESS_TIMEOUT: "Awareness update timed out.",

  // CONCURRENCY / OPTIMISTIC LOCKING

  RESOURCE_MODIFIED: "Resource was modified by another user. Please refresh.",
  STALE_ORDER_INDEX: "Order index is stale. Please refresh the board.",
  CONCURRENT_EDIT_CONFLICT:
    "A concurrent edit conflict occurred. Please retry.",
} as const;

export type ErrorMessage = (typeof ERROR_MESSAGE)[keyof typeof ERROR_MESSAGE];
