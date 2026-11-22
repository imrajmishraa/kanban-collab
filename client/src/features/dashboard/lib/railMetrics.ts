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
  /** Collapsed icon rail — the lowest stop that still shows the nav. */
  MIN: 72,
  /** Narrowest *expanded* rail. A drag below this snaps to MIN. */
  MID: 240,
  /** First run, the double-click reset, and what hover opens at. */
  DEFAULT: 288,
  /** Widest. Past this the rail eats the board. */
  MAX: 420,
  /** Horizontal space the page needs beside the rail. */
  GUTTER: 329,
  /**
   * How far past MIN a drag must go before the rail leaves the page.
   *
   * Measured from MIN, and the drag origin is rebased when it collapses (see
   * the handle), so this is a real 32px pull past the icon rail rather than a
   * target that only exists if the whole drag started at MIN.
   */
  HIDE_SLOP: 32,
  /**
   * Magnetic stops: within this many px of a stop the width sticks to it, and
   * the pointer has to travel past the tolerance to move on. That is what makes
   * the rail pause at DEFAULT, MID and MAX instead of sliding through them.
   */
  SNAP_TOLERANCE: 10,
  /**
   * How much of the pointer's travel the divider takes.
   *
   * 1 is "the line stays under the cursor"; below 1 the rail moves less than the
   * pointer, which is what makes a 220px range feel controllable at speed. Tuned
   * down from 1 after the first hands-on pass — 0.6 makes it positively sticky.
   */
  DRAG_DAMPING: 0.75,
  /** Below this viewport the expanded rail is never shown. */
  MIN_VIEWPORT: 700,
} as const;

/**
 * A stored width is always an *expanded* width, so it lives between MID and MAX.
 * MIN is a mode, not a width the reader can store: below MID the rail is
 * collapsed, and collapsing is what the drag snaps to.
 */
export const clampWidth = (width: number): number =>
  Math.min(RAIL.MAX, Math.max(RAIL.MID, Math.round(width)));

export type RailZone = "expanded" | "collapsed" | "hidden";

/**
 * Where a drag at `rawWidth` should land.
 *
 * The rail has three stops and the drag snaps between them rather than sliding
 * continuously: MAX…MID is the expanded range, below MID it collapses to the
 * icon rail, and a deliberate pull past that takes it off the page.
 */
export function snapZone(rawWidth: number): RailZone {
  if (rawWidth < RAIL.MIN - RAIL.HIDE_SLOP) return "hidden";
  if (rawWidth < RAIL.MID) return "collapsed";

  return "expanded";
}

/** The widths a drag should come to rest at, narrowest first. */
export const RAIL_STOPS = [RAIL.MID, RAIL.DEFAULT, RAIL.MAX] as const;

/**
 * The width a drag at `rawWidth` should actually use.
 *
 * Within `SNAP_TOLERANCE` of a stop the width is pinned to it, so the rail comes
 * to rest at MID, DEFAULT and MAX and only moves on once the pointer has cleared
 * the magnet. Between stops it follows the pointer.
 */
export function snapWidth(
  rawWidth: number,
  tolerance: number = RAIL.SNAP_TOLERANCE,
): number {
  for (const stop of RAIL_STOPS) {
    if (Math.abs(rawWidth - stop) <= tolerance) return stop;
  }

  return clampWidth(rawWidth);
}

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
  /** A drag is in progress. The rail follows the pointer whatever the mode is. */
  resizing?: boolean;
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
 * `hover` opens to the stored width — the same width `open` shows — but it is an
 * overlay, so the page keeps reserving only the icon rail and never reflows.
 * Only a drag can take the rail down to MIN. `autoRail` wins over both `open`
 * and `hover`.
 */
export function computeRail({
  mode,
  width,
  hovering,
  viewportWidth,
  resizing = false,
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

  /*
   * While the divider is being dragged the width is the drag's business, not the
   * mode's.
   *
   * This is the fix for a bug that came back twice: dragging from `hover` left the
   * mode alone for a moment (or a hover timer re-set it), the rail kept rendering
   * as an overlay at the stored width, and the drag appeared to do nothing until
   * the pointer happened to be over the rail. A drag now renders the rail at the
   * width being dragged, in every mode, and reserves that width so the page
   * follows instead of sitting still.
   */
  if (resizing) railWidth = clamped;
  else if (hidden) railWidth = 0;
  else if (hoverOpen || expanded) railWidth = clamped;
  else railWidth = RAIL.MIN;

  /*
   * What the page reserves, and why it is not `railWidth` in hover mode.
   *
   * The hover rail is an overlay: it opens over the content instead of pushing
   * it. Reserving its open width would move the whole page every time the
   * pointer crossed the edge — which is what it used to do, because `reserved`
   * dropped from 72 to 0 the moment the pointer arrived. In hover mode the
   * layout is therefore pinned to the icon rail, and only the rail itself grows.
   */
  const reserved = resizing
    ? railWidth
    : mode === "hover"
      ? RAIL.MIN
      : railWidth;

  return {
    width: clamped,
    required,
    hidden,
    autoRail,
    hoverOpen,
    railWidth,
    reserved,
  };
}
