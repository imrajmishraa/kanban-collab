/**
 * The one drag rule, shared by both edges.
 *
 * The app rail and the right column are the same gesture on opposite sides: a divider
 * you drag to a width, with stops it comes to rest at and a warning colour on a stop.
 * Their *numbers* differ on purpose (`panelMetrics.ts`), but the feel must not.
 */
export const DRAG_START_SLOP = 3;

/**
 * How much of the pointer's travel the width follows.
 *
 * Below 1 the rails move slower than the cursor, which is what makes a drag feel smooth
 * rather than twitchy: a 1px hand tremor is no longer a 1px layout shift, and the stops are
 * easier to land on. Both edges use the same number — the rail and the column are the same
 * gesture, so they must not feel different.
 */
export const DRAG_DAMPING = 0.6;

/** The width a pointer at `clientX` is asking for, damped. */
export const dampedWidth = (
  startWidth: number,
  startX: number,
  clientX: number,
  direction: 1 | -1,
): number => startWidth + (clientX - startX) * DRAG_DAMPING * direction;

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
