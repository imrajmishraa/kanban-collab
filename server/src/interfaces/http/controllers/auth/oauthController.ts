import crypto from "node:crypto";
import type { Request, Response } from "express";

import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ENV } from "../../../../config/env";
import { authLogger } from "../../../../infrastructure/logging/childLogger";

import { startOAuthFlow } from "../../../../application/auth/oauth/startOAuthFlow";
import { handleOAuthCallback } from "../../../../application/auth/oauth/handleOAuthCallback";
import { listEnabledProviders } from "../../../../infrastructure/auth/providers";

import { unknownProviderError } from "../../../../shared/errors/auth/oauth";

import {
  REFRESH_COOKIE_NAME,
  getRefreshCookieOptions,
} from "../../utils/cookies";

/** Constant-time string comparison (O-4) — avoids leaking the state via timing. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export const listProviders = asyncHandler(
  async (_req: Request, res: Response) => {
    res.json({
      statusCode: 200,
      success: true,
      message: "Available OAuth providers.",
      data: { providers: listEnabledProviders() },
    });
  },
);

export const startOAuth = asyncHandler(async (req: Request, res: Response) => {
  const provider = req.params["provider"];
  if (!provider) throw unknownProviderError("(missing)");

  const flow = startOAuthFlow(provider);

  res.cookie(flow.cookieName, flow.stateToken, {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: "lax",
    path: "/api/v1/auth/oauth",
    maxAge: flow.cookieMaxAgeMs,
  });

  return res.redirect(flow.authorizeUrl);
});

export const oauthCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const provider = req.params["provider"];
    if (!provider) throw unknownProviderError("(missing)");

    const { code, state } = req.query as { code?: string; state?: string };

    const expectedState = req.cookies?.[ENV.OAUTH_STATE_COOKIE_NAME];
    res.clearCookie(ENV.OAUTH_STATE_COOKIE_NAME, {
      path: "/api/v1/auth/oauth",
    });

    if (!code || !state || !expectedState || !safeEqual(state, expectedState)) {
      authLogger.warn(
        { provider, hasCode: Boolean(code), hasState: Boolean(state) },
        "OAuth callback rejected — invalid state or missing code.",
      );
      return res.redirect(
        `${ENV.CLIENT_URL}/auth/callback?status=error&reason=invalid_state`,
      );
    }

    try {
      const result = await handleOAuthCallback({
        providerName: provider,
        code,
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

      const status = result.isNewUser ? "new" : "existing";
      return res.redirect(
        `${ENV.CLIENT_URL}/auth/callback?status=success&user=${status}`,
      );
    } catch (error) {
      authLogger.error({ err: error, provider }, "OAuth callback failed.");

      // Do not put internal/provider error text in the redirect URL — the
      // server-side log above already carries the detail.
      return res.redirect(
        `${ENV.CLIENT_URL}/auth/callback?status=error&reason=oauth_failed`,
      );
    }
  },
);
