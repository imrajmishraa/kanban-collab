import { Navigate, Outlet, useLocation } from "react-router-dom";

import SplashSignal from "@/components/feedback/SplashSignal";
import { useAuth } from "@/hooks/useAuth";
import { postLoginDestination } from "@/features/auth";
import { useTheme } from "@/hooks/useTheme";

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  useTheme();

  // Wait for the auth store to finish restoring the session.
  if (isLoading) {
    return <SplashSignal phase="auth" />;
  }

  /* Authenticated users shouldn't see login/register — and when they were sent
     here from a protected page, they go back to it rather than to the boards.
     This guard is the single owner of that decision; the form does not race it. */
  if (isAuthenticated) {
    return <Navigate to={postLoginDestination(location.state)} replace />;
  }

  return <Outlet />;
}
