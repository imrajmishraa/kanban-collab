import { useAuthStore } from "@/stores/useAuthStore";

export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const refresh = useAuthStore((s) => s.refresh);

  return {
    status,
    user,
    accessToken,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    login,
    register,
    logout,
    refresh,
  };
}
