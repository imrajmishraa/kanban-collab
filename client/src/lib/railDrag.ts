/**
 * The one drag rule, shared by both edges.
 *
 * The app rail and the right column are the same gesture on opposite sides: a divider
 * you drag to a width, with stops it comes to rest at and a warning colour on a stop.
 * Their *numbers* differ on purpose (`panelMetrics.ts`), but the feel must not.
 */
export const DRAG_START_SLOP = 3;

export const isDragStart = (dx: number): boolean =>
  Math.abs(dx) >= DRAG_START_SLOP;

/**
 * Magnetic stops: within `tolerance` of a stop the width is pinned to it, so the rail
 * comes to rest at each one and moves on once the pointer clears the magnet.
 */
export function snapToStops(
  raw: number,
  stops: readonly number[],
  tolerance = 10,
): number {
  for (const stop of stops) {
    if (Math.abs(raw - stop) <= tolerance) return stop;
  }

  return raw;
}

/** True when `width` is sitting exactly on one of the stops. */
export const isOnStop = (width: number, stops: readonly number[]): boolean =>
  stops.some((stop) => Math.round(width) === Math.round(stop));
