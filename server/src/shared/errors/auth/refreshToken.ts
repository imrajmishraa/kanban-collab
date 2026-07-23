import { ApiError } from '../../utils/ApiError';

export const invalidRefreshTokenError = () =>
  new ApiError(401, "Invalid refresh token");

export const expiredRefreshTokenError = () =>
  new ApiError(401, 'Security breach warning: refresh token already used')

export const missingRefreshTokenError = () =>
  new ApiError(401, 'Refresh token missing');
