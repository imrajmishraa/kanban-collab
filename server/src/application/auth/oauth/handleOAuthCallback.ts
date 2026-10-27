import { getProvider } from "../../../infrastructure/auth/providers";
import { signInWithProvider } from "../providers/signInWithProvider";
import type { Platform } from "../../../infrastructure/db/mongoose/schemas";

export interface HandleOAuthCallbackInput {
  providerName: string;
  code: string;
  /**
   * Whether the session cookie should persist (30d) or expire with the browser.
   * Comes from the signed state, which carries the choice made on the login
   * page — previously this was hardcoded to `true`, so the "keep me signed in"
   * checkbox silently had no effect for OAuth sign-ins.
   */
  rememberMe?: boolean;
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
  platform?: Platform;
}

export async function handleOAuthCallback(input: HandleOAuthCallbackInput) {
  const {
    providerName,
    code,
    rememberMe,
    userAgent,
    ipAddress,
    deviceId,
    platform,
  } = input;

  const provider = getProvider(providerName);

  const { accessToken } = await provider.exchangeCode({ code });
  const profile = await provider.fetchProfile(accessToken);

  return signInWithProvider({
    profile,
    rememberMe: rememberMe ?? true,
    ...(userAgent ? { userAgent } : {}),
    ...(ipAddress ? { ipAddress } : {}),
    ...(deviceId ? { deviceId } : {}),
    ...(platform ? { platform } : {}),
  });
}
