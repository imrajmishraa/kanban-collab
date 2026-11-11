import { Navigate, Outlet, useLocation } from "react-router-dom";

import { AuthNavbar, postLoginDestination } from "@/features/auth";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useSmoothScroll } from "@/lib/useSmoothScroll";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  useSmoothScroll();

  if (isLoading) {
    return (
      <div
        className="flex h-svh items-center justify-center bg-(--bg-root)"
        style={{ colorScheme: theme }}
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to={postLoginDestination(location.state)} replace />;
  }

  return (
    <div
      className="relative flex h-svh flex-col overflow-hidden bg-(--bg-root) font-sans text-(--text-primary) antialiased"
      /* Tokens handle the palette; `colorScheme` is the part they cannot reach —
         scrollbars, autofill and the date picker follow the same choice. */
      style={{ colorScheme: theme }}
    >
      <div className="relative z-50 shrink-0 w-full max-w-384 mx-auto border-x border-(--hairline)">
        <AuthNavbar />
      </div>

      {/* No max-height and no inner overflow: the card centres in whatever is
          left under the bar, and anything taller than the viewport is clipped
          by the shell rather than turning into a scrollbar. */}
      <main className="relative z-10 flex min-h-0 w-full flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
