import { useEffect, useRef, useState } from "react";

import { useSidebarState } from "../stores/sidebarState";
import { useRightPanel } from "@/stores/rightPanel";
import { useShellFlag } from "@/layouts/useShellFlag";
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
   * it starts at MIN — the default width would take the space straight back, so the column
   * would shrink by itself and read as a bug.
   */
  const panelOpen = useRightPanel((state) => state.mode !== "off");

  /* With the shell on, the model owns visibility and widths: its `computeLayout`
     decides fit, and `settleDrag` restores what a drag disturbed. These two rules
     would hide a wide rail and reset its width behind the model's back — and a
     default-open column then hid the rail on every load. */
  const shellOwnsRail = useShellFlag();

  useEffect(() => {
    if (shellOwnsRail || !panelOpen) return;

    const rail = useSidebarState.getState();
    /* D3: above the icon rail's *default* is the rule — 320, not 288. A rail sitting at the
       default is already the width the board was designed around; anything wider is what
       leaves the board a sliver. */
    if (rail.mode !== "hidden" && rail.width > PANEL_RAIL_LIMIT) rail.hide();
  }, [panelOpen, shellOwnsRail]);

  /*
   * Only a reader-initiated open resets the width. A panel drag can promote `hover` to
   * `open` as a side effect, and resetting the rail to MIN there was the "rail jumps to 240
   * when I drag the panel" bug: the mode changed, so the effect fired, and a width the
   * reader never touched moved.
   */
  const previousMode = useRef(mode);

  useEffect(() => {
    const came = previousMode.current;
    previousMode.current = mode;

    if (shellOwnsRail || !panelOpen || mode !== "open") return;
    if (came !== "hidden" && came !== "collapsed") return;

    const rail = useSidebarState.getState();
    if (rail.width > RAIL.MIN) rail.setWidth(RAIL.MIN);
  }, [mode, panelOpen, shellOwnsRail]);

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
