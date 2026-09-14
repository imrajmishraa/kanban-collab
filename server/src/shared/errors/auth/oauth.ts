import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

export function unknownProviderError(name: string): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    `${ERROR_MESSAGE.OAUTH_UNKNOWN_PROVIDER} (${name})`,
    { code: "UNKNOWN_OAUTH_PROVIDER" },
  );
}

export function providerDisabledError(name: string): ApiError {
  return new ApiError(
    HTTP_STATUS.SERVICE_UNAVAILABLE,
    ERROR_MESSAGE.OAUTH_PROVIDER_DISABLED,
    {
      code: "OAUTH_PROVIDER_DISABLED",
      isOperational: true,
      data: { provider: name },
    },
  );
}

export function invalidOAuthStateError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.OAUTH_INVALID_STATE,
    { code: "INVALID_OAUTH_STATE" },
  );
}

export function oauthExchangeFailedError(reason?: string): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    reason ?? ERROR_MESSAGE.OAUTH_EXCHANGE_FAILED,
    { code: "OAUTH_EXCHANGE_FAILED" },
  );
}

export function oauthProfileFetchFailedError(): ApiError {
  return new ApiError(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_MESSAGE.OAUTH_PROFILE_FETCH_FAILED,
    { code: "OAUTH_PROFILE_FETCH_FAILED" },
  );
}

export function oauthEmailNotVerifiedError(provider: string): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    `${ERROR_MESSAGE.OAUTH_EMAIL_NOT_VERIFIED} (${provider})`,
    { code: "OAUTH_EMAIL_NOT_VERIFIED", data: { provider } },
  );
}

export function providerAlreadyLinkedError(provider: string): ApiError {
  return new ApiError(
    HTTP_STATUS.CONFLICT,
    ERROR_MESSAGE.OAUTH_PROVIDER_ALREADY_LINKED,
    { code: "PROVIDER_ALREADY_LINKED", data: { provider } },
  );
}

export function cannotUnlinkLastProviderError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.OAUTH_CANNOT_UNLINK_LAST_PROVIDER,
    { code: "CANNOT_UNLINK_LAST_PROVIDER" },
  );
}

export function providerNotLinkedError(provider: string): ApiError {
  return new ApiError(
    HTTP_STATUS.NOT_FOUND,
    ERROR_MESSAGE.OAUTH_PROVIDER_NOT_LINKED,
    { code: "PROVIDER_NOT_LINKED", data: { provider } },
  );
}
