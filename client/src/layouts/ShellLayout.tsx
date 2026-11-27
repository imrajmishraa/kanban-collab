import { useCallback, useMemo } from "react";
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
import { cancelClose, scheduleEnd, startPreview } from "@/layouts/railPreview";
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
   * The hover preview: a second sidebar outside the group, because a hidden rail is
   * a 0px pane and the pane's `overflow-hidden` would clip a preview inside it. The
   * timing (grace, cooldown, where to return to) lives in `railPreview.ts`, because the
   * navbar's icon starts a preview and the overlay ends it — two components, one
   * controller.
   */
  const hovering = useSidebarState((s) => s.hovering);
  /* A preview is the pointer, not a mode: the reader's mode is untouched. */
  const previewing = hovering;

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
    <div className="flex h-full min-h-0 flex-col">
      {/*
        One navbar for the whole shell, always, full width — the rail and the column
        are panes *below* it, so nothing has to offset itself against a rail width and
        no sticky wrapper can sit above the preview overlay. Its rail icon is the only
        way into the preview: no invisible edge strip, so nothing can open and close
        the rail by itself.
      */}
      <DashboardNavbar embedded />

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
              <div
                className="h-full"
                /* Collapsed, the strip itself is the trigger: 72px of sidebar is what
                 the pointer lands on, so the handler has to be on its wrapper. */
                onMouseEnter={state.railCollapsed ? startPreview : undefined}
                onMouseLeave={state.railCollapsed ? scheduleEnd : undefined}
              >
                <DashboardSidebar
                  onToggle={() =>
                    useSidebarState
                      .getState()
                      .setMode(state.railOpen ? "hidden" : "expanded")
                  }
                  embedded
                />
              </div>
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
                /* A click inside the preview pins what the reader is looking at. */
                useSidebarState.getState().openFromPreview();
              }}
              embedded
            />
          </div>
        )}
      </div>
    </div>
  );
}
