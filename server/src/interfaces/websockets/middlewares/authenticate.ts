import { verifyAccessToken } from "../../../infrastructure/security/jwt";
import { missingAccessTokenError } from "../../../shared/errors/auth/accessToken";

export interface AuthenticatedSocketContext {
  userId: string;
}

/**
 * Verify the access token carried by an upgrade request (H-2).
 *
 * The token is extracted by `parseUpgradeRequest` — preferably from the
 * `Sec-WebSocket-Protocol` subprotocol, with the legacy `?token=` query as a
 * deprecated fallback — and passed in here. This function only verifies it, so
 * the token is parsed in exactly one place.
 */
export async function authenticate(
  token: string,
): Promise<AuthenticatedSocketContext> {
  if (!token) {
    throw missingAccessTokenError();
  }

  // `verifyAccessToken` maps expired/invalid tokens to domain errors and throws.
  const payload = verifyAccessToken(token);

  return { userId: payload.userId };
}
