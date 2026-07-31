import jwt, {
  type JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
  NotBeforeError,
} from "jsonwebtoken";

import { ENV } from "../../config/env";

import {
  accessTokenNotActiveError,
  expiredAccessTokenError,
  invalidAccessTokenError,
} from "../../shared/errors/auth/accessToken";

import {
  expiredRefreshTokenError,
  invalidRefreshTokenError,
  refreshTokenNotActiveError,
} from "../../shared/errors/auth/refreshToken";
import crypto from "crypto";

const JWT_SECRET = ENV.JWT_SECRET;
const JWT_REFRESH_SECRET = ENV.JWT_REFRESH_SECRET;

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

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
    algorithm: "HS256",
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function signRefreshToken(
  payload: Omit<RefreshTokenPayload, "iat" | "exp">,
): string {
  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID(),
    },
    JWT_REFRESH_SECRET,
    {
      algorithm: "HS256",
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw expiredAccessTokenError();
    }

    if (error instanceof NotBeforeError) {
      throw accessTokenNotActiveError();
    }

    if (error instanceof JsonWebTokenError) {
      throw invalidAccessTokenError();
    }

    throw error;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw expiredRefreshTokenError();
    }

    if (error instanceof NotBeforeError) {
      throw refreshTokenNotActiveError();
    }

    if (error instanceof JsonWebTokenError) {
      throw invalidRefreshTokenError();
    }

    throw error;
  }
}
