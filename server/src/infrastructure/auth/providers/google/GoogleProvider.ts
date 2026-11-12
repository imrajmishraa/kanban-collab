import { OAuth2Client } from "google-auth-library";

import { GOOGLE_CONFIG } from "./config";
import type { GoogleUserInfo } from "./profile";
import type {
  AuthorizeUrlParams,
  ExchangeCodeParams,
  ExchangeCodeResult,
  OAuthProfile,
  OAuthProvider,
} from "../types";
import {
  oauthExchangeFailedError,
  oauthProfileFetchFailedError,
} from "../../../../shared/errors/auth/oauth";

/**
 * A client per operation, not one shared instance.
 *
 * `OAuth2Client` keeps the credentials it was last handed, so a module-level
 * instance would let two concurrent sign-ins swap access tokens under each
 * other — one user's profile read with another user's token. Constructing one
 * is cheap: no network, no key fetch.
 */
function newClient(): OAuth2Client {
  return new OAuth2Client({
    clientId: GOOGLE_CONFIG.clientId,
    clientSecret: GOOGLE_CONFIG.clientSecret,
    redirectUri: GOOGLE_CONFIG.redirectUri,
  });
}

function reason(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class GoogleProvider implements OAuthProvider {
  readonly name = "google" as const;

  getAuthorizeUrl({ state }: AuthorizeUrlParams): string {
    return newClient().generateAuthUrl({
      access_type: "online",
      scope: GOOGLE_CONFIG.scopes,
      state,
      prompt: "select_account",
    });
  }

  async exchangeCode({
    code,
  }: ExchangeCodeParams): Promise<ExchangeCodeResult> {
    try {
      const { tokens } = await newClient().getToken(code);

      if (typeof tokens.access_token !== "string" || !tokens.access_token) {
        throw new Error("no access_token in the token response");
      }

      /* Google only returns a refresh_token on first consent (or with
         prompt=consent); this app never uses it, so a missing one must not fail
         an otherwise-valid login. `expiry_date` is an absolute timestamp, and
         the interface wants the seconds left. */
      return {
        accessToken: tokens.access_token,
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        ...(tokens.expiry_date
          ? {
              expiresIn: Math.max(
                0,
                Math.round((tokens.expiry_date - Date.now()) / 1000),
              ),
            }
          : {}),
      };
    } catch (error) {
      throw oauthExchangeFailedError(
        `Google token exchange failed: ${reason(error)}`,
      );
    }
  }

  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    let data: GoogleUserInfo;

    try {
      /* Plain `fetch`, not `newClient().request()`.
         `OAuth2Client.request()` asks the client for its own credentials before
         it builds the request, and a client constructed from ids alone has none
         — it throws "No access, refresh token, API key or refresh handler
         callback is set." The header passed in here never got a chance to be
         used, so the profile call failed 100% of the time while the token
         exchange (which does use the client) succeeded. */
      const response = await fetch(GOOGLE_CONFIG.userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`userinfo returned HTTP ${response.status}`);
      }

      data = (await response.json()) as GoogleUserInfo;
    } catch (error) {
      throw oauthProfileFetchFailedError(`Google userinfo: ${reason(error)}`);
    }

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
