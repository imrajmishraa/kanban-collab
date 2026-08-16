import type { ApiResponse } from "@/types/api/api";

import type {
  RegisterResponse,
  LoginResponse,
  RefreshResponse,
} from "@/types/api/auth/auth";

import { apiClient } from "./client";

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}


interface NestedApiResponse<T> {
  data: T;
}

export async function registerRequest(
  payload: RegisterPayload,
): Promise<ApiResponse<RegisterResponse>> {
  const response = await apiClient.post<
    ApiResponse<NestedApiResponse<RegisterResponse>>
  >("/auth/register", payload);

  return {
    ...response.data,
    data: response.data.data.data,
  };
}

export async function loginRequest(
  payload: LoginPayload,
): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<
    ApiResponse<NestedApiResponse<LoginResponse>>
  >("/auth/login", payload);

  return {
    ...response.data,
    data: response.data.data.data,
  };
}

export async function refreshRequest(): Promise<ApiResponse<RefreshResponse>> {
  const response =
    await apiClient.post<ApiResponse<NestedApiResponse<RefreshResponse>>>(
      "/auth/refresh",
    );

  return {
    ...response.data,
    data: response.data.data.data,
  };
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/auth/logout");
}
