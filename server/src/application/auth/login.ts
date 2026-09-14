import {
  UserModel,
  SessionModel,
} from "../../infrastructure/db/mongoose/schemas";
import { comparePassword } from "../../infrastructure/security/password";
import {
  signAccessToken,
  signRefreshToken,
} from "../../infrastructure/security/jwt";
import { invalidEmailOrPasswordError } from "../../shared/errors/auth/custom";
import { authLogger } from "../../infrastructure/logging/childLogger";

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
  platform?: "web" | "ios" | "android" | "desktop";
}

export interface LoginResult {
  user: { id: string; email: string; fullName: string; avatarUrl?: string };
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  rememberMe: boolean;
}

export async function login(params: LoginInput): Promise<LoginResult> {
  const { email, password, userAgent, ipAddress, deviceId, platform } = params;
  const rememberMe = Boolean(params.rememberMe);

  const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
    .select("+passwordHash _id fullName email avatarUrl")
    .lean();

  if (!user || !user.passwordHash) throw invalidEmailOrPasswordError();

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) throw invalidEmailOrPasswordError();

  const userId = user._id.toString();

  // Parallel — both are CPU-only, no shared state
  const [accessToken, issued] = await Promise.all([
    signAccessToken({ userId, email: user.email, fullName: user.fullName }),
    signRefreshToken({ userId }, { rememberMe }),
  ]);

  // Snapshot user fields so refresh can skip UserModel entirely
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
      email: user.email,
      rememberMe: issued.rememberMe,
      sessionId: issued.jti,
      ipAddress,
    },
    "User logged in successfully.",
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
  };
}
