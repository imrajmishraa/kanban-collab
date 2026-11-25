import { PAGE_MIN } from "@/lib/layoutNumbers";

/**
 * Tablet rules — 700 to 1023.
 *
 * The tablet is the tight mode: three things want width and there is not much of it.
 *
 *     rail  <= 420      column >= 280      board >= 420
 *
 * At the rail's ceiling they do **not** all fit — and the rail is the one that gives,
 * stepping aside into a 72px strip that is one click away. That single fallback is the
 * whole difference from desktop; the rendering is the same.
 *
 * `280` is not arbitrary: `700 - 420 = 280`, the only column minimum at which a column fits
 * beside the board at the narrowest tablet. That is why there is no overlay mode.
 *
 * Nothing here runs above 1023 — desktop keeps its own numbers untouched.
 */
export const TABLET = {
  MIN_VIEWPORT: 700,
  MAX_VIEWPORT: 1023,
  RAIL_MIN: 72,
  /** E6: a tablet rail may reach the desktop ceiling; the strip is the fallback. */
  RAIL_MAX: 420,
  /** The width an *open* rail takes. Open is a width, not a mode name. */
  RAIL_DEFAULT: 200,
  PANEL_MIN: 280,
  PANEL_MAX: 420,
  PAGE_MIN: PAGE_MIN,
} as const;

export const isTablet = (viewport: number): boolean =>
  viewport >= TABLET.MIN_VIEWPORT && viewport <= TABLET.MAX_VIEWPORT;

/** The rail's own ceiling: what still leaves the board its 420. */
export const tabletRailCeiling = (viewport: number): number =>
  Math.min(TABLET.RAIL_MAX, Math.max(TABLET.RAIL_MIN, viewport - PAGE_MIN));

/** The widest the column may be beside the board. */
export const tabletPanelCeiling = (
  viewport: number,
  railReserve: number,
): number =>
  Math.min(
    TABLET.PANEL_MAX,
    Math.max(TABLET.PANEL_MIN, viewport - railReserve - PAGE_MIN),
  );

/** Everything the rail leaves — the column's `remaining`. */
export const tabletPanelRemaining = (
  viewport: number,
  railReserve: number,
): number => Math.max(TABLET.PANEL_MIN, viewport - railReserve);

/**
 * Do the three fit beside each other? If not, the rail steps aside.
 *
 * It steps aside — it is not hidden: the strip stays, and a click brings the rail back.
 */
export const tabletStepsAside = (
  viewport: number,
  railReserve: number,
  panelOpen: boolean,
): boolean => panelOpen && railReserve > 0 && !fits(viewport, railReserve);

const fits = (viewport: number, railReserve: number): boolean =>
  railReserve + TABLET.PANEL_MIN + PAGE_MIN <= viewport;

export interface TabletLayout {
  /** What the rail actually reserves after stepping aside: 0 when it is a strip. */
  railReserve: number;
  /** True when the rail is a 72px strip instead of a column. */
  railStrip: boolean;
  /** The width the column should render at. */
  reserved: number;
  ceiling: number;
  remaining: number;
}

export function tabletLayout({
  viewport,
  railReserve,
  panelOpen,
  panelLevel,
  panelWidth,
}: {
  viewport: number;
  railReserve: number;
  panelOpen: boolean;
  panelLevel: "normal" | "remaining" | "full";
  panelWidth: number;
}): TabletLayout {
  const railStrip = tabletStepsAside(viewport, railReserve, panelOpen);
  const effectiveRail = railStrip ? 0 : railReserve;

  const ceiling = tabletPanelCeiling(viewport, effectiveRail);
  const remaining = tabletPanelRemaining(viewport, effectiveRail);

  const reserved = !panelOpen
    ? 0
    : panelLevel === "full"
      ? viewport
      : panelLevel === "remaining"
        ? remaining
        : Math.min(ceiling, Math.max(TABLET.PANEL_MIN, Math.round(panelWidth)));

  return {
    railReserve: effectiveRail,
    railStrip,
    reserved,
    ceiling,
    remaining,
  };
}
