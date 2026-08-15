import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/app/providers/AuthProvider";
import AuthLoadingScreen from "@/components/feedback/AuthLoadingScreen";

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  /**
   * Wait until AuthProvider has finished restoring
   * the user's session.
   */
  if (isLoading) {
    return <AuthLoadingScreen message="[ Checking authentication... ]" />;
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
