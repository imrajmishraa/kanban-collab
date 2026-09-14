import { SessionModel } from "../../infrastructure/db/mongoose/schemas";
import { verifyRefreshToken } from "../../infrastructure/security/jwt";
import { authLogger } from "../../infrastructure/logging/childLogger";

export interface LogoutContext {
  ipAddress?: string;
  userAgent?: string;
}


export async function logout(
  refreshToken: string | undefined,
  ctx: LogoutContext = {},
): Promise<void> {
  const { ipAddress, userAgent } = ctx;

  if (!refreshToken) {
    authLogger.info(
      { hasRefreshToken: false, ipAddress, userAgent },
      "Logout requested with no refresh token — treating as no-op.",
    );
    return;
  }

  let jti: string | undefined;
  let userId: string | undefined;

  try {
    const decoded = verifyRefreshToken(refreshToken);
    jti = decoded.jti;
    userId = decoded.userId;
  } catch {
    // Malformed / expired — nothing to revoke. Log for visibility, do not throw.
    authLogger.warn(
      { ipAddress, userAgent },
      "Logout with invalid or expired refresh token — clearing client cookie only.",
    );
    return;
  }

  // Match either the current jti or a just-rotated previousJti
  const result = await SessionModel.deleteOne({
    userId,
    $or: [{ jti }, { previousJti: jti }],
  });

  authLogger.info(
    {
      userId,
      jti,
      revoked: result.deletedCount === 1,
      ipAddress,
      userAgent,
    },
    "User logged out.",
  );
}

/**
 * Revoke every session for a user — used on password change, account compromise, etc.
 */
export async function logoutAll(
  userId: string,
  ctx: LogoutContext = {},
): Promise<number> {
  const result = await SessionModel.deleteMany({ userId });

  authLogger.info(
    {
      userId,
      revokedCount: result.deletedCount ?? 0,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    },
    "All sessions revoked.",
  );

  return result.deletedCount ?? 0;
}
