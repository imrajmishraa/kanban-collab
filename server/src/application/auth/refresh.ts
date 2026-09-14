import { SessionModel } from "../../infrastructure/db/mongoose/schemas";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "../../infrastructure/security/jwt";
import {
  expiredRefreshTokenError,
  missingRefreshTokenError,
  refreshTokenReuseError,
  sessionRevokedError,
} from "../../shared/errors/auth/refreshToken";
import { authLogger } from "../../infrastructure/logging/childLogger";

const GRACE_PERIOD_MS = 30_000;

export interface RefreshInput {
  refreshToken: string | undefined;
  userAgent?: string;
  ipAddress?: string;
}

export interface RefreshResult {
  user: { id: string; email: string; fullName: string };
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  rememberMe: boolean;
}

export async function refresh(params: RefreshInput): Promise<RefreshResult> {
  const { refreshToken, userAgent, ipAddress } = params;

  if (!refreshToken) throw missingRefreshTokenError();

  const decoded = verifyRefreshToken(refreshToken);
  const { userId, jti: incomingJti } = decoded;

  const now = new Date();
  const session = await SessionModel.findOne({
    userId,
    $or: [
      { jti: incomingJti },
      { previousJti: incomingJti, previousJtiExpiresAt: { $gt: now } },
    ],
  });

  if (!session) {
    await SessionModel.deleteMany({ userId });
    authLogger.warn(
      { userId, incomingJti, ipAddress, userAgent },
      "Refresh token reuse detected — all sessions revoked.",
    );
    throw refreshTokenReuseError();
  }

  if (session.revokedAt) {
    throw sessionRevokedError();
  }

  // No UserModel lookup — user fields come from the session snapshot
  const [accessToken, issued] = await Promise.all([
    signAccessToken({
      userId: session.userId.toString(),
      email: session.userEmail,
      fullName: session.userFullName,
    }),
    signRefreshToken(
      { userId: session.userId.toString() },
      { rememberMe: session.rememberMe },
    ),
  ]);

  const rotated = await SessionModel.findOneAndUpdate(
    { _id: session._id, jti: session.jti },
    {
      $set: {
        jti: issued.jti,
        previousJti: incomingJti,
        previousJtiExpiresAt: new Date(Date.now() + GRACE_PERIOD_MS),
        lastUsedAt: issued.issuedAt,
        expiresAt: issued.expiresAt,
        userAgent,
        ipAddress,
      },
    },
    { new: true, projection: { _id: 1 } },
  );

  if (!rotated) {
    authLogger.warn(
      { userId, incomingJti, ipAddress, userAgent },
      "Concurrent refresh — session already rotated.",
    );
    throw expiredRefreshTokenError();
  }

  authLogger.info(
    {
      userId: session.userId.toString(),
      sessionId: rotated._id.toString(),
      rememberMe: session.rememberMe,
      ipAddress,
    },
    "Refresh token rotated successfully.",
  );

  return {
    user: {
      id: session.userId.toString(),
      email: session.userEmail,
      fullName: session.userFullName,
    },
    accessToken,
    refreshToken: issued.token,
    refreshExpiresAt: issued.expiresAt,
    rememberMe: session.rememberMe,
  };
}
