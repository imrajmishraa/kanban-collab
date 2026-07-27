import { type Request } from "express";

import { asyncHandler } from "../../../shared/utils/asyncHandler";
import { verifyAccessToken } from "../../../infrastructure/security/token";
import { missingAccessTokenError } from "../../../shared/errors/auth/accessToken";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    fullName: string;
  };
}

export const authenticateJWT = asyncHandler(
  async (req: AuthenticatedRequest, _res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw missingAccessTokenError();
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw missingAccessTokenError();
    }

    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      fullName: decoded.fullName,
    };

    next();
  },
);
