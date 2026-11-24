import { PANEL } from "@/components/layout/panelMetrics";

/**
 * One drag, two rails — the switch that decides which rulebook is in force.
 *
 * The right column's divider is the only handle that can move the whole layout, because
 * dragging it left past its own minimum has nowhere else to go: the left rail is what is
 * left. So the drag is a small state machine rather than a width calculation, and this
 * module is the whole of it — pure, so it can be tested without a browser.
 *
 *   panel           320 … MAX          the column's own range, with magnetic stops
 *   panel-remaining past MAX           everything the rail is not using; rail untouched
 *   rail            the rail's range   240 … 420, with the rail's own stops
 *   rail-collapsed  below the rail min 72px of icons
 *   rail-hidden     below that         off the page
 *
 * Two rules that are deliberately *not* drag outcomes:
 *
 * - **Fullscreen** (the whole viewport, rail included) is never reached by dragging. It
 *   covers navigation, so it takes a deliberate act: `⌘⇧J` or the header's button — and
 *   that act closes the rail, because a fullscreen panel and a visible rail cannot both
 *   be true.
 * - **Closing the column** happens at its own minimum, before the rail's range begins.
 */
export type DragZone =
  "panel" | "panel-remaining" | "rail" | "rail-collapsed" | "rail-hidden";

export interface DragInput {
  /** The width the pointer is asking the *panel* for, before any clamping. */
  rawPanelWidth: number;
  /** What the rail is rendering at right now, and what it was at drag start. */
  railWidth: number;
  /** The width the rail had when this drag began: the drag's own reference. */
  railStartWidth: number;
  viewport: number;
  /** The panel's own drag ceiling (`viewport - rail - PAGE_MIN`). */
  ceiling: number;
}

export interface DragFrame {
  zone: DragZone;
  /** Set when the panel's width changes; `null` leaves it alone. */
  panelWidth: number | null;
  /** Set when the rail's width changes; `null` leaves it alone. */
  railWidth: number | null;
}

const RAIL_MIN = 240;
const RAIL_MAX = 420;
const RAIL_COLLAPSED = 72;
const RAIL_HIDE_SLOP = 32;

/** Which rulebook the pointer is currently in. */
export function dragZone({
  rawPanelWidth,
  railWidth,
  ceiling,
}: DragInput): DragZone {
  /* Past the ceiling the column takes what the rail leaves. With the rail hidden that
     *is* the whole window — which is the point of `remaining` being a width rather than
     a mode, so there is nothing to special-case here. */
  if (rawPanelWidth >= ceiling + PANEL.FULL_SLOP) return "panel-remaining";

  /* Below the column's own minimum the drag has run out of column: the rail is next.
     The handover point is `MIN - CLOSE_SLOP`, and only the travel *past* it counts —
     measuring the whole overflow instead would drop the rail below its own minimum the
     instant the handover happened, so the rail's range would be unreachable. */
  if (rawPanelWidth < PANEL.MIN - PANEL.CLOSE_SLOP) {
    const extra = PANEL.MIN - PANEL.CLOSE_SLOP - rawPanelWidth;
    const wanted = railWidth - extra;

    if (wanted < RAIL_MIN - RAIL_HIDE_SLOP) return "rail-hidden";
    if (wanted < RAIL_MIN) return "rail-collapsed";

    return "rail";
  }

  return "panel";
}

/** The frame for a pointer position. `switch` on the zone, nothing else. */
export function resolveDrag(input: DragInput): DragFrame {
  const zone = dragZone(input);
  const { rawPanelWidth, railWidth, railStartWidth, viewport, ceiling } = input;

  switch (zone) {
    case "panel": {
      return {
        zone,
        panelWidth: Math.min(
          ceiling,
          Math.max(PANEL.MIN, Math.round(rawPanelWidth)),
        ),
        railWidth: null,
      };
    }

    case "panel-remaining": {
      /* Everything the rail is not using. The rail keeps its width — this is the
         "pause at MAX, then take the rest" step, not fullscreen. */
      return {
        zone,
        panelWidth: Math.max(PANEL.MIN, Math.round(viewport - railWidth)),
        railWidth: null,
      };
    }

    case "rail": {
      const extra = PANEL.MIN - PANEL.CLOSE_SLOP - rawPanelWidth;
      const wanted = Math.round(railStartWidth - extra);

      return {
        zone,
        /* The column sits at its minimum while the rail gives ground. */
        panelWidth: PANEL.MIN,
        railWidth: Math.min(RAIL_MAX, Math.max(RAIL_MIN, wanted)),
      };
    }

    case "rail-collapsed": {
      return {
        zone,
        panelWidth: PANEL.MIN,
        railWidth: RAIL_COLLAPSED,
      };
    }

    case "rail-hidden": {
      return {
        zone,
        panelWidth: PANEL.MIN,
        railWidth: 0,
      };
    }
  }
}
