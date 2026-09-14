import type { Request, Response } from "express";

import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";

import { register as registerUser } from "../../../../application/auth/register";
import { login as loginUser } from "../../../../application/auth/login";
import { refresh as refreshTokens } from "../../../../application/auth/refresh";
import { logout as revokeSession } from "../../../../application/auth/logout";

import {
  REFRESH_COOKIE_NAME,
  getRefreshCookieOptions,
  clearRefreshCookieOptions,
} from "../../utils/cookies";
import { missingAccessTokenError } from "../../../../shared/errors/auth/accessToken";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { me as meUseCase } from "../../../../application/auth/me";

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 900;

// POST /api/v1/auth/register

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  const result = await registerUser({
    email,
    password,
    fullName,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  return res.status(201).json(
    new ApiResponse(201, "User registered successfully.", {
      userId: result.userId,
      email: result.email,
      fullName: result.fullName,
      emailVerified: result.emailVerified,
    }),
  );
});

// POST /api/v1/auth/login

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  const result = await loginUser({
    email,
    password,
    rememberMe,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  res.cookie(
    REFRESH_COOKIE_NAME,
    result.refreshToken,
    getRefreshCookieOptions(result.rememberMe),
  );

  return res.status(200).json(
    new ApiResponse(200, "User logged in successfully.", {
      accessToken: result.accessToken,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      user: result.user,
    }),
  );
});

// POST /api/v1/auth/refresh

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  try {
    const result = await refreshTokens({
      refreshToken: rawRefreshToken,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.cookie(
      REFRESH_COOKIE_NAME,
      result.refreshToken,
      getRefreshCookieOptions(result.rememberMe),
    );

    return res.status(200).json(
      new ApiResponse(200, "Refresh successful.", {
        accessToken: result.accessToken,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        user: result.user,
      }),
    );
  } catch (error) {
    res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions());
    throw error;
  }
});

// POST /api/v1/auth/logout

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  await revokeSession(rawRefreshToken, {
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions());

  return res
    .status(200)
    .json(new ApiResponse(200, "Logged out successfully.", null));
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw missingAccessTokenError();

  const result = await meUseCase(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, "User profile retrieved.", result));
});