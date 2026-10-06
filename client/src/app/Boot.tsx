import { useEffect, type ReactNode } from "react";

import { useAuthStore } from "@/stores/useAuthStore";

export function Boot({ children }: { children: ReactNode }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;

      // bfcache restore. Only re-establish the session when we don't already
      // hold one: a second refresh with an already-rotated cookie trips the
      // server's refresh-token REUSE detection and invalidates the session.
      if (useAuthStore.getState().status === "authenticated") return;

      void restoreSession();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [restoreSession]);

  return <>{children}</>;
}
