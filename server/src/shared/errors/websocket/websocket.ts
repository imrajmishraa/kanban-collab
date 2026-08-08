import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

export function InvalidWebSocketRequestError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.ACCESS_TOKEN_INVALID,
  );
}

export class InvalidCollaborationMessageError extends Error {
  public readonly code = "INVALID_COLLABORATION_MESSAGE";

  constructor(message = "Invalid collaboration message.") {
    super(message);

    this.name = "InvalidCollaborationMessageError";
  }
}