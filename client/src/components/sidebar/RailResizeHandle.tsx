import { useRef, useState } from "react";

import { cn } from "@/utils/cn";

import { RAIL, clampWidth } from "@/features/dashboard";

interface RailResizeHandleProps {
  /** The width on screen right now — which is not always the stored width. */
  renderedWidth: number;
  /** Stored width, for the aria value. */
  width: number;
  onWidth: (width: number) => void;
  /** Pulling past the minimum means "get this out of my way". */
  onHide: () => void;
  /** Dragging from hover/collapsed promotes the rail to open. */
  onResizeStart: (fromWidth: number) => void;
  onResizeEnd: () => void;
}

/**
 * The rail's divider.
 *
 * A sibling of the rail's content, not a child of it: the rail clips its own
 * rows, and a handle hanging outside the rail's box would be clipped with them.
 *
 * Keyboard is not optional. This is the only way to change the width, so it has
 * to work without a pointer — `role="separator"` with live `aria-valuenow`, and
 * arrows for the same gesture a drag performs.
 */
export default function RailResizeHandle({
  renderedWidth,
  width,
  onWidth,
  onHide,
  onResizeStart,
  onResizeEnd,
}: RailResizeHandleProps) {
  const [dragging, setDragging] = useState(false);
  const [pastMin, setPastMin] = useState(false);

  const startX = useRef(0);
  const startWidth = useRef(0);

  const atLimit = dragging && (width === RAIL.MIN || width === RAIL.MAX);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;

    /* Start from what is on screen. In hover mode that is MIN while the stored
       width is larger, and grabbing the divider must not make it jump. */
    startX.current = event.clientX;
    startWidth.current = clampWidth(renderedWidth || width);

    event.currentTarget.setPointerCapture(event.pointerId);
    onResizeStart(startWidth.current);
    setDragging(true);
    setPastMin(false);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;

    const raw = startWidth.current + (event.clientX - startX.current);

    if (raw <= RAIL.MIN - RAIL.HIDE_SLOP) {
      setDragging(false);
      setPastMin(false);
      onHide();
      onResizeEnd();
      return;
    }

    setPastMin(raw < RAIL.MIN);
    onWidth(clampWidth(raw));
  };

  const endDrag = () => {
    if (!dragging) return;

    setDragging(false);
    setPastMin(false);
    onResizeEnd();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 32 : 8;

    const next =
      event.key === "ArrowRight"
        ? width + step
        : event.key === "ArrowLeft"
          ? width - step
          : event.key === "Home"
            ? RAIL.MIN
            : event.key === "End"
              ? RAIL.MAX
              : null;

    if (next === null) return;

    event.preventDefault();
    onWidth(clampWidth(next));
  };

  return (
    <button
      type="button"
      role="separator"
      aria-orientation="vertical"
      aria-controls="app-rail"
      aria-label="Resize sidebar"
      aria-valuemin={RAIL.MIN}
      aria-valuemax={RAIL.MAX}
      aria-valuenow={width}
      aria-valuetext={`${width} pixels`}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => onWidth(RAIL.DEFAULT)}
      onKeyDown={onKeyDown}
      /* Inline, not a utility: `base.css` sets `cursor: pointer` on `button`
         unlayered, and unlayered CSS beats every Tailwind `@layer utilities`
         class regardless of specificity. Without this the divider shows a hand. */
      style={{ cursor: "col-resize" }}
      className={cn(
        "absolute inset-y-0 right-0 z-50 w-4 translate-x-1/2",
        "cursor-col-resize touch-none border-0 bg-transparent p-0",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2",
        "after:bg-transparent after:transition-colors",
        "hover:after:bg-(--link) focus-visible:after:bg-(--link)",
        atLimit && "after:bg-(--warning)",
        pastMin && "after:bg-(--warning)",
      )}
    />
  );
}
