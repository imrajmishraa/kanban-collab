import { UserModel } from "../../infrastructure/db/mongoose/schemas";
import { userNotFoundError } from "../../shared/errors/auth/custom";

export interface MeResult {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  authProviders: Array<{ provider: string; linkedAt: Date }>;
}

export async function me(userId: string): Promise<MeResult> {
  const user = await UserModel.findById(userId)
    .select("_id email fullName avatarUrl emailVerified authProviders")
    .lean();

  if (!user) throw userNotFoundError();

  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    authProviders: (user.authProviders ?? []).map((p) => ({
      provider: p.provider,
      linkedAt: p.linkedAt,
    })),
  };
}
