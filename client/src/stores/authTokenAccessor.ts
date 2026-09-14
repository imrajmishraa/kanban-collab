import { useAuthStore } from "./useAuthStore";

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function setAccessToken(token: string | null): void {
  useAuthStore.setState({ accessToken: token });
}

export function clearAccessToken(): void {
  useAuthStore.setState({ accessToken: null });
}
