import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/auth/useAuth";

interface AuthRedirectState {
  from?: { pathname?: string; search?: string; hash?: string };
}

function getPostLoginDestination(state: unknown): string {
  if (!state || typeof state !== "object") return "/dashboard";
  const s = state as AuthRedirectState;
  if (!s.from?.pathname || !s.from.pathname.startsWith("/")) {
    return "/dashboard";
  }
  return `${s.from.pathname}${s.from.search ?? ""}${s.from.hash ?? ""}`;
}

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While session is restoring, keep the auth UI visible but inert.
  // Redirecting now would either:
  //   - bounce a fresh visitor to /login (they're already there, fine)
  //   - bounce a returning user mid-restore
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-root)" />
    );
  }

  if (isAuthenticated) {
    const destination = getPostLoginDestination(location.state);
    return <Navigate to={destination} replace />;
  }

  return (
    <div className="min-h-screen bg-(--bg-root) text-(--text-primary)">
      <Outlet />
    </div>
  );
}
