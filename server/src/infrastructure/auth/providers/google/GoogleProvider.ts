import { GOOGLE_CONFIG } from "./config";
import type { GoogleTokenResponse, GoogleUserInfo } from "./profile";
import type {
  AuthorizeUrlParams,
  ExchangeCodeParams,
  ExchangeCodeResult,
  OAuthProfile,
  OAuthProvider,
} from "../types";
import { fetchWithRetry } from "../fetchWithRetry";
import {
  oauthExchangeFailedError,
  oauthProfileFetchFailedError,
} from "../../../../shared/errors/auth/oauth";

export class GoogleProvider implements OAuthProvider {
  readonly name = "google" as const;

  getAuthorizeUrl({ state }: AuthorizeUrlParams): string {
    const url = new URL(GOOGLE_CONFIG.authorizeUrl);
    url.searchParams.set("client_id", GOOGLE_CONFIG.clientId);
    url.searchParams.set("redirect_uri", GOOGLE_CONFIG.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", GOOGLE_CONFIG.scopes.join(" "));
    url.searchParams.set("state", state);
    // Do not force prompt=consent or access_type=offline.
    // The app does not use Google's refresh token, and forcing consent on
    // every login creates unnecessary friction for returning users.
    return url.toString();
  }

  async exchangeCode({
    code,
  }: ExchangeCodeParams): Promise<ExchangeCodeResult> {
    const body = new URLSearchParams({
      code,
      client_id: GOOGLE_CONFIG.clientId,
      client_secret: GOOGLE_CONFIG.clientSecret,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      grant_type: "authorization_code",
    });

    const res = await fetchWithRetry(GOOGLE_CONFIG.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw oauthExchangeFailedError(`Google token exchange failed: ${text}`);
    }

    const data = (await res.json()) as GoogleTokenResponse;

    // Defensive: ensure we actually received an access token.
    if (typeof data.access_token !== "string" || !data.access_token) {
      throw oauthExchangeFailedError(
        "Google token exchange failed: missing access_token in response",
      );
    }

    // Google only returns a refresh_token on first consent (or with
    // prompt=consent); this app never uses it, so a missing one must not fail
    // an otherwise-valid login.
    return {
      accessToken: data.access_token,
      ...(data.refresh_token !== undefined
        ? { refreshToken: data.refresh_token }
        : {}),
      expiresIn: data.expires_in,
    };
  }

  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    const res = await fetchWithRetry(GOOGLE_CONFIG.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw oauthProfileFetchFailedError();

    const data = (await res.json()) as GoogleUserInfo;

    return {
      provider: "google",
      providerId: data.sub,
      email: data.email?.toLowerCase() ?? null,
      emailVerified: data.email_verified === true,
      fullName: data.name ?? null,
      avatarUrl: data.picture ?? null,
    };
  }
}
