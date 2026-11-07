import { useSyncExternalStore } from "react";

import LoadingScreen from "./LoadingScreen";
import { getSplashPhase, subscribeSplash } from "@/stores/splashStore";

/**
 * The one and only splash. Mounted once, next to the router, and never
 * unmounted while the app is loading — so the entrance runs exactly once and
 * every later phase only swaps the copy.
 *
 * Rendered on top of everything: while it is up, nothing behind it is reachable
 * or visible.
 */
export default function SplashHost() {
  const phase = useSyncExternalStore(
    subscribeSplash,
    getSplashPhase,
    /* No server pass in this app. */
    () => null,
  );

  if (!phase) return null;

  return <LoadingScreen phase={phase} />;
}
