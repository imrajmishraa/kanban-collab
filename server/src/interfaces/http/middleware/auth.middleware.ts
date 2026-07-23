import { type Request } from 'express';
import { asyncHandler} from '../../../shared/utils/asyncHandler'
import { verifyAccessToken } from '../../../infrastructure/security/token';
import { expiredAccessTokenError, missingAccessTokenError } from '../../../shared/errors/auth/accessToken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    fullName: string;
  };
}

export const authenticateJWT = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const authHeaders = req.headers.authorization;

    if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
      throw missingAccessTokenError;
    }

    const parts = authHeaders.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw missingAccessTokenError;
    }

    const token = parts[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw expiredAccessTokenError;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      fullName: decoded.fullName,
    };

    next();
  },
);
