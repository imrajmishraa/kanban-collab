import { useEffect, useState } from "react";

import { useSidebarState } from "../stores/sidebarState";
import { useRightPanel } from "@/stores/rightPanel";
import { computeRail, RAIL, type RailLayout } from "../lib/railMetrics";

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

  /*
   * Two rules that only make sense together, so they live in one place.
   *
   * Opening the column over a rail that is wider than its default leaves the board with a
   * sliver: the rail steps aside instead. And when the reader opens the rail again by hand,
   * it starts at MIN — the default width would take the space straight back, so the column
   * would shrink by itself and read as a bug.
   */
  const panelOpen = useRightPanel((state) => state.mode !== "off");

  useEffect(() => {
    if (!panelOpen) return;

    const rail = useSidebarState.getState();
    if (rail.mode !== "hidden" && rail.width > RAIL.DEFAULT) rail.hide();
  }, [panelOpen]);

  useEffect(() => {
    if (!panelOpen || mode !== "open") return;

    const rail = useSidebarState.getState();
    if (rail.width > RAIL.MIN) rail.setWidth(RAIL.MIN);
  }, [panelOpen, mode]);

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
