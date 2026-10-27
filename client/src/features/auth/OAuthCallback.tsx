import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";

/**
 * Landing page for the OAuth redirect (`/auth/callback?status=…`).
 *
 * By the time we get here the server has already set the refresh cookie; this
 * page exchanges it for an access token and routes onward.
 *
 * The decision is driven by the result of the refresh this component starts,
 * never by the store's shared `status`. Any other request in the app can flip
 * `status` to "unauthenticated" while our refresh is still in flight — a stale
 * pre-existing value did exactly that and bounced the user to the login page
 * even though the sign-in had just succeeded.
 */
export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const status = params.get("status");

    if (status !== "success") {
      const reason = params.get("reason") ?? "unknown";

      navigate(`/auth/login?error=oauth&reason=${encodeURIComponent(reason)}`, {
        replace: true,
      });

      return;
    }

    void refresh().then((ok) => {
      // A second effect run (StrictMode, or a params change) owns the redirect.
      if (cancelled) return;

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
