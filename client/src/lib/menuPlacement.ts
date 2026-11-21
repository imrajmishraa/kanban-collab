/**
 * Where a popup menu goes, given the button it belongs to.
 *
 * A menu rendered inside the feed is clipped by the feed's own `overflow-y-auto`
 * — the scroll container's bounds, not the window's, are what cut it off. That is
 * why the placement is computed here and the menu is portalled to `<body>`: the
 * only geometry that matters is the viewport, and that is knowable.
 *
 * Kept as a pure function so it can be tested without a DOM: the arithmetic is
 * where the bugs are, not the rendering.
 */

export interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface PlacementInput {
  /** The trigger's rect, from `getBoundingClientRect()`. */
  trigger: Rect;
  /** The menu's own size. */
  menu: Size;
  /** The viewport — `window.innerWidth` / `window.innerHeight`. */
  viewport: Size;
  /** Space between trigger and menu. Default 4. */
  gap?: number;
  /** Minimum distance to keep from the viewport edge. Default 8. */
  margin?: number;
}

export interface Placement {
  top: number;
  left: number;
  /** Which side of the trigger the menu ended up on. */
  side: "top" | "bottom";
  /** True when the menu had to be clamped to stay on screen. */
  clamped: boolean;
}

/**
 * Place a menu under its trigger, flipping above when there is no room below and
 * more room above, then clamping to the viewport.
 *
 * Flipping is decided by comparing the space on both sides rather than by a fixed
 * fraction of the window: a short panel (the phone sheet) and a full-height one
 * (the desktop panel) have different amounts of room for the same row, and the
 * old `bottom > innerHeight * 0.6` test was wrong for both.
 */
export function placeMenu({
  trigger,
  menu,
  viewport,
  gap = 4,
  margin = 8,
}: PlacementInput): Placement {
  const roomBelow = viewport.height - trigger.bottom - gap - margin;
  const roomAbove = trigger.top - gap - margin;

  const fitsBelow = menu.height <= roomBelow;
  const fitsAbove = menu.height <= roomAbove;

  /* Below by default; flip only when it does not fit and above is better. */
  const side: "top" | "bottom" =
    fitsBelow || (!fitsAbove && roomBelow >= roomAbove) ? "bottom" : "top";

  const rawTop =
    side === "bottom" ? trigger.bottom + gap : trigger.top - gap - menu.height;

  const maxTop = viewport.height - menu.height - margin;
  const top = Math.min(Math.max(rawTop, margin), Math.max(maxTop, margin));

  /* Right-aligned with the trigger, like the button it hangs from. */
  const rawLeft = trigger.right - menu.width;
  const maxLeft = viewport.width - menu.width - margin;
  const left = Math.min(Math.max(rawLeft, margin), Math.max(maxLeft, margin));

  return {
    top,
    left,
    side,
    clamped: top !== rawTop || left !== rawLeft,
  };
}

/** Rough height of a menu with `count` items, before it has been measured. */
export function estimateMenuHeight(count: number, itemHeight = 36): number {
  return count * itemHeight + 12;
}
