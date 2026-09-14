import jwt, {
  type JwtPayload,
  type SignOptions,
  TokenExpiredError,
  JsonWebTokenError,
  NotBeforeError,
} from "jsonwebtoken";
import crypto from "node:crypto";
import ms from "ms";

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


// TYPES

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  email: string;
  fullName: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  jti: string; // session identifier — used to look up the Session row
}

/**
 * Everything the caller needs to:
 *   1. Send the token to the client (`token`)
 *   2. Persist a Session row keyed by `jti`
 *   3. Set the cookie's `maxAge` from `expiresAt`
 *   4. Re-issue on refresh with the same `rememberMe` policy
 */
export interface IssuedRefreshToken {
  token: string;
  jti: string;
  issuedAt: Date;
  expiresAt: Date;
  rememberMe: boolean;
}

export interface SignRefreshOptions {
  rememberMe?: boolean;
}


// SIGN


/**
 * Sign a short-lived access token (default 15m).
 * Never returned in a cookie from here — the controller decides transport.
 */
export function signAccessToken(
  payload: Omit<AccessTokenPayload, "iat" | "exp">,
): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      ENV.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
      },
      (err, token) => {
        if (err) return reject(err);
        resolve(token as string);
      },
    );
  });
}

/**
 * Sign a refresh token.
 *
 * - `rememberMe = false` → 7d default (`JWT_REFRESH_EXPIRES_IN`)
 * - `rememberMe = true`  → 30d extended (`JWT_REFRESH_EXPIRES_IN_REMEMBER`)
 *
 * A random `jti` is embedded so the Session row can be looked up
 * without needing to hash the entire token.
 */
export function signRefreshToken(
  payload: Omit<RefreshTokenPayload, "iat" | "exp" | "jti">,
  options: SignRefreshOptions = {},
): Promise<IssuedRefreshToken> {
  const rememberMe = options.rememberMe ?? false;

  const refreshExpiresIn = rememberMe
    ? ENV.JWT_REFRESH_EXPIRES_IN_REMEMBER // e.g. "30d"
    : ENV.JWT_REFRESH_EXPIRES_IN; // e.g. "7d"

  const jti = crypto.randomUUID();
  const issuedAt = new Date();
  const expiresAt = new Date(
    issuedAt.getTime() + ms(refreshExpiresIn as ms.StringValue),
  );

  return new Promise((resolve, reject) => {
    jwt.sign(
      { ...payload, jti },
      ENV.JWT_REFRESH_SECRET,
      {
        algorithm: "HS256",
        expiresIn: refreshExpiresIn as SignOptions["expiresIn"],
      },
      (err, token) => {
        if (err) return reject(err);
        resolve({
          token: token as string,
          jti,
          issuedAt,
          expiresAt,
          rememberMe,
        });
      },
    );
  });
}


// VERIFY

/**
 * Verify an access token and map jsonwebtoken errors to domain errors.
 * Throws one of: expiredAccessTokenError | accessTokenNotActiveError | invalidAccessTokenError
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as AccessTokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) throw expiredAccessTokenError();
    if (error instanceof NotBeforeError) throw accessTokenNotActiveError();
    if (error instanceof JsonWebTokenError) throw invalidAccessTokenError();
    throw error;
  }
}

/**
 * Verify a refresh token and map jsonwebtoken errors to domain errors.
 * Throws one of: expiredRefreshTokenError | refreshTokenNotActiveError | invalidRefreshTokenError
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) throw expiredRefreshTokenError();
    if (error instanceof NotBeforeError) throw refreshTokenNotActiveError();
    if (error instanceof JsonWebTokenError) throw invalidRefreshTokenError();
    throw error;
  }
}
