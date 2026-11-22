/**
 * The rail's numbers, in one place.
 *
 * The rail used to be two fixed Tailwind classes (`w-64` / `w-18`). Once it is
 * draggable the width is data, so it lives here: one module every surface reads,
 * instead of a magic `256` in a class name and another in a margin.
 *
 * The constants are the ones the reference implementation settled on — a rail
 * narrower than 200px cannot show a label, wider than 420px stops being a rail
 * and starts being a column.
 */
export const RAIL = {
  /** Narrowest expanded width. */
  MIN: 200,
  /** Widest. Past this the rail eats the board. */
  MAX: 420,
  /** First run, and the double-click reset. */
  DEFAULT: 288,
  /** Icons only — the old `w-18`. */
  ICON: 72,
  /** Horizontal space the page needs beside the rail. */
  GUTTER: 329,
  /** How far past MIN a drag must go before it means "hide". */
  HIDE_SLOP: 48,
  /** Below this viewport the expanded rail is never shown. */
  MIN_VIEWPORT: 700,
} as const;

export const clampWidth = (width: number): number =>
  Math.min(RAIL.MAX, Math.max(RAIL.MIN, Math.round(width)));

/**
 * The viewport width at which an expanded rail of `width` still leaves the page
 * enough room. The `700` floor short-circuits the narrow case: at MIN the rail
 * plus gutter is under 700, and refusing to show it there would be silly.
 */
export const requiredViewport = (width: number): number =>
  Math.max(RAIL.MIN_VIEWPORT, Math.ceil(clampWidth(width)) + RAIL.GUTTER);

export interface RailLayoutInput {
  mode: "open" | "collapsed" | "hover" | "hidden";
  width: number;
  hovering: boolean;
  viewportWidth: number;
}

export interface RailLayout {
  /** Clamped stored width. */
  width: number;
  required: number;
  hidden: boolean;
  /** The viewport cannot afford the expanded rail, so it falls back to icons. */
  autoRail: boolean;
  /** Hover mode, pointer inside: an overlay at MIN. */
  hoverOpen: boolean;
  /** What the rail actually renders at. 0 means "not on the page". */
  railWidth: number;
  /** What the page reserves beside it. Overlays reserve nothing. */
  reserved: number;
}

/**
 * The whole state machine, pure.
 *
 * `hover` opens to MIN and no wider, whatever width is stored: it is a glance at
 * the nav, not a layout change. `autoRail` wins over both `open` and `hover`.
 */
export function computeRail({
  mode,
  width,
  hovering,
  viewportWidth,
}: RailLayoutInput): RailLayout {
  const clamped = clampWidth(width);
  const required = requiredViewport(clamped);
  const hidden = mode === "hidden";

  const autoRail = !(
    required === RAIL.MIN_VIEWPORT || viewportWidth > required
  );

  const hoverOpen = mode === "hover" && hovering && !autoRail;
  const expanded = mode === "open" && !autoRail;

  let railWidth: number;

  if (hidden) railWidth = 0;
  else if (hoverOpen) railWidth = RAIL.MIN;
  else if (expanded) railWidth = clamped;
  else railWidth = RAIL.ICON;

  return {
    width: clamped,
    required,
    hidden,
    autoRail,
    hoverOpen,
    railWidth,
    reserved: hoverOpen ? 0 : railWidth,
  };
}
