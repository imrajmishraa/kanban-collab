import { ERROR_MESSAGE } from "../../constants/error";
import { HTTP_STATUS } from "../../constants/http";
import { ApiError } from "../../utils/ApiError";

export function createWorkspaceError(): ApiError {
  return new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_MESSAGE.CREATE_WORKSPACE_FAILED,
  );
}

export function adminAccessRequiredError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.ADMIN_ACCESS_REQUIRED,
  );
}

export function workspaceIdRequiredError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.WORKSPACE_ID_REQUIRED,
  );
}

export function userNotFoundError(): ApiError {
  return new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE.USER_NOT_FOUND);
}

export function userAlreadyWorkspaceMemberError(): ApiError {
  return new ApiError(
    HTTP_STATUS.CONFLICT,
    ERROR_MESSAGE.USER_ALREADY_WORKSPACE_MEMBER,
  );
}

export function workspaceMemberRequiredError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.WORKSPACE_MEMBER_REQUIRED,
  );
}
