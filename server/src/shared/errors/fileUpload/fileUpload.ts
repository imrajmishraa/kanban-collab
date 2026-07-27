import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

export function forbiddenWorkspaceError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.WORKSPACE_ACCESS_DENIED,
  );
}

export function attachmentsRequiredError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.ATTACHMENT_FIELDS_REQUIRED,
  );
}

export function guestCannotUploadError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.GUEST_CANNOT_UPLOAD_ATTACHMENT,
  );
}
