import jwt, { type JwtPayload } from "jsonwebtoken";

import { ENV } from "../../config/env";
import {
  expiredAccessTokenError,
  invalidAccessTokenError,
} from "../../shared/errors/auth/accessToken";
import {
  expiredRefreshTokenError,
  invalidRefreshTokenError,
} from "../../shared/errors/auth/refreshToken";

const JWT_SECRET = ENV.JWT_SECRET;
const JWT_REFRESH_SECRET = ENV.JWT_REFRESH_SECRET;

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  email: string;
  fullName: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
}

export function signAccessToken(
  payload: Omit<AccessTokenPayload, "iat" | "exp">,
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "15m",
  });
}

export function signRefreshToken(
  payload: Omit<RefreshTokenPayload, "iat" | "exp">,
): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw expiredAccessTokenError();
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw invalidAccessTokenError();
    }

    throw error;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw expiredRefreshTokenError();
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw invalidRefreshTokenError();
    }

    throw error;
  }
}

export default {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
