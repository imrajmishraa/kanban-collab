import { useCallback, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";

import { Group, Panel, Separator, type Layout } from "react-resizable-panels";

import RightPanel from "@/components/layout/RightPanel";
import DashboardNavbar from "@/components/sidebar/DashboardNavbar";
import DashboardSidebar from "@/components/sidebar/DashboardSidebar";
import { RAIL, useSidebarState } from "@/features/dashboard";
import { MOBILE_MAX_VIEWPORT } from "@/components/layout/panelMetrics";
import { SHELL } from "@/lib/shellLayout";
import { useRightPanel } from "@/stores/rightPanel";
import { useLayoutShellStore } from "@/layouts/stores/layoutShellStore";
import { useShellLayout } from "@/layouts/useShellLayout";
import { useShellShortcuts } from "@/layouts/useShellShortcuts";
import { useViewportWidth } from "@/features/dashboard";

interface ShellLayoutProps {
  children: ReactNode;
  /** Optional: the measured pane sizes, for a readout or a test. */
  onSizes?: (sizes: { left: number; centre: number; right: number }) => void;
}

/**
 * Grok-style three-region shell — see Layout.md.
 *
 * The layout is not written here. `computeLayout` decides the three widths from
 * what the reader chose, and `useShellLayout` applies them in one
 * `Group.setLayout()`. Nothing in this file calls `expand()`, `resize()` or
 * `collapse()`, and nothing infers a mode from a measured width: those four
 * writers racing each other is what the brief's F1–F4 were.
 *
 * Constraints are constant and permissive (`minSize={0}`, `maxSize="100%"`) on
 * purpose. The library can then always satisfy a request, and the floors (200px
 * rail, 400px board, 320px column) are the model's rules rather than a constraint
 * it silently fails to meet.
 */
export default function ShellLayout({ children, onSizes }: ShellLayoutProps) {
  useShellShortcuts();

  const viewport = useViewportWidth();
  /* Below 700 the rail does not exist and the column is a full-screen sheet:
     the shell is not the layout for a phone, so the page gets the window. */
  const phone = viewport < MOBILE_MAX_VIEWPORT;

  const railMode = useSidebarState((s) => s.mode);
  const railPx = useSidebarState((s) => s.width);
  const panelMode = useRightPanel((s) => s.mode);
  const panelPx = useRightPanel((s) => s.width);
  const level = useRightPanel((s) => s.level);

  /*
   * The hover preview.
   *
   * A hidden rail is a 0px pane, so there is nothing to paint a preview inside:
   * the pane's `overflow-hidden` would clip it. The preview is therefore a second,
   * absolutely-positioned sidebar outside the group, and the pane stays 0 — the
   * board never moves for a glance, which is the whole point of a preview.
   *
   * The mode is borrowed for the duration: `hover` is what `computeRail` reads to
   * give the sidebar its 288px preview width. `origin` remembers what to put back,
   * because a preview can start from `hidden` (edge, logo) or from `collapsed`
   * (the icon strip) and each must return where it came from.
   */
  const previewing = railMode === "hover";
  const origin = useRef<"hidden" | "collapsed" | null>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const startPreview = useCallback(() => {
    const rail = useSidebarState.getState();
    if (rail.mode !== "hidden" && rail.mode !== "collapsed") return;

    cancelClose();
    origin.current = rail.mode;
    rail.setMode("hover");
    rail.setHovering(true);
  }, [cancelClose]);

  const endPreview = useCallback(() => {
    const rail = useSidebarState.getState();
    if (rail.mode !== "hover") return;

    rail.setMode(origin.current ?? "hidden");
    rail.setHovering(false);
    origin.current = null;
  }, []);

  /* A grace period, so the pointer can cross the gap between the edge or the
     logo and the overlay without the preview closing underneath it. */
  const scheduleEnd = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      endPreview();
    }, 140);
  }, [cancelClose, endPreview]);

  useEffect(() => cancelClose, [cancelClose]);

  const commit = useLayoutShellStore((s) => s.commit);
  const setGroupPx = useLayoutShellStore((s) => s.setGroupPx);
  const setResizing = useLayoutShellStore((s) => s.setResizing);
  const resizing = useLayoutShellStore((s) => s.resizing);

  const state = useMemo(
    () => ({
      railOpen: railMode !== "hidden",
      railCollapsed: railMode === "collapsed",
      railPx,
      columnOpen: panelMode !== "off",
      columnPx: panelPx,
      fullWidth: level === "remaining",
    }),
    [level, panelMode, panelPx, railMode, railPx],
  );

  /* The commands need the group's width; the readout needs the pane sizes. */
  const report = useCallback(
    (width: number) => setGroupPx(width),
    [setGroupPx],
  );

  const { groupRef, groupEl, onLayoutChanged, separatorProps, initial } =
    useShellLayout({ state, commit, onWidth: report });

  const onLayoutChange = useCallback(
    (layout: Layout) => {
      const width = groupEl.current?.clientWidth ?? 0;
      if (!width) return;

      const px = (id: string) => Math.round(((layout[id] ?? 0) / 100) * width);
      const next = {
        left: px("leftPanel"),
        centre: px("centreLayout"),
        right: px("rightPanel"),
      };

      onSizes?.(next);
    },
    [groupEl, onSizes],
  );

  if (phone) {
    return <div className="h-full min-h-0">{children}</div>;
  }

  return (
    <div
      ref={groupEl}
      className="relative min-h-0 flex-1"
      data-resizing={resizing ? "true" : undefined}
    >
      <Group
        id="dashboard-shell"
        orientation="horizontal"
        className="h-full"
        groupRef={groupRef}
        onLayoutChange={onLayoutChange}
        onLayoutChanged={onLayoutChanged}
      >
        <Panel
          id="leftPanel"
          defaultSize={initial.rail}
          minSize={0}
          maxSize={SHELL.left.max}
          collapsible
          collapsedSize={0}
          className="min-w-0 overflow-hidden"
        >
          {state.railOpen && !previewing ? (
            <DashboardSidebar
              onToggle={() =>
                useSidebarState
                  .getState()
                  .setMode(state.railOpen ? "hidden" : "open")
              }
              embedded
            />
          ) : null}
        </Panel>

        <Separator
          {...separatorProps("left")}
          onPointerDown={() => {
            separatorProps("left").onPointerDown();
            setResizing(true);
          }}
          onPointerUp={() => setResizing(false)}
          className={
            state.railOpen
              ? "w-px shrink-0"
              : "pointer-events-none w-0 shrink-0 overflow-hidden opacity-0"
          }
          disabled={!state.railOpen}
        />

        <Panel
          id="centreLayout"
          minSize={0}
          maxSize="100%"
          collapsible
          collapsedSize={0}
          className="min-w-0"
        >
          <main className="flex h-full flex-col overflow-y-auto scroll-smooth">
            {/* `sticky top-0` chrome sits under the iOS status bar without an inset. */}
            <div className="sticky top-0 z-50 bg-background pt-[env(safe-area-inset-top)]">
              <DashboardNavbar embedded />
            </div>

            <div className="flex-1">{children}</div>
          </main>
        </Panel>

        <Separator
          {...separatorProps("right")}
          onPointerDown={() => {
            separatorProps("right").onPointerDown();
            setResizing(true);
          }}
          onPointerUp={() => setResizing(false)}
          className={
            state.columnOpen
              ? "w-px shrink-0"
              : "pointer-events-none w-0 shrink-0 overflow-hidden opacity-0"
          }
          disabled={!state.columnOpen}
        />

        <Panel
          id="rightPanel"
          defaultSize={initial.column}
          minSize={0}
          maxSize="100%"
          collapsible
          collapsedSize={0}
          className="min-w-0 overflow-hidden"
        >
          {state.columnOpen ? (
            <RightPanel
              appRailWidth={state.railOpen ? railPx : 0}
              embedded
              onResizeStart={() => setResizing(true)}
              onResizeEnd={() => setResizing(false)}
            />
          ) : null}
        </Panel>
      </Group>

      {/* Hidden: the window's left edge is the only thing left to hover, so an
          invisible 8px strip opens the preview — the same gesture the app's own
          `RailEdgeHotZone` gives the old layout. */}
      {!state.railOpen && (
        <div
          aria-hidden="true"
          onMouseEnter={startPreview}
          onMouseLeave={scheduleEnd}
          className="absolute inset-y-0 left-0 z-30 w-2"
        />
      )}

      {/* Collapsed: the 72px strip is hoverable itself, and the overlay covers it. */}
      {state.railCollapsed && (
        <div
          aria-hidden="true"
          onMouseEnter={startPreview}
          onMouseLeave={scheduleEnd}
          className="absolute inset-y-0 left-0 z-30"
          style={{ width: RAIL.COLLAPSED }}
        />
      )}

      {previewing && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleEnd}
          className="absolute inset-y-0 left-0 z-40"
          style={{ width: RAIL.DEFAULT }}
        >
          <DashboardSidebar
            /* A click inside the preview pins what the reader is looking at. */
            onToggle={() => {
              useSidebarState.getState().openFromPreview();
              origin.current = null;
            }}
            embedded
          />
        </div>
      )}
    </div>
  );
}
