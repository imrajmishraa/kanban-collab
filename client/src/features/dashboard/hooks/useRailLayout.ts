import { useEffect, useState } from "react";

import { useSidebarState } from "../stores/sidebarState";
import { computeRail, type RailLayout } from "../lib/railMetrics";

/**
 * The rail's layout for the current viewport.
 *
 * Two surfaces need the same answer — the rail itself decides its width, the
 * layout decides what the page reserves — so the computation lives here once
 * rather than in both, where the two would drift.
 */
export function useRailLayout(): RailLayout {
  const mode = useSidebarState((state) => state.mode);
  const width = useSidebarState((state) => state.width);
  const hovering = useSidebarState((state) => state.hovering);
  const resizing = useSidebarState((state) => state.resizing);
  const viewportWidth = useViewportWidth();

  return computeRail({ mode, width, hovering, viewportWidth, resizing });
}

/** Live `window.innerWidth`, so the rail can react to a resize. */
export function useViewportWidth(): number {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return viewportWidth;
}
