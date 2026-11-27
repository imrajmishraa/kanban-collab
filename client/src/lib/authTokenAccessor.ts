import { useAuthStore } from "@/stores/useAuthStore";

import type { AuthUser } from "@/types/auth";

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function setAccessToken(token: string | null): void {
  useAuthStore.setState({ accessToken: token });
}

/**
 * Apply a refreshed session — token, user *and* status together.
 *
 * `setAccessToken` deliberately touches only the token, which is wrong for the
 * refresh path: a 401 can arrive while the store still says `unauthenticated`
 * (a failed restore, a bfcache return). Writing just the token there leaves a
 * valid session the route guards refuse to render, so the user is bounced to
 * /auth/login holding a perfectly good token. One call, three fields.
 */
export function setAuthSession(token: string, user: AuthUser): void {
  useAuthStore.setState({
    status: "authenticated",
    user,
    accessToken: token,
  });
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
