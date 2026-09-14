import type { Request, Response, NextFunction } from "express";

import { verifyAccessToken } from "../../../infrastructure/security/jwt";
import {
  missingAccessTokenError,
  invalidAccessTokenError,
} from "../../../shared/errors/auth/accessToken";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    fullName: string;
  };
}

export function authenticateJWT(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if(!authorization) {
    return next(missingAccessTokenError());
  }

  const [scheme, token] = authorization.split(" ", 2);

  if(!scheme || scheme?.toLowerCase() !== "bearer") {
    return next(invalidAccessTokenError());
  }

  if(!token) {
    return next(missingAccessTokenError());
  }

  try {
    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      fullName: decoded.fullName
    }

    next();
  } catch(err) {
    next(err);
  }
}
