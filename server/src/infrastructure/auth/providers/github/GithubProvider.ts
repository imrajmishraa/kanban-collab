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

/**
 * GitHub is talked to over `fetch` directly, not through Octokit.
 *
 * Every `@octokit/*` package this server used to import (`oauth-methods`,
 * `request`) is ESM-only — no CommonJS entry point. The server compiles to
 * CommonJS (no `"type": "module"` in package.json), so `tsc` emitted a
 * `require()` for them, and Node refused it with ERR_REQUIRE_ESM at module load.
 * That killed the process before any route could answer, which is why every
 * endpoint 500'd on Vercel while `ts-node` locally — where `require(esm)` is
 * enabled — was fine.
 *
 * The web-flow endpoints used here are three plain HTTP calls, so the dependency
 * bought nothing that `fetch` does not already give.
 */
const API_HEADERS = {
  accept: "application/vnd.github+json",
  "x-github-api-version": "2022-11-28",
} as const;

function reason(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

interface TokenPayload {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

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
    let payload: TokenPayload;

    try {
      const response = await fetch(GITHUB_CONFIG.tokenUrl, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CONFIG.clientId,
          client_secret: GITHUB_CONFIG.clientSecret,
          code,
          redirect_uri: GITHUB_CONFIG.redirectUri,
        }),
      });

      payload = (await response.json()) as TokenPayload;

      if (!response.ok) {
        throw new Error(`token endpoint returned HTTP ${response.status}`);
      }
    } catch (error) {
      throw oauthExchangeFailedError(
        `GitHub token exchange failed: ${reason(error)}`,
      );
    }

    /* GitHub answers HTTP 200 with `{"error": …}` in the body rather than a 4xx,
       so the status code alone is not enough. */
    const accessToken = payload.access_token;

    if (payload.error !== undefined || accessToken === undefined) {
      throw oauthExchangeFailedError(
        `GitHub token exchange failed: ${
          payload.error_description ??
          payload.error ??
          "no access_token in the response"
        }`,
      );
    }

    return { accessToken };
  }

  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    const headers = { ...API_HEADERS, authorization: `Bearer ${accessToken}` };

    let user: GithubUser;

    try {
      const response = await fetch(GITHUB_CONFIG.userUrl, { headers });

      if (!response.ok) {
        throw new Error(`GET /user returned HTTP ${response.status}`);
      }

      user = (await response.json()) as GithubUser;
    } catch (error) {
      throw oauthProfileFetchFailedError(`GitHub GET /user: ${reason(error)}`);
    }

    let email: string | null = user.email?.toLowerCase() ?? null;
    let emailVerified = false;

    /* The profile's own `email` is often null — GitHub only fills it when the
       address is public. `/user/emails` is the source of truth, and it needs the
       `user:email` scope; a token without it gets a 404 here, which must not
       fail a sign-in that already has a profile. */
    try {
      const response = await fetch(GITHUB_CONFIG.emailsUrl, { headers });

      if (!response.ok) {
        throw new Error(`GET /user/emails returned HTTP ${response.status}`);
      }

      const emails = (await response.json()) as GithubEmail[];

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
