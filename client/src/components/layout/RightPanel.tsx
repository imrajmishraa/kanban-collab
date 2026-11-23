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
import { dampedWidth, snapToStops } from "@/lib/railDrag";
import { RAIL_MIN, besideMax, couple, panelDragLevel } from "@/lib/panelCouple";
import { useSidebarState } from "@/features/dashboard";
import { Tooltip } from "@/components/Tooltips/ToolTip";

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
  /* The rail is pushed by this drag, so the column needs its setter. */
  const railSetWidth = useSidebarState((state) => state.setWidth);

  const [dragging, setDragging] = useState(false);
  const [moving, setMoving] = useState(false);

  const startX = useRef(0);
  const startWidth = useRef(0);

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

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    setMoving(false);

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

    /* A drag starts on the first real move; 6px, so a shaky click is still a click. */
    if (!moving) {
      if (Math.abs(event.clientX - startX.current) < 6) return;

      setMoving(true);
      onResizeStart();
    }

    /* This is the left edge of a right-hand column: dragging left widens. */
    /* Damped: the column follows 60% of the pointer's travel, so the drag reads as smooth
       instead of twitchy. The same number the rail uses. */
    const raw = dampedWidth(
      startWidth.current,
      startX.current,
      event.clientX,
      -1,
    );

    /* The ladder: beside the board → `remaining` (board gone, rail kept) → `full`. */
    const next = panelDragLevel(raw, viewport, RAIL_MIN);

    if (next !== "normal") {
      setLevel(next);
      return;
    }

    /* The rail gives ground — down to its minimum, not down to where it happens to be. */
    const pair = couple({
      active: "panel",
      railWanted: appRailWidth,
      panelWanted: raw,
      viewport,
      railFloor: RAIL_MIN,
      panelFloor: PANEL.MIN,
    });

    /* Clamped to the column's own range: a ceiling from before the drag cut it back. */
    /* `PANEL.MAX` is a magnetic stop, not a ceiling: beside the board the column may reach
       `viewport - RAIL_MIN - PAGE_MIN` — 620 at 1280 — which is exactly where the rail hits
       its 240. */
    const beside = besideMax(viewport, RAIL_MIN);
    const snapped = Math.min(
      beside,
      Math.max(PANEL.MIN, snapToStops(pair.panel, stops)),
    );

    setLevel("normal");
    /* Amber means "resting on a stop" — the rail's floor is not one of them. */
    setWidth(snapped);

    /* Only a real push is written: frame jitter must not resize the rail. */
    if (Math.abs(pair.rail - appRailWidth) >= 2) railSetWidth(pair.rail);
  };

  /* Ends a drag — and treats a press that never moved as a click. `fromPointerUp` is a
     parameter because the same handler is bound to `pointercancel`. */
  /* Stable reference for the window listeners. */
  const endDragRef = useRef<(fromPointerUp?: boolean) => void>(() => {});

  const endDrag = (fromPointerUp = false) => {
    if (!dragging) return;

    const wasMoving = moving;

    setDragging(false);
    setMoving(false);
    delete document.body.dataset.dragging;

    if (wasMoving) {
      onResizeEnd();
      return;
    }

    /* A single click on the divider closes the column. */
    if (fromPointerUp) setMode("off");
  };

  /*
   * The drag must end even when the pointerup happens somewhere else — outside the window,
   * on another element, or after the capture was lost. Without this `dragging`, `moving` and
   * the drag state stayed set and the next hover moved the column,
   * because the handler still believed a drag was in progress.
   */
  /* Refreshed every render; the ref is the dependency-free channel. */
  useEffect(() => {
    endDragRef.current = endDrag;
  });

  useEffect(() => {
    if (!dragging) return;

    const stop = () => endDragRef.current();

    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);

    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("blur", stop);
    };
  }, [dragging]);

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
