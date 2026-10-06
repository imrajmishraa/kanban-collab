import { useAuthStore } from "./useAuthStore";

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function setAccessToken(token: string | null): void {
  useAuthStore.setState({ accessToken: token });
}

/**
 * Clear the *whole* auth session — status, user and token.
 *
 * `clearAccessToken` only drops the token, which leaves the store reporting
 * `status: "authenticated"`. The route guards then render the app shell with
 * no usable token, so every request 401s and nothing can recover — the user
 * sees a working-looking dashboard where no data ever loads.
 *
 * Use this whenever the session is unrecoverable (refresh failed, or the
 * server flagged refresh-token reuse) so the guards redirect to /auth/login
 * instead of stranding a half-authenticated shell.
 */
export function clearAuthSession(): void {
  useAuthStore.getState().clearAuth();
}
