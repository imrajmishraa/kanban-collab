import {
  exchangeWebFlowCode,
  getWebFlowAuthorizationUrl,
} from "@octokit/oauth-methods";
import { request } from "@octokit/request";

import { GITHUB_CONFIG } from "./config";
import type { GithubEmail, GithubUser } from "./profile";
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

function reason(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class GithubProvider implements OAuthProvider {
  readonly name = "github" as const;

  getAuthorizeUrl({ state }: AuthorizeUrlParams): string {
    const { url } = getWebFlowAuthorizationUrl({
      clientType: "oauth-app",
      clientId: GITHUB_CONFIG.clientId,
      redirectUrl: GITHUB_CONFIG.redirectUri,
      scopes: [...GITHUB_CONFIG.scopes],
      state,
    });

    return url;
  }

  async exchangeCode({
    code,
  }: ExchangeCodeParams): Promise<ExchangeCodeResult> {
    try {
      const { authentication } = await exchangeWebFlowCode({
        clientType: "oauth-app",
        clientId: GITHUB_CONFIG.clientId,
        clientSecret: GITHUB_CONFIG.clientSecret,
        code,
        redirectUrl: GITHUB_CONFIG.redirectUri,
      });

      return { accessToken: authentication.token };
    } catch (error) {
      /* `exchangeWebFlowCode` throws on the error body GitHub returns — which
         used to need its own check, because GitHub answers HTTP 200 with
         `{"error": …}` in the body rather than a 4xx. */
      throw oauthExchangeFailedError(
        `GitHub token exchange failed: ${reason(error)}`,
      );
    }
  }

  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    const headers = { authorization: `token ${accessToken}` };

    let user: GithubUser;

    try {
      const response = await request("GET /user", { headers });
      user = response.data as GithubUser;
    } catch {
      throw oauthProfileFetchFailedError();
    }

    let email: string | null = user.email?.toLowerCase() ?? null;
    let emailVerified = false;

    /* The profile's own `email` is often null — GitHub only fills it when the
       address is public. `/user/emails` is the source of truth, and it needs the
       `user:email` scope; a token without it gets a 404 here, which must not
       fail a sign-in that already has a profile. */
    try {
      const response = await request("GET /user/emails", { headers });
      const emails = response.data as GithubEmail[];

      if (!email) {
        const primary = emails.find((entry) => entry.primary) ?? emails[0];
        if (primary) {
          email = primary.email.toLowerCase();
          emailVerified = primary.verified;
        }
      } else {
        const match = emails.find(
          (entry) => entry.email.toLowerCase() === email?.toLowerCase(),
        );
        emailVerified = match?.verified ?? false;
      }
    } catch {
      /* No access to the email list: keep the profile's own address, unverified. */
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
}
