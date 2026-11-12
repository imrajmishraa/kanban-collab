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
    /* `access_type: "online"` and no `prompt`: the app never uses Google's
       refresh token, and forcing consent on every login is friction for
       returning users. `redirect_uri`, `response_type=code` and the client id
       come from the client itself. */
    return newClient().generateAuthUrl({
      access_type: "online",
      scope: GOOGLE_CONFIG.scopes,
      state,
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
      const response = await newClient().request<GoogleUserInfo>({
        url: GOOGLE_CONFIG.userInfoUrl,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      data = response.data;
    } catch {
      throw oauthProfileFetchFailedError();
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
