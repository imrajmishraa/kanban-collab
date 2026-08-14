import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-neutral-100">
        <div className="text-center">
          <p className="font-mono text-xs text-neutral-500">
            [ Restoring session... ]
          </p>

          <span
            aria-hidden="true"
            className="mx-auto mt-4 block h-1.5 w-1.5 animate-pulse bg-rose-500"
          />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
}
