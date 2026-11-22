import { useRef, useState } from "react";

import { cn } from "@/utils/cn";

import { Tooltip } from "@/components/Tooltips/ToolTip";

import { RAIL, clampWidth, snapZone } from "@/features/dashboard";

interface RailResizeHandleProps {
  /** The width on screen right now — which is not always the stored width. */
  renderedWidth: number;
  /** Stored width, for the aria value. */
  width: number;
  onWidth: (width: number) => void;
  /** The drag went below MID: snap to the icon rail. */
  onCollapse: () => void;
  /** Double-click while collapsed: come back out at the default width. */
  onExpand: () => void;
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
  onCollapse,
  onExpand,
  onHide,
  onResizeStart,
  onResizeEnd,
}: RailResizeHandleProps) {
  const [dragging, setDragging] = useState(false);
  /** The drag is under MID, so the rail is sitting collapsed. */
  const [belowMid, setBelowMid] = useState(false);

  const startX = useRef(0);
  const startWidth = useRef(0);

  const atLimit = dragging && (width === RAIL.MID || width === RAIL.MAX);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    /* The rail itself is a click target while collapsed (click it to expand),
       and this handle lives inside it. Without stopping here, the click that
       ends a drag bubbles up to the rail — which by then is collapsed, so it
       expands again: the divider appears to bounce back. */
    event.stopPropagation();

    if (event.button !== 0) return;

    /* Start from what is on screen. In hover mode that is MIN while the stored
       width is larger, and grabbing the divider must not make it jump. */
    startX.current = event.clientX;
    startWidth.current = clampWidth(renderedWidth || width);

    event.currentTarget.setPointerCapture(event.pointerId);
    onResizeStart(startWidth.current);
    setDragging(true);
    setBelowMid(false);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;

    const travel = (event.clientX - startX.current) * RAIL.DRAG_DAMPING;
    const raw = startWidth.current + travel;
    const zone = snapZone(raw);

    /* The rail snaps instead of sliding: below MID it collapses to the icon
       rail, and a deliberate pull past that takes it off the page. Only the
       expanded range stores a width. */
    if (zone === "hidden") {
      setDragging(false);
      setBelowMid(false);
      onHide();
      onResizeEnd();
      return;
    }

    if (zone === "collapsed") {
      setBelowMid(true);
      onCollapse();
      return;
    }

    setBelowMid(false);

    /* Coming out of collapsed or hover: the first move into the expanded range
       is what promotes the rail, so the drag and the mode change together. */
    if (renderedWidth <= RAIL.MIN) onExpand();

    onWidth(clampWidth(raw));
  };

  const endDrag = () => {
    if (!dragging) return;

    setDragging(false);
    setBelowMid(false);
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
            ? RAIL.MID
            : event.key === "End"
              ? RAIL.MAX
              : null;

    if (next === null) return;

    event.preventDefault();
    onWidth(clampWidth(next));
  };

  /* Collapsed, the divider is the only way back out by pointer — so it says so,
     and it opens on a double-click. A single click does nothing: it is far too
     easy to hit the border while aiming at the rail. */
  const isCollapsed = renderedWidth <= RAIL.MIN;

  return (
    /* The positioning lives on the tooltip's anchor, and the button fills it, so
       the bubble is anchored to the divider itself. `disabled` while dragging:
       a tooltip appearing mid-drag is noise. */
    <Tooltip
      label={
        isCollapsed
          ? "Double-click to expand"
          : "Drag to resize"
      }
      side="right"
      shape="solid"
      size="md"
      gap={8}
      disabled={dragging}
      /* `rail-handle` is what `components.css` targets to take the divider off
         the page while a dialog is open — the anchor and the bubble with it. */
      className="rail-handle absolute inset-y-0 right-0 z-50 w-4 translate-x-1/2"
    >
      <button
        type="button"
        role="separator"
        aria-orientation="vertical"
        aria-controls="app-rail"
        aria-label={isCollapsed ? "Expand sidebar" : "Resize sidebar"}
        aria-valuemin={RAIL.MID}
        aria-valuemax={RAIL.MAX}
        aria-valuenow={width}
        aria-valuetext={`${width} pixels`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        /* Belt and braces: a click can be synthesised even when the pointer
           moved, and it must not reach the rail's own click-to-expand. */
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={() => {
          /* Collapsed → come back out at the default width. Expanded → reset to
             it. A single click deliberately does nothing. */
          if (isCollapsed) onExpand();
          onWidth(RAIL.DEFAULT);
        }}
        onKeyDown={onKeyDown}
        /* Inline, not a utility: `base.css` sets `cursor: pointer` on `button`
           unlayered, and unlayered CSS beats every Tailwind `@layer utilities`
           class regardless of specificity. Without this the divider shows a hand. */
        style={{ cursor: "col-resize" }}
        className={cn(
          "h-full w-full cursor-col-resize touch-none border-0 bg-transparent p-0",
          "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2",
          "after:bg-transparent after:transition-colors",
          "hover:after:bg-(--link) focus-visible:after:bg-(--link)",
          (atLimit || belowMid) && "after:bg-(--warning)",
        )}
      />
    </Tooltip>
  );
}
