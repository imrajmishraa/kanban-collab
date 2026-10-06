import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  getAccessToken,
  setAccessToken,
  clearAuthSession,
} from "@/stores/authTokenAccessor";
import { refreshRequest } from "@/api/authApi";

import type { ApiErrorResponse } from "./apiError";

// ERROR TYPE

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly errors: Array<{
    field?: string;
    message: string;
    code?: string;
    location?: string;
  }>;
  public readonly data: unknown;

  constructor(params: {
    message: string;
    statusCode: number;
    code?: string;
    errors?: ApiClientError["errors"];
    data?: unknown;
  }) {
    super(params.message);
    this.name = "ApiClientError";
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.errors = params.errors ?? [];
    this.data = params.data ?? null;
  }
}

// AXIOS INSTANCE

export const apiClient = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR

/** Read a non-httpOnly cookie by name (used for the CSRF double-submit token). */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`,
    ),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // CSRF double-submit: echo the readable cookie back as a header on every
  // state-changing request (the server rejects the request otherwise).
  const method = (config.method ?? "get").toLowerCase();
  if (UNSAFE_METHODS.has(method)) {
    const csrfToken = readCookie("csrf_token");
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }

  return config;
});

// RESPONSE INTERCEPTOR

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retriedAfterRefresh?: boolean;
}

const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh"];

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: unknown) => {
    if (!axios.isAxiosError<ApiErrorResponse>(error)) {
      return Promise.reject(
        new ApiClientError({
          message: "Something went wrong. Please try again.",
          statusCode: 0,
          code: "UNKNOWN_ERROR",
        }),
      );
    }

    if (!error.response) {
      return Promise.reject(
        new ApiClientError({
          message:
            "Unable to connect to the server. Please check your connection.",
          statusCode: 0,
          code: "NETWORK_ERROR",
        }),
      );
    }

    const { status, data, headers } = error.response;
    const originalConfig = error.config as RetryableRequestConfig | undefined;
    const code = data?.code;

    // Any 401 from a non-auth endpoint gets ONE refresh attempt. The token may
    // be expired, invalid, or simply missing (a half-cleared session), and all
    // three are recoverable by refreshing. Previously only
    // ACCESS_TOKEN_EXPIRED was handled, so a missing token could never recover.
    if (
      status === 401 &&
      originalConfig &&
      !originalConfig._retriedAfterRefresh &&
      !isAuthEndpoint(originalConfig.url)
    ) {
      originalConfig._retriedAfterRefresh = true;

      try {
        const refreshed = await refreshRequest();
        setAccessToken(refreshed.data.accessToken);

        originalConfig.headers.Authorization = `Bearer ${refreshed.data.accessToken}`;
        return apiClient(originalConfig);
      } catch (refreshErr) {
        // Refresh failed → the session is gone. Clear ALL of it so the guards
        // redirect to login; clearing only the token would leave an
        // authenticated-looking shell that can never load data.
        clearAuthSession();
        return Promise.reject(normalizeAxiosError(refreshErr));
      }
    }

    if (code === "REFRESH_TOKEN_REUSE_DETECTED") {
      // The server invalidated the session (a rotated token was replayed).
      // Drop the whole session, not just the token.
      clearAuthSession();
    }

    if (status === 429) {
      const retryAfter = headers["retry-after"];
      const seconds = Number(retryAfter);

      return Promise.reject(
        new ApiClientError({
          message:
            data?.message ??
            `Too many requests. Try again ${
              Number.isFinite(seconds) ? `in ${seconds}s` : "later"
            }.`,
          statusCode: 429,
          code: code ?? "RATE_LIMITED",
          data: {
            retryAfterSeconds: Number.isFinite(seconds) ? seconds : undefined,
          },
        }),
      );
    }

    return Promise.reject(normalizeAxiosError(error));
  },
);

// ERROR NORMALIZER

function normalizeAxiosError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) return error;

  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return new ApiClientError({
      message: "Something went wrong. Please try again.",
      statusCode: 0,
      code: "UNKNOWN_ERROR",
    });
  }

  if (!error.response) {
    return new ApiClientError({
      message: "Unable to connect to the server. Please check your connection.",
      statusCode: 0,
      code: "NETWORK_ERROR",
    });
  }

  const { status, data } = error.response;

  return new ApiClientError({
    message: getApiErrorMessage(data) ?? getDefaultErrorMessage(status),
    statusCode: status,
    code: data?.code,
    errors: data?.errors,
    data: data?.data,
  });
}

// MESSAGE HELPERS

function getApiErrorMessage(data: ApiErrorResponse | undefined): string | null {
  if (!data) return null;

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof (data as { error?: unknown }).error === "string") {
    const legacy = (data as { error: string }).error.trim();
    if (legacy) return legacy;
  }

  return null;
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This resource already exists.";
    case 413:
      return "The request is too large.";
    case 422:
      return "Some of the provided information is invalid.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Something went wrong on the server.";
    case 502:
    case 503:
    case 504:
      return "The server is temporarily unavailable.";
    default:
      return "Something went wrong. Please try again.";
  }
}
