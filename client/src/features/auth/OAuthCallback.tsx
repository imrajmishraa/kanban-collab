import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const status = params.get("status");
    const reason = params.get("reason") ?? "unknown";
    const user = params.get("user") ?? undefined;

    // If running inside a popup, post the outcome back to the parent window and close immediately
    if (window.opener && window.opener !== window) {
      try {
        window.opener.postMessage(
          {
            type: "OAUTH_RESPONSE",
            status,
            reason: status === "success" ? undefined : reason,
            user,
          },
          window.location.origin,
        );
        window.close();
        return;
      } catch {
        // Fallback to normal redirect if opener communication fails
      }
    }

    if (status !== "success") {
      navigate(`/auth/login?error=oauth&reason=${encodeURIComponent(reason)}`, {
        replace: true,
      });

      return;
    }

    void refresh().then(async (ok) => {
      // A second effect run (StrictMode, or a params change) owns the redirect.
      if (cancelled) return;

      if (ok) {
        const { useActiveWorkspace } = await import("@/stores/activeWorkspace");
        useActiveWorkspace.getState().clearActiveWorkspace();
      }

      navigate(ok ? "/dashboard" : "/auth/login?error=oauth_refresh", {
        replace: true,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [params, refresh, navigate]);

  return (
    <main className="flex h-screen items-center justify-center">
      <p className="font-mono text-sm text-white/60">Completing sign-in…</p>
    </main>
  );
}
