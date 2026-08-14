import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  /**
   * Wait until AuthProvider has finished restoring
   * the user's session.
   */
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-neutral-100">
        <div className="text-center">
          <p className="font-mono text-xs text-neutral-500">
            [ Checking authentication... ]
          </p>

          <span
            aria-hidden="true"
            className="mx-auto mt-4 block h-1.5 w-1.5 animate-pulse bg-rose-500"
          />
        </div>
      </main>
    );
  }

  /**
   * Authenticated users should not access guest-only pages.
   */
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  /**
   * User is unauthenticated, so guest pages are allowed.
   */
  return <Outlet />;
}
