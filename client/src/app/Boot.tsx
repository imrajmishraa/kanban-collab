import { useEffect, type ReactNode } from "react";

import { useAuthStore } from "@/stores/useAuthStore";

export function Boot({ children }: { children: ReactNode }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void restoreSession();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [restoreSession]);

  return <>{children}</>;
}
