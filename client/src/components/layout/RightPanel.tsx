import { useEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CollapseIcon,
  ExpandIcon,
  LayoutAlignRightIcon,
} from "@hugeicons/core-free-icons";

import { useRightPanel } from "@/stores/rightPanel";
import {
  PANEL,
  clampPanelWidth,
  computePanel,
  panelStops,
} from "@/components/layout/panelMetrics";
import { isOnStop, snapToStops } from "@/lib/railDrag";
import { resolveDrag } from "@/lib/panelDragZones";
import { useSidebarState } from "@/features/dashboard";
import { Tooltip } from "@/components/Tooltips/ToolTip";

/**
 * The right column.
 *
 * A place, not a feature: this is where the things you are working on will live — an
 * activity feed, a card, a board's details — so it starts as a room with the lights on
 * rather than being built around one of them. Each section arrives as its own PR.
 *
 * Its rules are **not** the app rail's, on purpose (`panelMetrics.ts`): the left rail
 * is navigation and can be 72px of icons, this is a work surface and cannot. So it
 * starts at 320, opens at 400, and a drag past 560 takes the whole window instead of
 * stopping there.
 *
 * Layout notes that are not obvious from the classes:
 *
 * - `inset-y-0`, not `top-14`: a column like the app rail, with its own `h-14` header,
 *   so the navbar stops at its edge (`lg:right-(--panel-width)`).
 * - `hidden lg:flex` is the whole tablet story: between 768 and 1023 the column is not
 *   shown, so it can never squeeze the board.
 * - `h-dvh`, never `100vh`: iOS's collapsing chrome would push the last row off.
 *
 * The header's two controls have different widths on purpose:
 *
 * - **At the panel's own width** the full-width control is a bare 32px square — an
 *   icon with no label, because "Full width" is a thing you learn once and the header
 *   has one job: not to look like a toolbar.
 * - **Full width** the same control becomes `icon + Show less`, because that is the
 *   state where a bare glyph is a guess: is it expand, restore, or close? The label
 *   is the only thing that distinguishes "back to my column" from "make it bigger".
 *
 * It cannot be `size-8` in both states: a grid cell of 32px stacks the icon over the
 * text and clips both. So the button is a flex row that is 32px wide with one child
 * and as wide as its content with two.
 */

interface RightPanelProps {
  /** What the app rail reserves, so this column can touch it but never cover it. */
  appRailWidth: number;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

export default function RightPanel({
  appRailWidth,
  onResizeStart,
  onResizeEnd,
}: RightPanelProps) {
  const mode = useRightPanel((state) => state.mode);
  const width = useRightPanel((state) => state.width);
  const setWidth = useRightPanel((state) => state.setWidth);
  const setMode = useRightPanel((state) => state.setMode);
  const level = useRightPanel((state) => state.level);
  const setLevel = useRightPanel((state) => state.setLevel);
  const toggleLevel = useRightPanel((state) => state.toggleLevel);

  const [viewport, setViewport] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth,
  );
  const [dragging, setDragging] = useState(false);
  const [moving, setMoving] = useState(false);
  const [onStop, setOnStop] = useState(false);

  const startX = useRef(0);
  const startWidth = useRef(0);
  const startRailWidth = useRef(appRailWidth);

  const railSetWidth = useSidebarState((state) => state.setWidth);
  const railSetMode = useSidebarState((state) => state.setMode);
  const railHide = useSidebarState((state) => state.hide);

  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth);

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const layout = computePanel({
    mode,
    level,
    width,
    viewport,
    appRailWidth,
  });

  const stops = panelStops(layout.ceiling);

  /* One number for everything: the column's width, the page's margin and the navbar's
     right edge all read `reserved`. Rendering the stored width while the page made room
     for `remaining` is what left a 700px hole. */
  const panelWidth = layout.reserved;

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;

    startX.current = event.clientX;
    /* What is actually on screen, not the stored width: grabbing a `remaining` column
       must not snap back to 420. */
    startWidth.current = panelWidth;
    /* The rail's width at this moment is the drag's reference for its own range. */
    startRailWidth.current = appRailWidth;

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    setMoving(false);
    setOnStop(false);

    /* Grabbing a `remaining` column means "make it a column again", starting from the
       ceiling so the first move is continuous. */
    if (level === "remaining") {
      setLevel("normal");
      setWidth(layout.ceiling);
      startWidth.current = layout.ceiling;
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;

    /* A drag starts on the first move: a click on the border does nothing. */
    if (!moving) {
      if (Math.abs(event.clientX - startX.current) < 3) return;

      setMoving(true);
      onResizeStart();
    }

    /* This is the left edge of a right-hand column: dragging left widens. */
    const raw = startWidth.current + (startX.current - event.clientX);

    const frame = resolveDrag({
      rawPanelWidth: raw,
      railWidth: appRailWidth,
      railStartWidth: startRailWidth.current,
      viewport,
      ceiling: layout.ceiling,
    });

    switch (frame.zone) {
      case "panel": {
        const snapped = clampPanelWidth(
          snapToStops(frame.panelWidth ?? raw, stops),
          layout.ceiling,
        );

        setLevel("normal");
        setOnStop(isOnStop(snapped, stops));
        setWidth(snapped);
        break;
      }

      case "panel-remaining": {
        /* Past MAX: everything the rail leaves, with the rail left alone. Fullscreen is
           a deliberate act, not a drag. */
        setOnStop(true);
        setLevel("remaining");
        break;
      }

      case "rail":
      case "rail-collapsed": {
        /* The column is at its minimum and the pointer has run into the rail: from here
           the rail's own rules apply — 420…240, then the 72px icon rail. */
        setLevel("normal");
        setOnStop(true);
        setWidth(PANEL.MIN);

        if (frame.railWidth !== null) {
          if (frame.zone === "rail-collapsed") railSetMode("collapsed");
          else railSetWidth(frame.railWidth);
        }
        break;
      }

      case "rail-hidden": {
        setLevel("normal");
        setOnStop(true);
        setWidth(PANEL.MIN);
        railHide();
        break;
      }
    }
  };

  /**
   * Ends a drag — and treats a press that never moved as a click.
   *
   * `fromPointerUp` is a parameter rather than a check on the event because the same
   * handler is bound to `pointercancel`: a cancelled pointer must not close the column.
   */
  const endDrag = (fromPointerUp = false) => {
    if (!dragging) return;

    const wasMoving = moving;

    setDragging(false);
    setMoving(false);
    setOnStop(false);

    if (wasMoving) {
      onResizeEnd();
      return;
    }

    /* A single click on the divider closes the column. */
    if (fromPointerUp) setMode("off");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 32 : 8;

    const next =
      event.key === "ArrowLeft"
        ? panelWidth + step
        : event.key === "ArrowRight"
          ? panelWidth - step
          : event.key === "Home"
            ? PANEL.MIN
            : event.key === "End"
              ? layout.ceiling
              : null;

    if (next === null) return;

    event.preventDefault();
    setLevel("normal");
    setWidth(clampPanelWidth(next, layout.ceiling));
  };

  if (layout.hidden) return null;

  return (
    <aside
      id="right-panel"
      aria-label="Panel"
      style={{ width: panelWidth }}
      className={cn(
        "fixed inset-y-0 right-0 z-30 hidden flex-col lg:flex",
        "h-dvh border-l border-(--hairline) bg-(--bg-root)",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      {/* The divider hangs off the panel's own left edge, outside its box: the
          column does not clip, so it needs no sibling in the layout. */}
      <button
        type="button"
        role="separator"
        aria-orientation="vertical"
        aria-controls="right-panel"
        aria-label="Resize panel"
        aria-valuemin={PANEL.MIN}
        aria-valuemax={layout.ceiling}
        aria-valuenow={Math.min(panelWidth, layout.ceiling)}
        aria-valuetext={`${Math.min(panelWidth, layout.ceiling)} pixels`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => endDrag(true)}
        onPointerCancel={() => endDrag()}
        /* No double-click: a single click already closes the column, so the first click
           of a double-click would take the divider away with it. `Home` still resets. */
        onKeyDown={onKeyDown}
        /* Inline: `base.css` sets `cursor: pointer` on `button` unlayered, and
           unlayered CSS beats every Tailwind `@layer utilities` class. */
        style={{ cursor: "col-resize" }}
        className={cn(
          "absolute inset-y-0 left-0 z-40 w-4 -translate-x-1/2",
          "touch-none border-0 bg-transparent p-0",
          "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2",
          "after:bg-transparent after:transition-colors",
          "hover:after:bg-(--link) focus-visible:after:bg-(--link)",
          onStop && "after:bg-(--warning)",
        )}
      />

      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-(--hairline) px-3">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)"></h2>

        <div className="flex shrink-0 items-center gap-1">
          {/* Full width: everything the app rail leaves, never the rail itself.
              Two shapes, one control: a bare square while the panel is a column,
              icon + label once it owns the window. */}
          <Tooltip
            label={level === "remaining" ? "Show page" : "Full width"}
            highlight={isMac ? "⌘⇧J" : "Ctrl⇧J"}
            side="bottom"
            shape="solid"
            size="md"
          >
            <button
              type="button"
              onClick={toggleLevel}
              aria-label={
                level === "remaining"
                  ? "Show the page"
                  : "Take the remaining width"
              }
              aria-pressed={level === "remaining"}
              aria-keyshortcuts="Meta+Shift+J Control+Shift+J"
              className={cn(
                /* `h-8` + `w-8`, never `size-8`: `size-*` sets both, and it would
                   fight the `px-*` that the labelled state needs. */
                "flex h-8 items-center justify-center rounded-lg",
                "text-(--text-primary) hover:bg-(--bg-hover)",
                "focus-visible:outline-2 focus-visible:outline-(--brand)",
                level === "remaining"
                  ? "gap-1.25 px-2.5 mr-1 border border-(--hairline) hover:border-(--hairline-strong)"
                  : "w-8",
              )}
            >
              <HugeiconsIcon
                icon={level === "remaining" ? CollapseIcon : ExpandIcon}
                size={level === "remaining" ? 16 : 18}
                strokeWidth={1.6}
              />

              {level === "remaining" && (
                <span className="whitespace-nowrap text-[12px] leading-none ">
                  Show page
                </span>
              )}
            </button>
          </Tooltip>

          {/* The same control that opens the panel, where the close button used to
              be: the icon is never a mystery. */}
          {level !== "remaining" && (
            <Tooltip
              label="Hide panel"
              highlight={isMac ? "⌘J" : "Ctrl J"}
              side="bottom"
              shape="solid"
              size="md"
            >
              <button
                type="button"
                onClick={() => setMode("off")}
                aria-label="Hide panel"
                aria-controls="right-panel"
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg bg-(--bg-hover)",
                  "text-(--text-primary) transition-colors hover:bg-(--bg-active)",
                  "focus-visible:outline-2 focus-visible:outline-(--brand)",
                )}
              >
                <HugeiconsIcon icon={LayoutAlignRightIcon} size={18} />
              </button>
            </Tooltip>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* The empty state is the panel's whole content for now, so it is centred
            rather than pinned to the top: a column of one line at the top reads as a
            loading failure, the same line in the middle reads as "nothing yet". */}
        <div className="flex h-full flex-col justify-center px-6 pb-10">
          <p className="text-[15px] leading-relaxed text-(--text-muted)">
            Open a board, a card, or an activity to see it here.
          </p>
        </div>
      </div>
    </aside>
  );
}
