import type { Request, Response } from "express";

import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ENV } from "../../../../config/env";
import { authLogger } from "../../../../infrastructure/logging/childLogger";

import { startOAuthFlow } from "../../../../application/auth/oauth/startOAuthFlow";
import { handleOAuthCallback } from "../../../../application/auth/oauth/handleOAuthCallback";
import { verifyStateToken } from "../../../../application/auth/oauth/stateToken";
import { listEnabledProviders } from "../../../../infrastructure/auth/providers";

import { unknownProviderError } from "../../../../shared/errors/auth/oauth";

import {
  REFRESH_COOKIE_NAME,
  getRefreshCookieOptions,
} from "../../utils/cookies";

/**
 * Sends the browser back to the SPA with a machine-readable outcome.
 *
 * Every failure path ends here rather than with a JSON error, because the user
 * arrives via a top-level navigation from the provider — a bare JSON body
 * would strand them on the API origin.
 */
function redirectToClient(res: Response, query: Record<string, string>): void {
  const url = new URL("/auth/callback", ENV.CLIENT_URL);

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  res.redirect(url.toString());
}

/** `?rememberMe=true|false` from the login page. Defaults to off. */
function parseRememberMe(value: unknown): boolean {
  const raw = Array.isArray(value) ? value[0] : value;

  if (typeof raw !== "string") return false;

  return ["true", "1", "yes", "on"].includes(raw.trim().toLowerCase());
}

import { verifyGoogleIdToken } from "../../../../infrastructure/auth/providers/googleTokenVerifier";
import { signInWithProvider } from "../../../../application/auth/providers/signInWithProvider";
import { verifyOAuthToken } from "../../../../application/auth/oauth/verifyOAuthToken";

export const listProviders = asyncHandler(
  async (_req: Request, res: Response) => {
    const enabledProviders = listEnabledProviders();
    res.json({
      statusCode: 200,
      success: true,
      message: "Available OAuth providers.",
      data: {
        providers: enabledProviders,
        googleClientId: enabledProviders.includes("google")
          ? ENV.GOOGLE_CLIENT_ID
          : undefined,
        githubClientId: enabledProviders.includes("github")
          ? ENV.GITHUB_CLIENT_ID
          : undefined,
      },
    });
  },
);

export const verifyOAuth = asyncHandler(async (req: Request, res: Response) => {
  const { provider, token, redirectUri, rememberMe } = req.body as {
    provider: "google" | "github";
    token: string;
    redirectUri?: string;
    rememberMe?: boolean;
  };

  const result = await verifyOAuthToken({
    provider,
    token,
    ...(redirectUri ? { redirectUri } : {}),
    rememberMe: rememberMe ?? true,
    ...(req.ip !== undefined ? { ipAddress: req.ip } : {}),
    ...(req.headers["user-agent"] !== undefined
      ? { userAgent: req.headers["user-agent"] }
      : {}),
  });

  res.cookie(
    REFRESH_COOKIE_NAME,
    result.refreshToken,
    getRefreshCookieOptions(result.rememberMe),
  );

  res.json({
    statusCode: 200,
    success: true,
    message: "OAuth sign-in successful.",
    data: {
      user: result.user,
      accessToken: result.accessToken,
      isNewUser: result.isNewUser,
    },
  });
});

export const federatedGoogleAuth = asyncHandler(
  async (req: Request, res: Response) => {
    const { credential, rememberMe } = req.body as {
      credential: string;
      rememberMe?: boolean;
    };

    const profile = await verifyGoogleIdToken(credential);

    const result = await signInWithProvider({
      profile,
      rememberMe: rememberMe ?? true,
      ...(req.ip !== undefined ? { ipAddress: req.ip } : {}),
      ...(req.headers["user-agent"] !== undefined
        ? { userAgent: req.headers["user-agent"] }
        : {}),
    });

    res.cookie(
      REFRESH_COOKIE_NAME,
      result.refreshToken,
      getRefreshCookieOptions(result.rememberMe),
    );

    res.json({
      statusCode: 200,
      success: true,
      message: "Google federated sign-in successful.",
      data: {
        user: result.user,
        accessToken: result.accessToken,
        isNewUser: result.isNewUser,
      },
    });
  },
);

export const startOAuth = asyncHandler(async (req: Request, res: Response) => {
  const provider = req.params["provider"];
  if (!provider) throw unknownProviderError("(missing)");

  const flow = startOAuthFlow({
    providerName: provider,
    rememberMe: parseRememberMe(req.query["rememberMe"]),
  });

  // No state cookie: the state is signed and self-verifying, so it survives a
  // redirect to a different host and browsers that block third-party cookies.
  res.redirect(flow.authorizeUrl);
});

export const oauthCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const provider = req.params["provider"];
    if (!provider) throw unknownProviderError("(missing)");

    const {
      code,
      state,
      error: providerError,
    } = req.query as {
      code?: string;
      state?: string;
      error?: string;
    };

    // The user cancelled on the consent screen, or the provider rejected the
    // request (e.g. redirect_uri_mismatch). Send them back with a reason.
    if (providerError) {
      authLogger.warn(
        { provider, providerError },
        "OAuth provider returned an error instead of a code.",
      );

      redirectToClient(res, {
        status: "error",
        reason:
          providerError === "access_denied" ? "cancelled" : "provider_error",
      });
      return;
    }

    if (!code || !state) {
      authLogger.warn(
        { provider, hasCode: Boolean(code), hasState: Boolean(state) },
        "OAuth callback missing code or state.",
      );

      redirectToClient(res, { status: "error", reason: "invalid_state" });
      return;
    }

    // Throws invalidOAuthStateError for a bad signature, wrong provider or an
    // expired token; the signed state carries the rememberMe choice.
    let rememberMe: boolean;

    try {
      ({ rememberMe } = verifyStateToken(state, provider));
    } catch {
      authLogger.warn(
        { provider },
        "OAuth callback rejected — invalid or expired state.",
      );

      redirectToClient(res, { status: "error", reason: "invalid_state" });
      return;
    }

    try {
      const result = await handleOAuthCallback({
        providerName: provider,
        code,
        rememberMe,
        ...(req.ip !== undefined ? { ipAddress: req.ip } : {}),
        ...(req.headers["user-agent"] !== undefined
          ? { userAgent: req.headers["user-agent"] }
          : {}),
      });

      res.cookie(
        REFRESH_COOKIE_NAME,
        result.refreshToken,
        getRefreshCookieOptions(result.rememberMe),
      );

      redirectToClient(res, {
        status: "success",
        user: result.isNewUser ? "new" : "existing",
      });
    } catch (error) {
      authLogger.error({ err: error, provider }, "OAuth callback failed.");

      // Do not leak provider error text into the redirect URL — the log above
      // carries the detail.
      redirectToClient(res, { status: "error", reason: "oauth_failed" });
    }
  },
);
