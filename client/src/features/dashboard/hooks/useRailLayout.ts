import { useEffect, useRef, useState } from "react";

import { useSidebarState } from "../stores/sidebarState";
import { useRightPanel } from "@/stores/rightPanel";
import { computeRail, RAIL, type RailLayout } from "../lib/railMetrics";

/** D3: the rail steps aside for the column above this width. */
const PANEL_RAIL_LIMIT = 320;

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
   * it comes back at its *default* width — the width the board was designed around — not at
   * MIN, which would quietly forget the width they had chosen.
   */
  const panelOpen = useRightPanel((state) => state.mode !== "off");

  useEffect(() => {
    if (!panelOpen) return;

    const rail = useSidebarState.getState();
    /* D3: above the icon rail's *default* is the rule — 320, not 288. A rail sitting at the
       default is already the width the board was designed around; anything wider is what
       leaves the board a sliver. */
    if (rail.mode !== "hidden" && rail.width > PANEL_RAIL_LIMIT) rail.hide();
  }, [panelOpen]);

  /*
   * Only a reader-initiated open resets the width.
   *
   * The rail that D3 hid (because the column opened over it) comes back at its
   * *default* width, not at MIN: it was hidden for being wider than the default,
   * so reopening at MIN would quietly forget the width the reader had chosen and
   * leave them to drag it back every time. The board makes room first — it is the
   * centre's job to give, not the rail's.
   */
  const previousMode = useRef(mode);

  useEffect(() => {
    const came = previousMode.current;
    previousMode.current = mode;

    if (!panelOpen || mode !== "open") return;
    if (came !== "hidden" && came !== "collapsed") return;

    const rail = useSidebarState.getState();
    /* Only a rail that had grown *past* the default is forced back to it; a reader
       who left it narrower than the default keeps their width. */
    if (rail.width > RAIL.DEFAULT) rail.setWidth(RAIL.DEFAULT);
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
