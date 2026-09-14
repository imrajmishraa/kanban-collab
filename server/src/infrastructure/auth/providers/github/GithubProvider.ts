import { GITHUB_CONFIG } from "./config";
import type { GithubEmail, GithubTokenResponse, GithubUser } from "./profile";
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

export class GithubProvider implements OAuthProvider {
  readonly name = "github" as const;

  getAuthorizeUrl({ state }: AuthorizeUrlParams): string {
    const url = new URL(GITHUB_CONFIG.authorizeUrl);
    url.searchParams.set("client_id", GITHUB_CONFIG.clientId);
    url.searchParams.set("redirect_uri", GITHUB_CONFIG.redirectUri);
    url.searchParams.set("scope", GITHUB_CONFIG.scopes.join(" "));
    url.searchParams.set("state", state);
    return url.toString();
  }

  async exchangeCode({
    code,
  }: ExchangeCodeParams): Promise<ExchangeCodeResult> {
    const res = await fetch(GITHUB_CONFIG.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CONFIG.clientId,
        client_secret: GITHUB_CONFIG.clientSecret,
        code,
        redirect_uri: GITHUB_CONFIG.redirectUri,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw oauthExchangeFailedError(`GitHub token exchange failed: ${text}`);
    }

    const data = (await res.json()) as GithubTokenResponse;
    return { accessToken: data.access_token };
  }

  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "kanban-collab",
    };

    const userRes = await fetch(GITHUB_CONFIG.userUrl, { headers });
    if (!userRes.ok) throw oauthProfileFetchFailedError();
    const user = (await userRes.json()) as GithubUser;

    let email: string | null = user.email?.toLowerCase() ?? null;
    let emailVerified = false;

    const emailsRes = await fetch(GITHUB_CONFIG.emailsUrl, { headers });
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
}
