import { ApiError } from "../../shared/utils/ApiError";

/**
 * Does this refresh failure mean the session is gone, or that the request was
 * unlucky?
 *
 * The controller used to clear the refresh cookie on *any* error, so a database
 * blip or two tabs refreshing at once ended the session for good. Only a 401
 * says the token itself is finished — invalid, expired, or already reused.
 */
export function shouldClearRefreshCookie(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode === 401;
}
