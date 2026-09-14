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
  const provider = getProvider(input.providerName);

  const { accessToken } = await provider.exchangeCode({ code: input.code });

  const profile = await provider.fetchProfile(accessToken);

  return signInWithProvider({
    profile,
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
    deviceId: input.deviceId,
    platform: input.platform,
    rememberMe: true,
  });
}
