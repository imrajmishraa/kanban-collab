import crypto from "node:crypto";

import { ENV } from "../../../config/env";
import { getProvider } from "../../../infrastructure/auth/providers";

export interface StartOAuthFlowResult {
  authorizeUrl: string;
  stateToken: string;
  cookieName: string;
  cookieMaxAgeMs: number;
}

const STATE_TTL_MS = 10 * 60 * 1000;

export function startOAuthFlow(providerName: string): StartOAuthFlowResult {
  const provider = getProvider(providerName);

  const stateToken = crypto.randomBytes(32).toString("hex");

  const authorizeUrl = provider.getAuthorizeUrl({ state: stateToken });

  return {
    authorizeUrl,
    stateToken,
    cookieName: ENV.OAUTH_STATE_COOKIE_NAME,
    cookieMaxAgeMs: STATE_TTL_MS,
  };
}
