import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh, status } = useAuth();
  const kicked = useRef(false);

  useEffect(() => {
    if (kicked.current) return;
    kicked.current = true;

    const s = params.get("status");

    if (s !== "success") {
      const reason = params.get("reason") ?? "unknown";
      navigate(`/login?error=oauth&reason=${encodeURIComponent(reason)}`, {
        replace: true,
      });
      return;
    }

    refresh().catch(() => {
      // handled by the status watcher below
    });
  }, [params, refresh, navigate]);

  useEffect(() => {
    if (status === "authenticated") {
      navigate("/dashboard", { replace: true });
    } else if (status === "unauthenticated" && kicked.current) {
      navigate("/login?error=oauth_refresh", { replace: true });
    }
  }, [status, navigate]);

  return (
    <main className="flex h-screen items-center justify-center">
      <p className="font-mono text-sm text-white/60">Completing sign-in…</p>
    </main>
  );
}
