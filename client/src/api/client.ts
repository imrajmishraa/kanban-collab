import axios, { type AxiosResponse } from "axios";

import { getAccessToken } from "@/stores/useAuthStore";

import type { ApiErrorResponse } from "./apiError";

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach the current access token to outgoing requests.
 */
api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

/**
 * Normalize API errors into standard Error objects.
 *
 * This prevents UI components from receiving Axios'
 * generic "Request failed with status code XXX" message.
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,

  (error: unknown) => {
    /**
     * Unknown / non-Axios error.
     */
    if (!axios.isAxiosError<ApiErrorResponse>(error)) {
      return Promise.reject(
        new Error("Something went wrong. Please try again."),
      );
    }

    /**
     * Axios error without a server response.
     *
     * Usually:
     * - network failure
     * - server unavailable
     * - CORS / connection issue
     */
    if (!error.response) {
      return Promise.reject(
        new Error(
          "Unable to connect to the server. Please check your connection.",
        ),
      );
    }

    const { status, data } = error.response;

    /**
     * Prefer the backend's actual error message.
     */
    const message = getApiErrorMessage(data) ?? getDefaultErrorMessage(status);

    return Promise.reject(new Error(message));
  },
);

/**
 * Extract a useful message from the backend response.
 */
function getApiErrorMessage(data: ApiErrorResponse | undefined): string | null {
  if (!data) {
    return null;
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  return null;
}

/**
 * Fallback messages used when the backend does not
 * provide a meaningful error message.
 */
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request.";

    case 401:
      return "Invalid email or password.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "The requested resource was not found.";

    case 409:
      return "This resource already exists.";

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
