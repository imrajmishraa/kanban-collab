import { GITHUB_CONFIG } from "./config";
import type { GithubEmail, GithubTokenResponse, GithubUser } from "./profile";
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
        redirect_uri: GITHUB_CONFIG.redirectUri,
      }),
    });

    // GitHub often returns HTTP 200 even on failure and puts the error in the
    // JSON body. Always parse the body and check for `error` / missing token.
    let data:
      | (GithubTokenResponse & {
          error?: string;
          error_description?: string;
        })
      | null = null;

    try {
      data = (await res.json()) as GithubTokenResponse & {
        error?: string;
        error_description?: string;
      };
    } catch {
      // fall through to the generic error below
    }

    if (
      !res.ok ||
      !data ||
      data.error ||
      typeof data.access_token !== "string" ||
      !data.access_token
    ) {
      const detail =
        data?.error_description ||
        data?.error ||
        (await res.text().catch(() => "")) ||
        `HTTP ${res.status}`;
      throw oauthExchangeFailedError(`GitHub token exchange failed: ${detail}`);
    }

    return { accessToken: data.access_token };
  }

  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
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

    const emailsRes = await fetchWithRetry(GITHUB_CONFIG.emailsUrl, {
      headers,
    });
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
