import { UserModel } from "../../infrastructure/db/mongoose/schemas";
import { hashPassword } from "../../infrastructure/security/password";
import { existingUserError } from "../../shared/errors/auth/custom";
import { authLogger } from "../../infrastructure/logging/childLogger";

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RegisterResult {
  userId: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
}

export async function register(params: RegisterInput): Promise<RegisterResult> {
  const { password, ipAddress, userAgent } = params;
  const email = params.email.toLowerCase().trim();
  const fullName = params.fullName.trim();

  // Parallel — bcrypt (~250ms) and Mongo lookup (~30ms) are independent.
  // Wall-clock = max(250, 30) ≈ 250ms instead of sum ≈ 280ms.
  const [existing, passwordHash] = await Promise.all([
    UserModel.findOne({ email }).select("_id").lean(),
    hashPassword(password),
  ]);

  if (existing) throw existingUserError();

  const user = await UserModel.create({
    email,
    passwordHash,
    fullName,
    emailVerified: false,
    authProviders: [
      {
        provider: "password",
        providerId: null,
        email,
        linkedAt: new Date(),
      },
    ],
  });

  authLogger.info(
    {
      userId: user._id.toString(),
      email: user.email,
      ipAddress,
      userAgent,
    },
    "User registered successfully.",
  );

  return {
    userId: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    emailVerified: user.emailVerified,
  };
}
