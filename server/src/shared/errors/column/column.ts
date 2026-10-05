import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

/**
 * 404 — the column ID doesn't resolve to any document.
 * Also returned when the user can't see the column's board, to avoid
 * leaking column existence to unauthorized users.
 */
export function columnNotFoundError(): ApiError {
  return new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE.COLUMN_NOT_FOUND, {
    code: "COLUMN_NOT_FOUND",
  });
}

/**
 * 409 — the column still contains cards, so it can't be deleted yet.
 * Callers should clear the column first.
 */
export function columnNotEmptyError(): ApiError {
  return new ApiError(HTTP_STATUS.CONFLICT, ERROR_MESSAGE.COLUMN_NOT_EMPTY, {
    code: "COLUMN_NOT_EMPTY",
  });
}
