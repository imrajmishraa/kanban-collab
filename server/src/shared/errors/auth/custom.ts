import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

export function existingUserError(): ApiError {
  return new ApiError(HTTP_STATUS.CONFLICT, ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
}

export function invalidEmailOrPasswordError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.INVALID_EMAIL_OR_PASSWORD,
  );
}

export function userNotFoundError(): ApiError {
  return new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE.USER_NOT_FOUND);
}
