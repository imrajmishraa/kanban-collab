import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

export function internalServerError(): ApiError {
  return new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
  );
}

export function invalidObjectIdError(): ApiError {
  return new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE.INVALID_OBJECT_ID);
}