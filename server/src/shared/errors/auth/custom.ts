import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

/**
 * Thrown when registering with an email that already exists.
 * → 409 CONFLICT
 */
export function existingUserError(): ApiError {
  return new ApiError(HTTP_STATUS.CONFLICT, ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
}

/**
 * Thrown when login fails — either email not found OR password mismatch.
 * Collapsed into one error to prevent user enumeration.
 * → 401 UNAUTHORIZED
 */
export function invalidEmailOrPasswordError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.INVALID_EMAIL_OR_PASSWORD,
  );
}

/**
 * Thrown when a session references a user that no longer exists
 * (deleted account, corrupted session, etc.).
 * → 404 NOT_FOUND
 */
export function userNotFoundError(): ApiError {
  return new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE.USER_NOT_FOUND);
}
