import { asyncHandler } from '../../../../shared/utils/asyncHandler';
import crypto from 'crypto';
import { UserModel, SessionModel } from '../../../../infrastructure/db/mongoose/schemas';
import { hashPassword, comparePassword } from '../../../../infrastructure/security/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../../infrastructure/security/token';
import { logger } from '../../../../infrastructure/logging/logger';
import { existingUserError, invaidEmailOrPasswordError, userNotExistError } from '../../../../shared/errors/auth/custom';
import { internalServerError } from '../../../../shared/errors/handler/custom';
import { invalidRefreshTokenError, missingRefreshTokenError, expiredRefreshTokenError } from '../../../../shared/errors/auth/refreshToken';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';
import { ENV } from '../../../../config/env';
import { CookieOptions } from 'express';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
// Dynamic cookie options builder resolving HTTP vs HTTPS environments
export const getCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
    path: '/api/v1/auth',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  };
};

const refresh = asyncHandler(async (req, res) => {
  try {
    const cookies = req.cookies || {};
    const rawRefreshToken = cookies.refreshToken;

    if (!rawRefreshToken) {
      throw missingRefreshTokenError();
    }

    const decoded = verifyRefreshToken(rawRefreshToken);
    if (!decoded) {
      throw invalidRefreshTokenError();
    }

    const oldTokenHash = hashToken(rawRefreshToken);
    const session = await SessionModel.findOne({
      refreshTokenHash: oldTokenHash
    });

    if (!session) {
      // Reuse detection: if a refresh token is used but not found in DB, it could be a stolen token replay.
      // Wipe all sessions for the user as a safety mitigation.
      await SessionModel.deleteMany({
        userId: decoded.userId
      });
      res.clearCookie("refreshToken", {
        ...getCookieOptions(),
      });
      throw expiredRefreshTokenError;
    }

    // Token rotation
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      throw userNotExistError();
    }


    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName
    })

    const newRawRefreshToken = signRefreshToken({ userId: user._id.toString() });
    const newRefreshTokenHash = hashToken(newRawRefreshToken);

    // Update session in DB
    session.refreshTokenHash = newRefreshTokenHash;
    session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE);
    await session.save();

    // Set new cookie
    res.cookie(
      "refreshToken",
      newRawRefreshToken,
      getCookieOptions()
    );

    return res.status(200).json(
      new ApiResponse(200, 'Refresh successful', {
        data: {
          accessToken: newAccessToken,
          expiresIn: 900,
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName
          }
        }
      })
    )
  } catch (error) {
    logger.error('Refresh token error:', error);
    throw internalServerError();
  }
});


const register = asyncHandler(async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw existingUserError();
    }

    const passwordHash = await hashPassword(password);
    const user = await UserModel.create({
      email,
      passwordHash,
      fullName,
      isEmailVerified: false
    });

    logger.info({ userId: user._id, email: user.email }, 'User registered successfully');

    return res.status(201).json(
      new  ApiResponse(201, "User registered successfully.", {
        data: {
          userId: user._id,
          email: user.email,
          fullname: user.fullName,
        }
      })
    )
  } catch (error) {
    logger.error('Registration error:', error);
    console.log(error);
    throw internalServerError();
  }
});


const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw invaidEmailOrPasswordError();
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw invaidEmailOrPasswordError();
    }

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName
    });

    const rawRefreshToken = signRefreshToken({ userId: user._id.toString() });
    const refreshTokenHash = hashToken(rawRefreshToken);

    // Save refresh session in DB (expire in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await SessionModel.create({
      userId: user._id,
      refreshTokenHash,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      lastUsedAt: new Date(),
      expiresAt
    });

    // Set secure HTTP-only cookie
    res.cookie(
      "refreshToken",
      rawRefreshToken,
      getCookieOptions()
    );

    logger.info({ userId: user._id }, 'User logged in successfully');

    return res.status(200).json(
      new ApiResponse(200, 'User logged in successfully', {
        data: {
          accessToken,
          expiresIn: 900,
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName
          }
        }
      })
    );
  } catch (error) {
    logger.error('Login error:', error);
    throw internalServerError();
  }
})


const logout = asyncHandler(async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;

    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await SessionModel.deleteOne({
        refreshTokenHash: tokenHash
      });
    }

    res.clearCookie("refreshToken", {
      ...getCookieOptions(),
    });

    return res.status(200).json(
      new ApiResponse(200, 'Logged out successfully.', {
        data: null
      })
    );
  } catch (error) {
    logger.error({ err: error }, "Unhandled server error");
    throw internalServerError();
  }
});


export { register, login, logout, refresh };
