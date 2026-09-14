import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

/**
 * 403 — user is a guest in the workspace and tried to modify a board.
 * Guests have read-only access to boards they've been invited to.
 */
export function guestCannotModifyBoardError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.GUEST_CANNOT_MODIFY_BOARD,
    { code: "GUEST_CANNOT_MODIFY_BOARD" },
  );
}

/**
 * 404 — the board ID doesn't resolve to any document.
 * Returned instead of 403 when the user shouldn't know the board exists.
 */
export function boardNotFoundError(): ApiError {
  return new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE.BOARD_NOT_FOUND, {
    code: "BOARD_NOT_FOUND",
  });
}

/**
 * 403 — the board exists but the user isn't a member of its workspace.
 * Use this when the user can legitimately see the board's existence
 * (e.g. they're in the workspace but lack a role).
 */
export function boardAccessDeniedError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.BOARD_ACCESS_DENIED,
    { code: "BOARD_ACCESS_DENIED" },
  );
}

/**
 * 400 — an endpoint that requires both `boardId` and a query string
 * received neither.
 */
export function boardIdAndQueryParametersRequiredError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.BOARD_ID_AND_QUERY_REQUIRED,
    { code: "BOARD_ID_AND_QUERY_REQUIRED" },
  );
}

/**
 * 400 — a required `boardId` parameter is missing.
 */
export function boardIdRequiredError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.BOARD_ID_REQUIRED,
    { code: "BOARD_ID_REQUIRED" },
  );
}

/**
 * 400 — the supplied `boardId` isn't a valid MongoDB ObjectId.
 * Usually surfaces when a client passes a stale or malformed ID.
 */
export function invalidBoardIdError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.INVALID_OBJECT_ID,
    {
      code: "INVALID_BOARD_ID",
      errors: [
        {
          field: "boardId",
          message: "Invalid board ID format.",
          code: "INVALID_OBJECT_ID",
        },
      ],
    },
  );
}
