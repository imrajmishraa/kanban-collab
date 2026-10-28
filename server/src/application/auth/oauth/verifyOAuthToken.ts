import { ENV } from "../../../config/env";
import { GITHUB_CONFIG } from "../../../infrastructure/auth/providers/github/config";
import type {
  GithubEmail,
  GithubTokenResponse,
  GithubUser,
} from "../../../infrastructure/auth/providers/github/profile";
import { fetchWithRetry } from "../../../infrastructure/auth/providers/fetchWithRetry";
import {
  signInWithProvider,
  type SignInWithProviderResult,
} from "../providers/signInWithProvider";
import {
  oauthExchangeFailedError,
  oauthProfileFetchFailedError,
  unknownProviderError,
} from "../../../shared/errors/auth/oauth";
import type { OAuthProfile } from "../../../infrastructure/auth/providers/types";
import type { Platform } from "../../../infrastructure/db/mongoose/schemas";

export interface VerifyOAuthInput {
  provider: "google" | "github";
  token: string;
  redirectUri?: string;
  rememberMe?: boolean;
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
  platform?: Platform;
}

interface GoogleTokenInfo {
  iss?: string;
  sub?: string;
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
}

async function verifyGoogleCredential(
  credential: string,
): Promise<OAuthProfile> {
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
  const res = await fetchWithRetry(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw oauthProfileFetchFailedError();
  }

  const tokenInfo = (await res.json()) as GoogleTokenInfo;

  if (ENV.GOOGLE_CLIENT_ID && tokenInfo.aud !== ENV.GOOGLE_CLIENT_ID) {
    throw oauthProfileFetchFailedError();
  }

  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
  if (
    !tokenInfo.iss ||
    !validIssuers.includes(tokenInfo.iss) ||
    !tokenInfo.sub
  ) {
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

async function exchangeGithubCode(
  code: string,
  redirectUri?: string,
): Promise<OAuthProfile> {
  const res = await fetchWithRetry(GITHUB_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CONFIG.clientId,
      client_secret: GITHUB_CONFIG.clientSecret,
      code,
      redirect_uri: redirectUri ?? GITHUB_CONFIG.redirectUri,
    }),
  });

  let data:
    | (GithubTokenResponse & { error?: string; error_description?: string })
    | null = null;
  try {
    data = (await res.json()) as GithubTokenResponse & {
      error?: string;
      error_description?: string;
    };
  } catch {
    // fall through
  }

  if (
    !res.ok ||
    !data ||
    data.error ||
    typeof data.access_token !== "string" ||
    !data.access_token
  ) {
    const detail =
      data?.error_description || data?.error || `HTTP ${res.status}`;
    throw oauthExchangeFailedError(`GitHub token exchange failed: ${detail}`);
  }

  const accessToken = data.access_token;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "kanban-collab",
  };

  const userRes = await fetchWithRetry(GITHUB_CONFIG.userUrl, { headers });
  if (!userRes.ok) throw oauthProfileFetchFailedError();
  const user = (await userRes.json()) as GithubUser;

  let email: string | null = user.email?.toLowerCase() ?? null;
  let emailVerified = false;

  const emailsRes = await fetchWithRetry(GITHUB_CONFIG.emailsUrl, { headers });
  if (emailsRes.ok) {
    const emails = (await emailsRes.json()) as GithubEmail[];
    if (!email) {
      const primary = emails.find((e) => e.primary) ?? emails[0];
      if (primary) {
        email = primary.email.toLowerCase();
        emailVerified = primary.verified;
      }
    } else {
      const match = emails.find(
        (e) => e.email.toLowerCase() === email!.toLowerCase(),
      );
      emailVerified = match?.verified ?? false;
    }
  }

  return {
    provider: "github",
    providerId: String(user.id),
    email,
    emailVerified,
    fullName: user.name ?? user.login,
    avatarUrl: user.avatar_url,
  };
}

export async function verifyOAuthToken(
  input: VerifyOAuthInput,
): Promise<SignInWithProviderResult> {
  const {
    provider,
    token,
    redirectUri,
    rememberMe,
    userAgent,
    ipAddress,
    deviceId,
    platform,
  } = input;

  let profile: OAuthProfile;

  if (provider === "google") {
    profile = await verifyGoogleCredential(token);
  } else if (provider === "github") {
    profile = await exchangeGithubCode(token, redirectUri);
  } else {
    throw unknownProviderError(provider);
  }

  return signInWithProvider({
    profile,
    rememberMe: rememberMe ?? true,
    ...(userAgent ? { userAgent } : {}),
    ...(ipAddress ? { ipAddress } : {}),
    ...(deviceId ? { deviceId } : {}),
    ...(platform ? { platform } : {}),
  });
}
