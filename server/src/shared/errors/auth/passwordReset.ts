import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

/**
 * 400 — the code is wrong, expired, or was never issued.
 *
 * One answer for all three on purpose: distinguishing them would let the
 * endpoint report whether an account has a live reset in flight.
 */
export function invalidPasswordResetCodeError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.PASSWORD_RESET_CODE_INVALID,
    { code: "INVALID_PASSWORD_RESET_CODE" },
  );
}

/** 429 — five wrong guesses spent the code; a new one has to be requested. */
export function passwordResetTooManyAttemptsError(): ApiError {
  return new ApiError(
    HTTP_STATUS.TOO_MANY_REQUESTS,
    ERROR_MESSAGE.PASSWORD_RESET_TOO_MANY_ATTEMPTS,
    { code: "PASSWORD_RESET_TOO_MANY_ATTEMPTS" },
  );
}
