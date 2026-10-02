import { useSyncExternalStore } from "react";

/* ── Media query (SSR-safe, legacy-Safari safe) ───────────────────── */
export function useMediaQuery(query: string) {
  const subscribe = (cb: () => void) => {
    const mql = window.matchMedia(query);
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    }
    // Safari < 14 fallback
    mql.addListener(cb);
    return () => mql.removeListener(cb);
  };
  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => false;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
