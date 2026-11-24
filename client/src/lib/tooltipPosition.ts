import type { Align, Side } from "@/components/Tooltips/types";

/**
 * The placement maths, as a pure function.
 *
 * It used to live inside a `useCallback` that read three DOM nodes, which meant none of it
 * could be tested. The rule itself is arithmetic: pick a side, put the bubble there, keep it
 * inside the viewport, and point the caret at the anchor's centre.
 */

export const MARGIN = 8;
export const DEFAULT_GAP = 8;

export interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface PlacementInput {
  anchor: Rect;
  bubble: Size;
  viewport: Size;
  /** The side the caller asked for, before the flip. */
  side: Side;
  align: Align;
  gap?: number;
  offset?: { x?: number; y?: number };
  /**
   * Sides to try after the preferred one, in the caller's order. Without this the roomiest
   * side wins — which is right by area and wrong by intent (a bubble that belongs above
   * should go below, not off to the right).
   */
  fallbackSides?: Side[];
  /** Clamp inside this box instead of the viewport — a modal, a scroll container. */
  boundary?: { top: number; left: number; width: number; height: number };
  /** Mirror `left` and `right` for a right-to-left page. */
  rtl?: boolean;
}

export interface Placement {
  side: Side;
  /** Where the bubble goes, before it is clamped. */
  top: number;
  left: number;
  /** The caret, as inline styles for the corner it sits on. */
  arrow: { top?: number; bottom?: number; left?: number; right?: number };
  /** True when the bubble could not be placed on the requested side. */
  flipped: boolean;
}

/** Space on each side of the anchor, inside the viewport. */
export function sideSpace(anchor: Rect, viewport: Size): Record<Side, number> {
  return {
    top: anchor.top,
    bottom: viewport.height - anchor.bottom,
    left: anchor.left,
    right: viewport.width - anchor.right,
  };
}

/**
 * Which side the bubble actually takes.
 *
 * The requested side wins unless it cannot fit the bubble plus the gap; then the side with
 * the most room takes over — not simply the opposite one, because "the opposite" can be the
 * tightest side of all.
 */
export function chooseSide(
  anchor: Rect,
  bubble: Size,
  viewport: Size,
  preferred: Side,
  gap = DEFAULT_GAP,
  fallbackSides: Side[] = [],
): { side: Side; flipped: boolean } {
  const space = sideSpace(anchor, viewport);

  /* Horizontal sides are measured against the bubble's width, vertical against its height. */
  const needed = (side: Side) =>
    (side === "top" || side === "bottom" ? bubble.height : bubble.width) + gap;

  /* The caller's order first: it knows what the bubble is about. */
  for (const side of [preferred, ...fallbackSides]) {
    if (space[side] >= needed(side)) {
      return { side, flipped: side !== preferred };
    }
  }

  /* Nothing the caller asked for fits: take the roomiest, by area of need. */
  const best = (Object.keys(space) as Side[]).reduce((a, b) =>
    space[b] > space[a] ? b : a,
  );

  return { side: best, flipped: best !== preferred };
}

/**
 * The caret, kept inside the bubble.
 *
 * `size - 12` rather than `size - 10`: the caret is 8px wide and rotated, so its corners
 * reach further than its box. Clamping to the last 10px put a corner outside a rounded
 * bubble and the tail looked torn.
 */
const CARET = 8;
const CARET_INSET = CARET / 2 + 4;

const clampCaret = (value: number, size: number) =>
  Math.min(
    Math.max(value, CARET_INSET),
    Math.max(size - CARET_INSET, CARET_INSET),
  );

export function computePlacement({
  anchor,
  bubble,
  viewport,
  side: preferred,
  align,
  gap = DEFAULT_GAP,
  offset = {},
  fallbackSides,
  boundary,
  rtl = false,
}: PlacementInput): Placement {
  const { side: chosen, flipped } = chooseSide(
    anchor,
    bubble,
    viewport,
    preferred,
    gap,
    fallbackSides,
  );

  /* On an RTL page the anchor's "left" is the reader's "right": mirror the side. */
  const side: Side = !rtl
    ? chosen
    : chosen === "left"
      ? "right"
      : chosen === "right"
        ? "left"
        : chosen;

  const cx = anchor.left + anchor.width / 2;
  const cy = anchor.top + anchor.height / 2;

  let top: number;
  let left: number;

  if (side === "bottom") {
    top = anchor.bottom + gap;
    left = cx - bubble.width / 2;
  } else if (side === "top") {
    top = anchor.top - bubble.height - gap;
    left = cx - bubble.width / 2;
  } else if (side === "right") {
    left = anchor.right + gap;
    top = cy - bubble.height / 2;
  } else {
    left = anchor.left - bubble.width - gap;
    top = cy - bubble.height / 2;
  }

  const startAlign = rtl ? "right" : "left";
  const endAlign = rtl ? "left" : "right";

  if (align === "left") left = anchor[startAlign];
  else if (align === "right") left = anchor[endAlign] - bubble.width;

  /* `offset` nudges after the side and the alignment are settled, so it cannot fight the
     flip: it is a fine-tune, not a placement. */
  left += offset.x ?? 0;
  top += offset.y ?? 0;

  /* Clamped inside the boundary — the viewport by default, a modal when one is given. */
  const box = boundary ?? { top: 0, left: 0, ...viewport };
  const minLeft = box.left + MARGIN;
  const minTop = box.top + MARGIN;
  const maxLeft = Math.max(
    box.left + box.width - bubble.width - MARGIN,
    minLeft,
  );
  const maxTop = Math.max(
    box.top + box.height - bubble.height - MARGIN,
    minTop,
  );

  left = Math.min(Math.max(left, minLeft), maxLeft);
  top = Math.min(Math.max(top, minTop), maxTop);

  const arrow: Placement["arrow"] =
    side === "bottom"
      ? { top: -4, left: clampCaret(cx - left - 4, bubble.width) }
      : side === "top"
        ? { bottom: -4, left: clampCaret(cx - left - 4, bubble.width) }
        : side === "right"
          ? { left: -4, top: clampCaret(cy - top - 4, bubble.height) }
          : { right: -4, top: clampCaret(cy - top - 4, bubble.height) };

  return { side, top, left, arrow, flipped };
}
