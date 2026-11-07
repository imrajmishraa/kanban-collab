import { useEffect, useState } from "react";

import {
  pushSplash,
  removeSplash,
  type SplashPhase,
} from "@/stores/splashStore";

/**
 * Renders nothing and tells `SplashHost` what to show.
 *
 * This replaces "return `<LoadingScreen/>`" in the route guards and the router's
 * Suspense fallback. It cannot push during render — that would be a side effect
 * — so it pushes in an effect, which means the splash is a frame behind the tree
 * that asked for it. That frame is why the host is an overlay and not a route
 * element: nothing behind it is reachable while it is up.
 */
export default function SplashSignal({ phase }: { phase: SplashPhase }) {
  /* A token per instance, so an outgoing holder can only remove its own entry.
     `useState` keeps the initialiser pure — a ref written during render would be
     the same side effect we are avoiding. */
  const [token] = useState(() => Symbol("splash"));

  useEffect(() => {
    pushSplash(token, phase);
    return () => removeSplash(token);
  }, [token, phase]);

  return null;
}
