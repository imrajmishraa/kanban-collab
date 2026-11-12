import { OAuth2Client, type TokenPayload } from "google-auth-library";

import { ENV } from "../../../config/env";
import { oauthProfileFetchFailedError } from "../../../shared/errors/auth/oauth";
import type { OAuthProfile } from "./types";

/**
 * One client for the process: `verifyIdToken` checks the signature against
 * Google's public keys and caches them, so a shared instance is what keeps that
 * cache warm. It holds no user credentials — only the keys and the audience.
 */
const client = new OAuth2Client();

/**
 * Validates a Google Identity Services credential (an ID token).
 *
 * `verifyIdToken` does the whole check locally: signature against the cached
 * JWKS, `iss` is accounts.google.com, `exp` has not passed, and `aud` matches
 * the client id we pass. That replaces the previous round trip to
 * `oauth2.googleapis.com/tokeninfo` — same guarantees, no extra network hop, and
 * it is the path Google documents.
 */
export async function verifyGoogleIdToken(
  idToken: string,
): Promise<OAuthProfile> {
  /* Without a client id there is no audience to check the token against, and a
     token accepted from any client is not a token worth accepting. In this state
     the provider is disabled anyway (`isProviderEnabled`). */
  if (!ENV.GOOGLE_CLIENT_ID) {
    throw oauthProfileFetchFailedError();
  }

  let payload: TokenPayload | undefined;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: ENV.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    /* A bad signature, a wrong audience, an expired token and a malformed one
       all land here, and all mean the same thing to the caller. */
    throw oauthProfileFetchFailedError();
  }

  if (!payload?.sub) throw oauthProfileFetchFailedError();

  return {
    provider: "google",
    providerId: payload.sub,
    email: payload.email?.toLowerCase() ?? null,
    emailVerified: payload.email_verified === true,
    fullName: payload.name ?? null,
    avatarUrl: payload.picture ?? null,
  };
}
