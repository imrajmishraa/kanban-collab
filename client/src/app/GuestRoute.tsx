import { Navigate, Outlet } from "react-router-dom";

import AuthLoadingScreen from "@/components/feedback/LoadingScreen";
import { useAuth } from "@/hooks/auth/useAuth";

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for the auth store to finish restoring the session.
  if (isLoading) {
    return <AuthLoadingScreen message="Checking authentication..." />;
  }

  // Authenticated users shouldn't see login/register.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
