import { ApiError } from '../../utils/ApiError';

export const invalidAccessTokenError = () =>
  new ApiError(401, 'Unauthorized: Access token invalid')

export const missingAccessTokenError = () =>
  new ApiError(401, 'Unauthorized: Access token missing');

export const expiredAccessTokenError = () =>
  new ApiError(401, "Unauthorized: Access token expired");
