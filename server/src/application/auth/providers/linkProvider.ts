import { UserModel } from "../../../infrastructure/db/mongoose/schemas";
import { authLogger } from "../../../infrastructure/logging/childLogger";
import { userNotFoundError } from "../../../shared/errors/auth/custom";
import {
  oauthEmailNotVerifiedError,
  providerAlreadyLinkedError,
} from "../../../shared/errors/auth/oauth";
import type { OAuthProfile } from "../../../infrastructure/auth/providers/types";

export async function linkProvider(
  userId: string,
  profile: OAuthProfile,
): Promise<{ linked: true }> {
  const user = await UserModel.findById(userId);
  if (!user) throw userNotFoundError();

  if (!profile.emailVerified) {
    throw oauthEmailNotVerifiedError(profile.provider);
  }

  const alreadyLinked = user.authProviders.some(
    (p) => p.provider === profile.provider,
  );
  if (alreadyLinked) throw providerAlreadyLinkedError(profile.provider);

  const conflict = await UserModel.findOne({
    _id: { $ne: user._id },
    "authProviders.provider": profile.provider,
    "authProviders.providerId": profile.providerId,
  });
  if (conflict) throw providerAlreadyLinkedError(profile.provider);

  user.authProviders.push({
    provider: profile.provider,
    providerId: profile.providerId,
    email: profile.email,
    linkedAt: new Date(),
  });

  await user.save();

  authLogger.info(
    { userId: user._id.toString(), provider: profile.provider },
    "Provider linked to account.",
  );

  return { linked: true };
}
