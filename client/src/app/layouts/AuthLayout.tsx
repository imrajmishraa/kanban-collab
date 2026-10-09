import { Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/marketing/landing/Navbar";

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
    <div className="relative flex min-h-screen flex-col bg-(--bg-root) text-(--text-primary)">
      <div className="relative z-50 shrink-0">
        <Navbar />
      </div>

      <main className="relative z-10 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
