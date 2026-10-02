import { getProvider } from "../../../infrastructure/auth/providers";
import { signInWithProvider } from "../providers/signInWithProvider";
import type { Platform } from "../../../infrastructure/db/mongoose/schemas";

export interface HandleOAuthCallbackInput {
  providerName: string;
  code: string;
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
  platform?: Platform;
}

export async function handleOAuthCallback(input: HandleOAuthCallbackInput) {
  const { providerName, code, userAgent, ipAddress, deviceId, platform } =
    input;

  const provider = getProvider(providerName);

  const { accessToken } = await provider.exchangeCode({ code });
  const profile = await provider.fetchProfile(accessToken);

  return signInWithProvider({
    profile,
    rememberMe: true,
    ...(userAgent ? { userAgent } : {}),
    ...(ipAddress ? { ipAddress } : {}),
    ...(deviceId ? { deviceId } : {}),
    ...(platform ? { platform } : {}),
  });
}
