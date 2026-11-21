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

import {
  isRotatable,
  nextGraceExpiry,
  rotationOutcome,
} from "./sessionMachine";

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
  /*
   * Fetch by lineage only — current or previous — and let the machine decide
   * what the token means. The `$or` used to carry the grace-window check too,
   * which made the rule invisible: "no session" and "reuse" looked the same.
   */
  const session = await SessionModel.findOne({
    userId,
    expiresAt: { $gt: now },
    $or: [{ jti: incomingJti }, { previousJti: incomingJti }],
  });

  if (!session) {
    // Reuse (or a stale/unknown token). Revoke ONLY the single session this
    // token belongs to — identified by its jti lineage — never every session
    // for the user. Deleting all sessions here let one stale token log the
    // user out on every device (a self-inflicted DoS).
    const revoked = await SessionModel.findOneAndUpdate(
      { userId, previousJti: incomingJti, revokedAt: null },
      { $set: { revokedAt: now } },
      { new: true, projection: { _id: 1 } },
    );

    authLogger.warn(
      {
        userId,
        incomingJti,
        ipAddress,
        userAgent,
        sessionRevoked: Boolean(revoked),
      },
      "Refresh token reuse detected — session revoked.",
    );
    throw refreshTokenReuseError();
  }

  const outcome = rotationOutcome(session, incomingJti, now);

  if (outcome === "revoked") {
    throw sessionRevokedError();
  }

  if (outcome === "expired") {
    throw expiredRefreshTokenError();
  }

  if (outcome === "reuse") {
    /* A token we no longer recognise for this session — presented after its
       grace window, or from two rotations ago. End the session. */
    await SessionModel.findOneAndUpdate(
      { _id: session._id, revokedAt: null },
      { $set: { revokedAt: now } },
      { projection: { _id: 1 } },
    );

    authLogger.warn(
      {
        userId,
        incomingJti,
        sessionId: session._id.toString(),
        ipAddress,
        userAgent,
      },
      "Refresh token replayed after its grace window — session revoked.",
    );

    throw refreshTokenReuseError();
  }

  if (!isRotatable(outcome)) {
    throw expiredRefreshTokenError();
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
        /* Anchored to the rotation that orphaned the token — a later grace use
           must not extend it. */
        previousJtiExpiresAt: nextGraceExpiry(session, outcome, now),
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
