import type { Request, Response } from "express";

import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ENV } from "../../../../config/env";
import { oauthStateBindingMode } from "../../../../config/oauth";
import { authLogger } from "../../../../infrastructure/logging/childLogger";

import { startOAuthFlow } from "../../../../application/auth/oauth/startOAuthFlow";
import { handleOAuthCallback } from "../../../../application/auth/oauth/handleOAuthCallback";
import {
  STATE_TTL_MS,
  stateMatchesBrowser,
  verifyStateToken,
} from "../../../../application/auth/oauth/stateToken";
import { listEnabledProviders } from "../../../../infrastructure/auth/providers";

import { unknownProviderError } from "../../../../shared/errors/auth/oauth";
import { ApiError } from "../../../../shared/utils/ApiError";

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

  /*
   * The signed state proves the flow came from this server. It does not prove
   * which browser is finishing it — so the nonce also goes into a cookie, and
   * the callback refuses a state whose cookie is missing or different. Without
   * that, an attacker can start a flow, keep the `code`+`state` pair and send
   * the callback URL to a victim, who then signs into the attacker's account
   * (login CSRF).
   *
   * `sameSite: "lax"` is right for this: the cookie is set on a top-level
   * navigation and comes back on the provider's redirect, both of which are
   * GET navigations.
   */
  res.cookie(ENV.OAUTH_STATE_COOKIE_NAME, flow.stateNonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: ENV.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_TTL_MS,
  });

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

      redirectToClient(res, {
        status: "error",
        reason: code === undefined ? "missing_code" : "missing_state",
      });
      return;
    }

    // Throws invalidOAuthStateError for a bad signature, wrong provider or an
    // expired token; the signed state carries the rememberMe choice.
    let rememberMe: boolean;
    let stateNonce: string;

    try {
      ({ rememberMe, nonce: stateNonce } = verifyStateToken(state, provider));
    } catch (error) {
      /* The reason travels in the redirect URL, because a browser-side OAuth
         flow leaves no other trace: `invalid_state` alone cannot distinguish a
         bad signature from an expired token from a provider mismatch. */
      const detail =
        error instanceof ApiError &&
        typeof error.data === "object" &&
        error.data !== null &&
        "detail" in error.data
          ? String((error.data as { detail?: unknown }).detail)
          : "unknown";

      authLogger.warn(
        { provider, detail },
        "OAuth callback rejected — invalid or expired state.",
      );

      redirectToClient(res, { status: "error", reason: `state_${detail}` });
      return;
    }

    /*
     * Binding check, after the signature so a forged state never reaches it.
     * The cookie is cleared either way — it is single-use.
     */
    const boundNonce = req.cookies?.[ENV.OAUTH_STATE_COOKIE_NAME] as
      string | undefined;

    res.clearCookie(ENV.OAUTH_STATE_COOKIE_NAME, { path: "/" });

    if (!stateMatchesBrowser(stateNonce, boundNonce)) {
      if (oauthStateBindingMode() === "required") {
        authLogger.warn(
          { provider, hadCookie: boundNonce !== undefined },
          "OAuth callback rejected — state is not bound to this browser.",
        );

        redirectToClient(res, { status: "error", reason: "state_not_bound" });
        return;
      }

      /* `warn`: the flow started on a host that is not the callback's, so the
         cookie could not come back. Logged on every occurrence, because this is
         the gap the binding exists to close. */
      authLogger.warn(
        { provider },
        "OAuth state cookie missing — the flow is not bound to this browser.",
      );
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

      /* Do not leak provider error text into the redirect URL — the log above
         carries the detail. The one exception is a failure the reader can act
         on: an address the provider has not verified. It needs its own reason,
         or the login page can only say "something went wrong", and the
         account-takeover fix made this an ordinary outcome rather than an
         impossible one. */
      const reason =
        error instanceof ApiError && error.code === "OAUTH_EMAIL_NOT_VERIFIED"
          ? "email_not_verified"
          : "oauth_failed";

      redirectToClient(res, { status: "error", reason });
    }
  },
);
