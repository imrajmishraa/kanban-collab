import { asyncHandler } from '../../../../shared/utils/asyncHandler';
import crypto from 'crypto';
import { UserModel, SessionModel } from '../../../../infrastructure/db/mongoose/schemas';
import { hashPassword, comparePassword } from '../../../../infrastructure/security/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../../infrastructure/security/token';
import { authLogger } from "../../../../infrastructure/logging/childLogger";
import { existingUserError, invalidEmailOrPasswordError, userNotFoundError } from '../../../../shared/errors/auth/custom';

import { missingRefreshTokenError, expiredRefreshTokenError } from '../../../../shared/errors/auth/refreshToken';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';
import { ENV } from '../../../../config/env';
import { CookieOptions } from 'express';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
// Dynamic cookie options builder resolving HTTP vs HTTPS environments
export const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: ENV.NODE_ENV === "production",
  sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/v1/auth",
  maxAge: REFRESH_TOKEN_MAX_AGE,
});

export const clearCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: ENV.NODE_ENV === "production",
  sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/v1/auth",
});

const refresh = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;

  try {
    if (!rawRefreshToken) {
      throw missingRefreshTokenError();
    }

    const decoded = verifyRefreshToken(rawRefreshToken);

    const refreshTokenHash = hashToken(rawRefreshToken);

    const session = await SessionModel.findOne({
      refreshTokenHash,
    });

    if (!session) {
      // Refresh token reuse detected.
      await SessionModel.deleteMany({
        userId: decoded.userId,
      });

      res.clearCookie("refreshToken", { ...getCookieOptions() });

      throw expiredRefreshTokenError();
    }

    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      throw userNotFoundError();
    }

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
    });

    const newRefreshToken = signRefreshToken({
      userId: user._id.toString(),
    });

    session.refreshTokenHash = hashToken(newRefreshToken);
    session.lastUsedAt = new Date();
    session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE);

    await session.save();

    res.cookie("refreshToken", newRefreshToken, getCookieOptions());

    authLogger.info(
      {
        userId: user._id,
        sessionId: session._id,
        ipAddress: req.ip,
      },
      "Refresh token rotated successfully.",
    );

    return res.status(200).json(
      new ApiResponse(200, "Refresh successful.", {
        data: {
          accessToken,
          expiresIn: 900,
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
          },
        },
      }),
    );
  } catch (error) {
    authLogger.error(
      {
        err: error,
        hasRefreshToken: Boolean(rawRefreshToken),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
      "Refresh token request failed.",
    );

    throw error;
  }
});


const register = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw existingUserError();
    }

    const passwordHash = await hashPassword(password);

    const user = await UserModel.create({
      email,
      passwordHash,
      fullName,
      isEmailVerified: false,
    });

    authLogger.info(
      {
        userId: user._id,
        email: user.email,
      },
      "User registered successfully.",
    );

    return res.status(201).json(
      new ApiResponse(201, "User registered successfully.", {
        data: {
          userId: user._id,
          email: user.email,
          fullName: user.fullName,
        },
      }),
    );
  } catch (error) {
    authLogger.error(
      {
        err: error,
        email,
        ipAddress: req.ip,
      },
      "User registration failed.",
    );

    throw error;
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
  
    if (!user) {
      throw invalidEmailOrPasswordError();
    }
  
    const isMatch = await comparePassword(password, user.passwordHash);
  
    if (!isMatch) {
      throw invalidEmailOrPasswordError();
    }
  
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
    });
  
    const rawRefreshToken = signRefreshToken({
      userId: user._id.toString(),
    });
  
    const refreshTokenHash = hashToken(rawRefreshToken);
  
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE);
  
    await SessionModel.create({
      userId: user._id,
      refreshTokenHash,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      lastUsedAt: new Date(),
      expiresAt,
    });
  
    res.cookie("refreshToken", rawRefreshToken, getCookieOptions());
  
    authLogger.info(
      {
        userId: user._id,
        email: user.email,
        ipAddress: req.ip,
      },
      "User logged in successfully.",
    );
  
    return res.status(200).json(
      new ApiResponse(200, "User logged in successfully", {
        data: {
          accessToken,
          expiresIn: 900,
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
          },
        },
      }),
    );
  } catch (error) {
    authLogger.error(
      {
        err: error,
        email,
        ipAddress: req.ip,
      },
      "User login failed.",
    );
    throw error;
  }
});

const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  try {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await SessionModel.deleteOne({
        refreshTokenHash: tokenHash
      });
    }

    res.clearCookie("refreshToken", clearCookieOptions());

    authLogger.info(
      {
        hasRefreshToken: Boolean(rawRefreshToken),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
      "User logged out successfully.",
    );


    return res.status(200).json(
      new ApiResponse(200, 'Logged out successfully.', {
        data: null
      })
    );
  } catch (error) {
    authLogger.error(
      {
        err: error,
        hasRefreshToken: Boolean(rawRefreshToken),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
      "Logout failed.",
    );

    throw error;
  }
});


export { register, login, logout, refresh };
