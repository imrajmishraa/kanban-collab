import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

/**
 * 404 — the card ID doesn't resolve to any document.
 *
 * Also returned when the user isn't a member of the card's workspace,
 * to avoid leaking card existence to unauthorized users.
 */
export function cardNotFoundError(): ApiError {
  return new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE.CARD_NOT_FOUND, {
    code: "CARD_NOT_FOUND",
  });
}

/**
 * 400 — an assignee is not a member of the card's workspace.
 *
 * `data.unknown` carries the offending ids so a client can point at the field
 * instead of saying "invalid request".
 */
export function invalidCardMembersError(unknown: string[]): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.CARD_MEMBERS_NOT_IN_WORKSPACE,
    { code: "INVALID_CARD_MEMBERS", data: { unknown } },
  );
}
