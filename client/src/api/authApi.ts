import type { ApiResponse } from "@/types/api";

import type { LoginResponse, RefreshResponse } from "@/types/auth";

import { api } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

interface NestedApiResponse<T> {
  data: T;
}

export async function loginRequest(
  payload: LoginPayload,
): Promise<ApiResponse<LoginResponse>> {
  const response = await api.post<
    ApiResponse<NestedApiResponse<LoginResponse>>
  >("/auth/login", payload);

  return {
    ...response.data,
    data: response.data.data.data,
  };
}

export async function refreshRequest(): Promise<ApiResponse<RefreshResponse>> {
  const response =
    await api.post<ApiResponse<NestedApiResponse<RefreshResponse>>>(
      "/auth/refresh",
    );

  return {
    ...response.data,
    data: response.data.data.data,
  };
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout");
}
