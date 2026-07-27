import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

export function guestCannotModifyBoardError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.GUEST_CANNOT_MODIFY_BOARD,
  );
}

export function boardNotFoundError(): ApiError {
  return new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE.BOARD_NOT_FOUND);
}

export function boardAccessDeniedError(): ApiError {
  return new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGE.BOARD_ACCESS_DENIED);
}

export function boardIdAndQueryParametersRequiredError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.BOARD_ID_AND_QUERY_REQUIRED,
  );
}

export function boardIdRequiredError(): ApiError {
  return new ApiError(HTTP_STATUS.BAD_REQUEST, "Board ID is required.");
}

export function invalidBoardIdError(): ApiError {
  return new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE.INVALID_OBJECT_ID);
}