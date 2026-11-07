import { Navigate, Outlet } from "react-router-dom";

import SplashSignal from "@/components/feedback/SplashSignal";
import { useAuth } from "@/hooks/useAuth";

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for the auth store to finish restoring the session.
  if (isLoading) {
    return <SplashSignal phase="auth" />;
  }

  // Authenticated users shouldn't see login/register.
  if (isAuthenticated) {
    return <Navigate to="/workspaces" replace />;
  }

  return <Outlet />;
}
