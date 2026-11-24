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
): { side: Side; flipped: boolean } {
  const space = sideSpace(anchor, viewport);

  /* Horizontal sides are measured against the bubble's width, vertical against its height. */
  const needed = (side: Side) =>
    (side === "top" || side === "bottom" ? bubble.height : bubble.width) + gap;

  if (space[preferred] >= needed(preferred)) {
    return { side: preferred, flipped: false };
  }

  const best = (Object.keys(space) as Side[]).reduce((a, b) =>
    space[b] > space[a] ? b : a,
  );

  return { side: best, flipped: best !== preferred };
}

const clampCaret = (value: number, size: number) =>
  Math.min(Math.max(value, 2), Math.max(size - 10, 2));

export function computePlacement({
  anchor,
  bubble,
  viewport,
  side: preferred,
  align,
  gap = DEFAULT_GAP,
  offset = {},
}: PlacementInput): Placement {
  const { side, flipped } = chooseSide(
    anchor,
    bubble,
    viewport,
    preferred,
    gap,
  );

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

  if (align === "left") left = anchor.left;
  else if (align === "right") left = anchor.right - bubble.width;

  /* `offset` nudges after the side and the alignment are settled, so it cannot fight the
     flip: it is a fine-tune, not a placement. */
  left += offset.x ?? 0;
  top += offset.y ?? 0;

  left = Math.min(
    Math.max(left, MARGIN),
    Math.max(viewport.width - bubble.width - MARGIN, MARGIN),
  );
  top = Math.min(
    Math.max(top, MARGIN),
    Math.max(viewport.height - bubble.height - MARGIN, MARGIN),
  );

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
