import { useEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CollapseIcon,
  ExpandIcon,
  LayoutRightIcon,
} from "@hugeicons/core-free-icons";

import { useRightPanel } from "@/stores/rightPanel";
import {
  PANEL,
  clampPanelWidth,
  computePanel,
  panelStops,
} from "@/components/layout/panelMetrics";
import { isOnStop, snapToStops } from "@/lib/railDrag";
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
  const maximized = useRightPanel((state) => state.maximized);
  const setMaximized = useRightPanel((state) => state.setMaximized);

  const [viewport, setViewport] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth,
  );
  const [dragging, setDragging] = useState(false);
  const [moving, setMoving] = useState(false);
  const [onStop, setOnStop] = useState(false);

  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth);

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const layout = computePanel({
    mode,
    width,
    maximized,
    viewport,
    appRailWidth,
  });

  const stops = panelStops(layout.ceiling);
  const panelWidth = layout.maximized ? viewport : layout.width;

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;

    startX.current = event.clientX;
    /* The rendered width, not the store: grabbing mid-transition must not jump. */
    startWidth.current = layout.maximized ? layout.ceiling : panelWidth;

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    setMoving(false);
    setOnStop(false);

    /* Grabbing a full-width column means "make it a column again". */
    if (layout.maximized) {
      setMaximized(false);
      setWidth(layout.ceiling);
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

    if (raw >= layout.ceiling + PANEL.FULL_SLOP) {
      setDragging(false);
      setMoving(false);
      setOnStop(false);
      setMaximized(true);
      onResizeEnd();
      return;
    }

    if (raw <= PANEL.MIN - PANEL.CLOSE_SLOP) {
      setDragging(false);
      setMoving(false);
      setOnStop(false);
      setMode("off");
      onResizeEnd();
      return;
    }

    const snapped = clampPanelWidth(snapToStops(raw, stops), layout.ceiling);

    setOnStop(isOnStop(snapped, stops));
    setWidth(snapped);
  };

  const endDrag = () => {
    if (!dragging) return;

    const wasMoving = moving;

    setDragging(false);
    setMoving(false);
    setOnStop(false);

    if (wasMoving) onResizeEnd();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 32 : 8;

    const next =
      event.key === "ArrowLeft"
        ? layout.width + step
        : event.key === "ArrowRight"
          ? layout.width - step
          : event.key === "Home"
            ? PANEL.MIN
            : event.key === "End"
              ? layout.ceiling
              : null;

    if (next === null) return;

    event.preventDefault();
    setMaximized(false);
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
        aria-valuenow={layout.width}
        aria-valuetext={`${layout.width} pixels`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => {
          setMaximized(false);
          setWidth(PANEL.DEFAULT);
        }}
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

        <div className="flex items-center gap-1">
          {/* Full width: everything the app rail leaves, never the rail itself. */}
          <Tooltip
            label={layout.maximized ? "Show less" : "Full width"}
            highlight={isMac ? "⌘⇧J" : "Ctrl⇧J"}
            side="bottom"
            shape="solid"
            size="md"
          >
            <button
              type="button"
              onClick={() => setMaximized(!layout.maximized)}
              aria-label={layout.maximized ? "Show less" : "Full width"}
              aria-pressed={layout.maximized}
              aria-keyshortcuts="Meta+Shift+J Control+Shift+J"
              className={cn(
                "grid size-8 place-items-center rounded-lg",
                "hover:bg-(--bg-hover) text-(--text-primary)",
                "focus-visible:outline-2 focus-visible:outline-(--brand)",
              )}
            >
              <HugeiconsIcon
                icon={layout.maximized ? CollapseIcon : ExpandIcon}
                size={18}
              />
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
                "grid size-8 place-items-center rounded-lg bg-(--bg-hover)",
                "text-(--text-primary) transition-colors hover:bg-(--bg-active)",
                "focus-visible:outline-2 focus-visible:outline-(--brand)",
              )}
            >
              <HugeiconsIcon icon={LayoutRightIcon} size={16} />
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
