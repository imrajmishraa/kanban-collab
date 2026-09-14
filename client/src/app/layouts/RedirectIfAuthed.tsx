import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";

export default function RedirectIfAuthed() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // wait for restore, no flash
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
