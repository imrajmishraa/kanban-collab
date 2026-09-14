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
  const provider = req.params.provider;
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
    const provider = req.params.provider;
    if (!provider) throw unknownProviderError("(missing)");

    const { code, state } = req.query as { code?: string; state?: string };

    const expectedState = req.cookies?.[ENV.OAUTH_STATE_COOKIE_NAME];
    res.clearCookie(ENV.OAUTH_STATE_COOKIE_NAME, {
      path: "/api/v1/auth/oauth",
    });

    if (!code || !state || !expectedState || state !== expectedState) {
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
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
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

      const reason =
        error instanceof Error ? encodeURIComponent(error.message) : "unknown";
      return res.redirect(
        `${ENV.CLIENT_URL}/auth/callback?status=error&reason=${reason}`,
      );
    }
  },
);
