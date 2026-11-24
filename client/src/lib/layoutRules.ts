/**
 * The layout spike's numbers, in one place.
 *
 * Every value comes from the rules form filled on 25/11
 * (`allotment-rules-form.html`), not from `railMetrics.ts` / `panelMetrics.ts`.
 * The spike exists to try these numbers *before* the app's own modules move, so
 * it must not read them: a spike that borrows the production constants can only
 * tell you that production is production.
 *
 * Where the form and the app disagree, `SPIKE_DELTAS` says so out loud instead
 * of quietly picking one — the spike page renders that list, and a reader
 * comparing the two should see the difference rather than discover it.
 */

export type Device = "desktop" | "tablet" | "mobile";

interface RailRules {
  collapsed: number;
  min: number;
  default: number;
  max: number;
  preview: number;
}

interface PanelRules {
  min: number;
  default: number;
  max: number;
}

export interface DeviceRules {
  rail: RailRules;
  panel: PanelRules;
  /** The board's floor. The panel's ceiling is derived from it, never the other way. */
  boardMin: number;
}

export const SPIKE = {
  desktop: {
    rail: { collapsed: 72, min: 200, default: 288, max: 420, preview: 288 },
    panel: { min: 320, default: 420, max: 660 },
    boardMin: 420,
  },
  tablet: {
    /* The form's tablet column: the rail opens at 200 and may reach 420, but the
       board keeps its 420 — which is why a tablet falls back to fullscreen before
       it lets the rail and the column squeeze the board. */
    rail: { collapsed: 72, min: 200, default: 200, max: 420, preview: 288 },
    panel: { min: 280, default: 420, max: 420 },
    boardMin: 420,
  },
  /* Below 700 there is no group at all: one sheet over the page. The zeros are here
     only so the page can say so, never to be used. */
  mobile: {
    rail: { collapsed: 0, min: 0, default: 0, max: 0, preview: 0 },
    panel: { min: 0, default: 0, max: 0 },
    boardMin: 0,
  },
} as const satisfies Record<Device, DeviceRules>;

/** The window edge a hidden rail is reachable from. */
export const RAIL_EDGE_ZONE = 8;

/** Magnetic stops shared by both edges: within this many px the width sticks. */
export const SNAP_TOLERANCE = 10;

/** How much of the pointer's travel a drag takes. */
export const DRAG_DAMPING = 0.6;

/** A press becomes a drag only after this much travel — otherwise it is a click. */
export const DRAG_SLOP = { rail: 3, panel: 6 } as const;

/** Sash keyboard steps. */
export const KEY_STEP = { base: 8, shift: 32 } as const;

export const MOBILE_MAX_VIEWPORT = 700;
export const TABLET_MAX_VIEWPORT = 1023;

/**
 * Which column of the form this viewport is in.
 *
 * 700-1023 is tablet even though the app's own `lg:` breakpoint is 1024: the
 * form put 700-767 with tablet, because that is where the rail can still be a
 * column and the board still needs its floor.
 */
export const deviceFor = (viewport: number): Device => {
  if (viewport < MOBILE_MAX_VIEWPORT) return "mobile";
  if (viewport <= TABLET_MAX_VIEWPORT) return "tablet";

  return "desktop";
};

/**
 * Where the spike is expected to disagree with the app, and why. The page shows
 * these as "pending", never as passes: a spike that reports green while the app
 * still clamps at 240 would be lying about the thing it was built to test.
 */
export const SPIKE_DELTAS = [
  {
    rule: "C1",
    what: "Desktop rail minimum",
    spike: "200",
    app: "RAIL.MIN = 240",
  },
  {
    rule: "B3",
    what: "Preview width below 1024",
    spike: "288",
    app: "TABLET_RAIL_PREVIEW = 240",
  },
  {
    rule: "E6",
    what: "Tablet rail maximum",
    spike: "420",
    app: "TABLET.RAIL_MAX = 200",
  },
  {
    rule: "E7",
    what: "Panel default",
    spike: "on at 1024+ only",
    app: 'RIGHT_PANEL_DEFAULT = "panel" everywhere',
  },
] as const;

/** A ceiling the column may reach beside the board, never past it. */
export const panelCeilingFor = (
  viewport: number,
  railWidth: number,
  boardMin: number,
): number => Math.max(0, viewport - railWidth - boardMin);

/** Everything the rail leaves: the column's "remaining" level. */
export const panelRemainingFor = (
  viewport: number,
  railWidth: number,
): number => Math.max(0, viewport - railWidth);
