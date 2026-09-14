import {
  UserModel,
  SessionModel,
  type Platform,
} from "../../../infrastructure/db/mongoose/schemas";
import {
  signAccessToken,
  signRefreshToken,
} from "../../../infrastructure/security/jwt";
import { authLogger } from "../../../infrastructure/logging/childLogger";
import { oauthEmailNotVerifiedError } from "../../../shared/errors/auth/oauth";
import type { OAuthProfile } from "../../../infrastructure/auth/providers/types";

export interface SignInWithProviderInput {
  profile: OAuthProfile;
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
  platform?: Platform;
  rememberMe?: boolean;
}

export interface SignInWithProviderResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  rememberMe: boolean;
  isNewUser: boolean;
}

export async function signInWithProvider(
  input: SignInWithProviderInput,
): Promise<SignInWithProviderResult> {
  const { profile, userAgent, ipAddress, deviceId, platform } = input;
  const rememberMe = Boolean(input.rememberMe ?? true);

  let user = await UserModel.findOne({
    "authProviders.provider": profile.provider,
    "authProviders.providerId": profile.providerId,
  });

  let isNewUser = false;

  if (!user) {
    if (profile.email) {
      user = await UserModel.findOne({ email: profile.email });
    }

    if (user) {
      if (!profile.emailVerified) {
        throw oauthEmailNotVerifiedError(profile.provider);
      }

      const alreadyLinked = user.authProviders.some(
        (p) => p.provider === profile.provider,
      );

      if (!alreadyLinked) {
        user.authProviders.push({
          provider: profile.provider,
          providerId: profile.providerId,
          email: profile.email,
          linkedAt: new Date(),
        });

        if (!user.avatarUrl && profile.avatarUrl)
          user.avatarUrl = profile.avatarUrl;
        if (!user.fullName && profile.fullName)
          user.fullName = profile.fullName;

        await user.save();

        authLogger.info(
          { userId: user._id.toString(), provider: profile.provider },
          "OAuth provider linked to existing account.",
        );
      }
    } else {
      const email = profile.email;
      if (!email) throw oauthEmailNotVerifiedError(profile.provider);

      user = await UserModel.create({
        email,
        emailVerified: profile.emailVerified,
        fullName: profile.fullName ?? email.split("@")[0],
        avatarUrl: profile.avatarUrl ?? undefined,
        authProviders: [
          {
            provider: profile.provider,
            providerId: profile.providerId,
            email,
            linkedAt: new Date(),
          },
        ],
      });

      isNewUser = true;

      authLogger.info(
        { userId: user._id.toString(), provider: profile.provider },
        "New user created via OAuth.",
      );
    }
  }

  const userId = user._id.toString();

  const [accessToken, issued] = await Promise.all([
    signAccessToken({
      userId,
      email: user.email,
      fullName: user.fullName,
    }),
    signRefreshToken({ userId }, { rememberMe }),
  ]);

  await SessionModel.create({
    userId: user._id,
    userEmail: user.email,
    userFullName: user.fullName,
    jti: issued.jti,
    rememberMe: issued.rememberMe,
    userAgent,
    ipAddress,
    deviceId,
    platform,
    lastUsedAt: issued.issuedAt,
    expiresAt: issued.expiresAt,
  });

  authLogger.info(
    {
      userId,
      provider: profile.provider,
      sessionId: issued.jti,
      isNewUser,
    },
    "User signed in via OAuth.",
  );

  return {
    user: {
      id: userId,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
    refreshToken: issued.token,
    refreshExpiresAt: issued.expiresAt,
    rememberMe: issued.rememberMe,
    isNewUser,
  };
}
