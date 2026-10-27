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

  // Match provider + providerId on the SAME array element. Without
  // `$elemMatch`, Mongo satisfies the two conditions independently, so a user
  // with two different linked accounts could match the wrong combination.
  let user = await UserModel.findOne({
    authProviders: {
      $elemMatch: {
        provider: profile.provider,
        providerId: profile.providerId,
      },
    },
  });

  let isNewUser = false;

  if (!user) {
    if (profile.email) {
      user = await UserModel.findOne({ email: profile.email });
    }

    if (user) {
      // Link provider to existing account
      if (!profile.emailVerified) {
        throw oauthEmailNotVerifiedError(profile.provider);
      }

      const alreadyLinked = user.authProviders.some(
        (p) =>
          p.provider === profile.provider &&
          p.providerId === profile.providerId,
      );

      if (!alreadyLinked) {
        user.authProviders.push({
          provider: profile.provider,
          providerId: profile.providerId,
          email: profile.email,
          linkedAt: new Date(),
        });

        if (!user.avatarUrl && profile.avatarUrl) {
          user.avatarUrl = profile.avatarUrl;
        }
        if (!user.fullName && profile.fullName) {
          user.fullName = profile.fullName;
        }

        await user.save();

        authLogger.info(
          { userId: user._id.toString(), provider: profile.provider },
          "OAuth provider linked to existing account.",
        );
      }
    } else {
      // Create new user. Require a provider-verified email so an unverified
      // provider address cannot be used to squat an existing owner's email
      // (the account-linking branch below already requires this).
      if (!profile.emailVerified) {
        throw oauthEmailNotVerifiedError(profile.provider);
      }

      const email = profile.email;
      if (!email) throw oauthEmailNotVerifiedError(profile.provider);

      user = await UserModel.create({
        email,
        emailVerified: profile.emailVerified,
        fullName: profile.fullName ?? email.split("@")[0],
        ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
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
    ...(userAgent ? { userAgent } : {}),
    ...(ipAddress ? { ipAddress } : {}),
    ...(deviceId ? { deviceId } : {}),
    ...(platform ? { platform } : {}),
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
      ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
    },
    accessToken,
    refreshToken: issued.token,
    refreshExpiresAt: issued.expiresAt,
    rememberMe: issued.rememberMe,
    isNewUser,
  };
}
