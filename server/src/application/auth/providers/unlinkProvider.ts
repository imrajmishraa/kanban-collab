import { UserModel } from "../../../infrastructure/db/mongoose/schemas";
import { authLogger } from "../../../infrastructure/logging/childLogger";
import { userNotFoundError } from "../../../shared/errors/auth/custom";
import {
  cannotUnlinkLastProviderError,
  providerNotLinkedError,
} from "../../../shared/errors/auth/oauth";
import type { AuthProvider } from "../../../infrastructure/db/mongoose/schemas";

export async function unlinkProvider(
  userId: string,
  provider: AuthProvider,
): Promise<{ unlinked: true }> {
  const user = await UserModel.findById(userId);
  if (!user) throw userNotFoundError();

  const index = user.authProviders.findIndex((p) => p.provider === provider);
  if (index === -1) throw providerNotLinkedError(provider);

  if (user.authProviders.length <= 1) {
    throw cannotUnlinkLastProviderError();
  }

  user.authProviders.splice(index, 1);

  if (provider === "password") {
    user.passwordHash = undefined;
  }

  await user.save();

  authLogger.info(
    { userId: user._id.toString(), provider },
    "Provider unlinked from account.",
  );

  return { unlinked: true };
}
