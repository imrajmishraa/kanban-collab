import type { ApiResponse } from "@/types/api";
import type {
  RegisterResponse,
  LoginResponse,
  RefreshResponse,
} from "@/types/auth";
import { apiClient } from "@/services/client";

// PAYLOADS

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// REGISTER

export async function registerRequest(
  payload: RegisterPayload,
): Promise<ApiResponse<RegisterResponse>> {
  const response = await apiClient.post<ApiResponse<RegisterResponse>>(
    "/auth/register",
    payload,
  );

  return response.data;
}

// LOGIN

export async function loginRequest(
  payload: LoginPayload,
): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    payload,
  );

  return response.data;
}

// LOGOUT

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/auth/logout");
}

// REFRESH

let refreshPromise: Promise<ApiResponse<RefreshResponse>> | null = null;

export function refreshRequest(): Promise<ApiResponse<RefreshResponse>> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = apiClient
    .post<ApiResponse<RefreshResponse>>("/auth/refresh")
    .then((response) => response.data)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/* ── Password recovery ─────────────────────────────────────── */

/**
 * Ask for a reset code.
 *
 * The server answers 202 whether or not the address has an account, so the form
 * cannot use the response to tell the user which it was — and neither can an
 * attacker.
 */
export async function forgotPasswordRequest(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

/** Set a new password with the six-digit code. Every session is revoked. */
export async function resetPasswordRequest(payload: {
  email: string;
  code: string;
  password: string;
}): Promise<void> {
  await apiClient.post("/auth/reset-password", payload);
}
