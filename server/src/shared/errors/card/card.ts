import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

export function cardNotFoundError(): ApiError {
  return new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE.CARD_NOT_FOUND);
}
