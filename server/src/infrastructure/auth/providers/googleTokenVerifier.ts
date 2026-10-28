import { ENV } from "../../../config/env";
import { fetchWithRetry } from "./fetchWithRetry";
import { oauthProfileFetchFailedError } from "../../../shared/errors/auth/oauth";
import type { OAuthProfile } from "./types";

interface GoogleTokenInfo {
  iss?: string;
  sub?: string;
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  exp?: string;
  error_description?: string;
}

/**
 * Validates a Google Identity Services credential (ID Token).
 * Uses Google's tokeninfo endpoint to verify signatures, expiration, and audience.
 */
export async function verifyGoogleIdToken(
  idToken: string,
): Promise<OAuthProfile> {
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;

  const res = await fetchWithRetry(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw oauthProfileFetchFailedError();
  }

  const tokenInfo = (await res.json()) as GoogleTokenInfo;

  // Validate audience matches our GOOGLE_CLIENT_ID
  if (ENV.GOOGLE_CLIENT_ID && tokenInfo.aud !== ENV.GOOGLE_CLIENT_ID) {
    throw oauthProfileFetchFailedError();
  }

  // Validate issuer is Google
  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
  if (!tokenInfo.iss || !validIssuers.includes(tokenInfo.iss)) {
    throw oauthProfileFetchFailedError();
  }

  // Validate subject ID and email
  if (!tokenInfo.sub) {
    throw oauthProfileFetchFailedError();
  }

  const emailVerified =
    tokenInfo.email_verified === "true" || tokenInfo.email_verified === true;

  return {
    provider: "google",
    providerId: tokenInfo.sub,
    email: tokenInfo.email?.toLowerCase() ?? null,
    emailVerified,
    fullName: tokenInfo.name ?? null,
    avatarUrl: tokenInfo.picture ?? null,
  };
}
