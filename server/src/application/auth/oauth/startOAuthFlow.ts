import { getProvider } from "../../../infrastructure/auth/providers";

import { createStateToken } from "./stateToken";

export interface StartOAuthFlowInput {
  providerName: string;
  /** Carried through the round trip so the callback can set the right cookie. */
  rememberMe?: boolean;
}

export interface StartOAuthFlowResult {
  authorizeUrl: string;
  stateToken: string;
}

/**
 * Builds the provider authorize URL.
 *
 * The state is signed and self-contained (see `stateToken.ts`) — nothing is
 * written to a cookie here, so the flow is not tied to the origin that served
 * this request.
 */
export function startOAuthFlow(
  input: StartOAuthFlowInput,
): StartOAuthFlowResult {
  const provider = getProvider(input.providerName);

  const rememberMe = Boolean(input.rememberMe);

  const stateToken = createStateToken({
    provider: input.providerName,
    rememberMe,
  });

  return {
    authorizeUrl: provider.getAuthorizeUrl({ state: stateToken }),
    stateToken,
  };
}
