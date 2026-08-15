import axios from "axios";

import { getAccessToken } from "@/stores/useAuthStore";

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;

      if (responseData && typeof responseData === "object") {
        const data = responseData as {
          message?: unknown;
          error?: unknown;
        };

        if (typeof data.message === "string") {
          throw new Error(data.message);
        }

        if (typeof data.error === "string") {
          throw new Error(data.error);
        }
      }
    }

    throw error;
  },
);
