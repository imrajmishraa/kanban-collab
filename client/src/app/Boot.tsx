import { useEffect, type ReactNode } from "react";

import { useAuthStore } from "@/stores/useAuthStore";

export function Boot({ children }: { children: ReactNode }) {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  return <>{children}</>;
}
