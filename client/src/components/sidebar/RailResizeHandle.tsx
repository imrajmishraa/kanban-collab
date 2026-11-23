import { useEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";

import { Tooltip } from "@/components/Tooltips/ToolTip";

import { RAIL, clampWidth, snapWidth, snapZone } from "@/features/dashboard";
import { couple } from "@/lib/panelCouple";

interface RailResizeHandleProps {
  /** The width on screen right now — which is not always the stored width. */
  renderedWidth: number;
  /** Stored width, for the aria value. */
  width: number;
  onWidth: (width: number) => void;
  /**
   * The column's width while it is open, and a way to change it.
   *
   * Given these, the rail's drag is coupled: every pixel the rail takes is a pixel the
   * column gives up. Omitted (column closed) and the rail is on its own.
   */
  panelWidth?: number;
  onPanelWidth?: (width: number) => void;
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
  panelWidth,
  onPanelWidth,
  onWidth,
  onCollapse,
  onExpand,
  onHide,
  onResizeStart,
  onResizeEnd,
}: RailResizeHandleProps) {
  /** Pointer is down on the divider. */
  const [dragging, setDragging] = useState(false);
  /** The pointer has actually travelled: this is a drag, not a click. */
  const [moving, setMoving] = useState(false);
  /** The drag is under MID, so the rail is sitting collapsed. */
  const [belowMid, setBelowMid] = useState(false);

  const startX = useRef(0);
  /** The column's width when this drag began — the pair the coupling keeps constant. */
  const startPanelWidth = useRef<number | null>(null);
  const startWidth = useRef(0);

  /*
   * Amber means "you are sitting on a stop".
   *
   * All four count — MAX, DEFAULT, MID and the collapsed icon rail — because they
   * are the places a drag can come to rest, and the line is the only feedback that
   * it has. It is not shown for the whole collapsed stretch, only on the stop
   * itself, so it does not flicker while the pointer is still moving.
   */
  const atStop =
    moving &&
    (belowMid ||
      width === RAIL.MIN ||
      width === RAIL.MIN ||
      width === RAIL.DEFAULT ||
      width === RAIL.MAX);

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
    startPanelWidth.current = panelWidth ?? null;

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    setMoving(false);
    setBelowMid(false);

    /*
     * Nothing else happens here, deliberately.
     *
     * This used to call `onResizeStart`, which sets `resizing` — and `resizing`
     * makes the rail render at the dragged width. A press that never moved
     * therefore flashed the rail open at the stored width and snapped it back on
     * release, which is what a single click on the border looked like. The drag
     * starts on the first pointer move instead.
     */
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;

    /* A few px of slop, so a click with a shaky hand is still a click. */
    if (!moving) {
      if (Math.abs(event.clientX - startX.current) < 3) return;

      setMoving(true);
      onResizeStart(startWidth.current);
    }

    const travel = (event.clientX - startX.current) * RAIL.DRAG_DAMPING;
    const raw = startWidth.current + travel;
    const zone = snapZone(raw);

    /* The rail snaps instead of sliding: below MID it collapses to the icon
       rail, and a deliberate pull past that takes it off the page. Only the
       expanded range stores a width. */
    if (zone === "hidden") {
      setDragging(false);
      setMoving(false);
      setBelowMid(false);
      onHide();
      onResizeEnd();
      return;
    }

    if (zone === "collapsed") {
      /*
       * Rebase the drag on the collapsed stop.
       *
       * Without this the hide target was unreachable: the origin stayed at the
       * width the drag began at, so pulling left was measured against e.g. 288
       * and MIN - HIDE_SLOP sat 300-odd px away — further than the pointer can
       * travel before it hits the edge of the screen. From here a further
       * HIDE_SLOP px of hand movement is exactly that.
       */
      if (!belowMid) {
        startX.current = event.clientX;
        startWidth.current = RAIL.MIN;
      }

      setBelowMid(true);
      onCollapse();
      return;
    }

    setBelowMid(false);

    /* Coming out of collapsed or hover: the first move into the expanded range
       is what promotes the rail, so the drag and the mode change together. */
    if (renderedWidth <= RAIL.COLLAPSED || belowMid) onExpand();

    /* Magnetic stops: MID, DEFAULT and MAX hold the width for SNAP_TOLERANCE px
       before it moves on, so the drag pauses at each one instead of sliding
       through. */
    const snapped = snapWidth(raw);

    if (startPanelWidth.current !== null && onPanelWidth) {
      const pair = couple({
        active: "rail",
        railWanted: snapped,
        panelWanted: startPanelWidth.current,
        viewport: window.innerWidth,
      });

      /*
       * Written when it differs from what is on screen — not from what the pointer asked
       * for.
       *
       * The guard used to compare `pair.rail` with `snapped`, and those are equal whenever
       * the column still has room to give: the write was skipped and the rail froze at
       * whatever width the column had pushed it to (240). Comparing against the *current*
       * width keeps the 2px jitter protection and lets the drag actually move.
       */
      const railNow = renderedWidth || width;
      const panelNow = panelWidth ?? startPanelWidth.current;

      if (Math.abs(pair.rail - railNow) >= 1) onWidth(pair.rail);
      if (Math.abs(pair.panel - panelNow) >= 2) onPanelWidth(pair.panel);

      return;
    }

    onWidth(snapped);
  };

  /**
   * Ends a drag — and treats a press that never moved as a click.
   *
   * `fromPointerUp` is a parameter rather than a check on the event because the same
   * handler is bound to `pointercancel`: a cancelled pointer (an OS gesture, a window
   * blur) must not put the rail away.
   */
  const endDrag = (fromPointerUp = false) => {
    if (!dragging) return;

    const wasMoving = moving;

    setDragging(false);
    setMoving(false);
    setBelowMid(false);

    if (wasMoving) {
      onResizeEnd();
      return;
    }

    /* A single click on the divider is "put it away" — the same place a long pull-left
       reaches, without the pull. */
    if (fromPointerUp) onHide();
  };

  /* A drag can end without a pointerup on this element — the rail can be hidden
     mid-gesture, the pointer can be cancelled. Either way the transient state has
     to be cleared, or the amber line stays on. The callback goes through a ref:
     it is an inline arrow in the parent, so a dependency on it would fire this
     cleanup on every render. */
  const endRef = useRef(onResizeEnd);

  useEffect(() => {
    endRef.current = onResizeEnd;
  }, [onResizeEnd]);

  useEffect(() => () => endRef.current(), []);

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

  /* Collapsed, the divider is the only way back out by pointer — so it says so,
     and it opens on a double-click. A single click does nothing: it is far too
     easy to hit the border while aiming at the rail. */
  const isCollapsed = renderedWidth <= RAIL.MIN;

  return (
    /* The positioning lives on the tooltip's anchor, and the button fills it, so
       the bubble is anchored to the divider itself. `disabled` while dragging:
       a tooltip appearing mid-drag is noise. */
    <Tooltip
      label={isCollapsed ? "Double-click to hide" : "Drag to resize"}
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
        aria-valuemin={RAIL.MIN}
        aria-valuemax={RAIL.MAX}
        aria-valuenow={width}
        aria-valuetext={`${width} pixels`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => endDrag(true)}
        onPointerCancel={() => endDrag()}
        /* Belt and braces: a click can be synthesised even when the pointer
           moved, and it must not reach the rail's own click-to-expand. */
        onClick={(event) => event.stopPropagation()}
        /* No double-click: with a single click closing the rail, the first click
           of a double-click has already done the closing. */
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
          atStop && "after:bg-(--warning)",
        )}
      />
    </Tooltip>
  );
}
