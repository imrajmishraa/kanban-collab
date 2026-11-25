import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  Group,
  Panel,
  Separator,
  usePanelRef,
  type Layout,
} from "react-resizable-panels";

import RightPanel from "@/components/layout/RightPanel";
import DashboardSidebar from "@/components/sidebar/DashboardSidebar";
import { useSidebarState } from "@/features/dashboard";
import {
  LAYOUT_DEFAULTS_PX,
  panelConfigByDevice,
  percentOf,
  type PanelDevice,
} from "@/lib/panelConfig";
import { useRightPanel } from "@/stores/rightPanel";
import { useLayoutShellStore } from "@/layouts/stores/layoutShellStore";

interface DashboardLayoutProps {
  device: PanelDevice;
  children: ReactNode;
  onSizes?: (sizes: { left: number; centre: number; right: number }) => void;
}

/**
 * Grok-style three-region shell — see Layout.md.
 *
 * Hide = collapse to 0 + hide separator (no icons, no empty pane).
 * Show = expand + resize to last stored open width.
 * Constraints stay stable; never persist width 0.
 */
export default function DashboardLayout({
  device,
  children,
  onSizes,
}: DashboardLayoutProps) {
  const config = panelConfigByDevice[device];

  const railMode = useSidebarState((s) => s.mode);
  const railWidth = useSidebarState((s) => s.width);
  const setRailWidth = useSidebarState((s) => s.setWidth);

  const panelMode = useRightPanel((s) => s.mode);
  const level = useRightPanel((s) => s.level);
  const setLevel = useRightPanel((s) => s.setLevel);
  const toggleLevel = useRightPanel((s) => s.toggleLevel);

  const setDevice = useLayoutShellStore((s) => s.setDevice);
  const setResizing = useLayoutShellStore((s) => s.setResizing);
  const setSizes = useLayoutShellStore((s) => s.setSizes);
  const resizing = useLayoutShellStore((s) => s.resizing);

  const leftRef = usePanelRef();
  const workspaceRef = usePanelRef();
  const rightRef = usePanelRef();
  const groupEl = useRef<HTMLDivElement | null>(null);

  const prevRailVisible = useRef<boolean | null>(null);
  const prevPanelOpen = useRef<boolean | null>(null);

  const railVisible = railMode !== "hidden";
  const panelOpen = panelMode !== "off";

  useEffect(() => {
    setDevice(device);
  }, [device, setDevice]);

  const [defaultLayout] = useState<Layout>(() => {
    const left = percentOf(config.leftPanel.defaultSize);
    const right = percentOf(config.rightPanel.defaultSize);
    const open = useRightPanel.getState().mode !== "off";
    const railOn = useSidebarState.getState().mode !== "hidden";

    return {
      leftPanel: railOn ? left : 0,
      centreLayout: Math.max(0, 100 - (railOn ? left : 0) - (open ? right : 0)),
      rightPanel: open ? right : 0,
    };
  });

  // ── Left: hide = 0; show = stored open width ─────────────────────
  useLayoutEffect(() => {
    const panel = leftRef.current;
    const groupWidth = groupEl.current?.clientWidth ?? 0;
    if (!panel) return;

    const was = prevRailVisible.current;
    prevRailVisible.current = railVisible;

    if (!railVisible) {
      panel.collapse();
      return;
    }

    panel.expand();

    const justOpened = was === false || was === null;
    if (!justOpened || groupWidth <= 0) return;

    /* Pixels, not a percentage: `resize()` reads a bare number as pixels and
       clamps to the panel's own min/max. Converting to a share first sent ~19px,
       which the collapsible panel resolved to `collapsedSize` — the rail came
       back at 0 after every close. */
    const stored = useSidebarState.getState().width || LAYOUT_DEFAULTS_PX.left;
    panel.resize(stored);
  }, [railVisible, leftRef]);

  // ── Right: closed = 0; open = stored width ───────────────────────
  useLayoutEffect(() => {
    const panel = rightRef.current;
    const groupWidth = groupEl.current?.clientWidth ?? 0;
    if (!panel) return;

    const was = prevPanelOpen.current;
    prevPanelOpen.current = panelOpen;

    if (!panelOpen) {
      panel.collapse();
      return;
    }

    panel.expand();

    const justOpened = was === false || was === null;
    if (!justOpened || groupWidth <= 0) return;

    /* Pixels, for the same reason as the rail: a share here arrives as a tiny
       pixel count and the collapsible panel collapses to 0. */
    const stored = useRightPanel.getState().width || LAYOUT_DEFAULTS_PX.right;
    panel.resize(stored);
  }, [panelOpen, rightRef]);

  // ── remaining: main yields ───────────────────────────────────────
  useLayoutEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    if (level === "remaining" && panelOpen) workspace.collapse();
    else workspace.expand();
  }, [level, panelOpen, workspaceRef]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || !event.shiftKey || event.key.toLowerCase() !== "j") return;
      event.preventDefault();
      if (!panelOpen) useRightPanel.getState().setMode("panel");
      toggleLevel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panelOpen, toggleLevel]);

  const report = useCallback(
    (layout: Layout) => {
      const width = groupEl.current?.clientWidth ?? 0;
      if (!width) return;

      const px = (id: string) => Math.round(((layout[id] ?? 0) / 100) * width);
      const next = {
        left: px("leftPanel"),
        centre: px("centreLayout"),
        right: px("rightPanel"),
      };
      setSizes(next);
      onSizes?.(next);
    },
    [onSizes, setSizes],
  );

  const onLayoutChanged = useCallback(
    (layout: Layout) => {
      report(layout);

      const width = groupEl.current?.clientWidth ?? 0;
      if (!width || resizing) return;

      const left = Math.round(((layout.leftPanel ?? 0) / 100) * width);
      const right = Math.round(((layout.rightPanel ?? 0) / 100) * width);

      // Layout.md: never persist collapsed 0 as open width
      if (railVisible && left >= config.leftPanel.minSize) {
        setRailWidth(left);
      }
      // A rail measured at 0 is hidden, whatever the store last said.
      if (railVisible && left <= 0) {
        useSidebarState.getState().setMode("hidden");
      }
      // Dragged shut: the pane is at 0, so the state has to say so.
      if (panelOpen && right < config.rightPanel.minSize) {
        useRightPanel.getState().setMode("off");
      }

      if (level !== "normal" || !panelOpen) return;

      const rightShare = layout.rightPanel ?? 0;
      const pastRight = rightShare > percentOf(config.rightPanel.maxSize) + 0.5;
      if (pastRight) setLevel("remaining");
    },
    [
      config.leftPanel.minSize,
      config.rightPanel.maxSize,
      config.rightPanel.minSize,
      level,
      panelOpen,
      railVisible,
      report,
      resizing,
      setLevel,
      setRailWidth,
    ],
  );

  return (
    <div
      ref={groupEl}
      className="min-h-0 flex-1"
      data-resizing={resizing ? "true" : undefined}
    >
      <Group
        id="dashboard-shell"
        orientation="horizontal"
        className="h-full"
        defaultLayout={defaultLayout}
        onLayoutChange={report}
        onLayoutChanged={onLayoutChanged}
      >
        <Panel
          id="leftPanel"
          panelRef={leftRef}
          defaultSize={config.leftPanel.defaultSize}
          minSize={config.leftPanel.minSize}
          maxSize={config.leftPanel.maxSize}
          collapsible
          collapsedSize={0}
          className="min-w-0 overflow-hidden"
        >
          {railVisible ? (
            <DashboardSidebar
              onToggle={() =>
                useSidebarState
                  .getState()
                  .setMode(railVisible ? "hidden" : "open")
              }
              embedded
            />
          ) : null}
        </Panel>

        <Separator
          className={
            railVisible
              ? "w-px shrink-0"
              : "pointer-events-none w-0 shrink-0 overflow-hidden opacity-0"
          }
          disabled={!railVisible}
        />

        <Panel
          id="centreLayout"
          panelRef={workspaceRef}
          minSize={config.centreLayout.minSize}
          maxSize={"100%"}
          collapsible
          collapsedSize={0}
          className="min-w-0"
        >
          {children}
        </Panel>

        <Separator
          className={
            panelOpen
              ? "w-px shrink-0"
              : "pointer-events-none w-0 shrink-0 overflow-hidden opacity-0"
          }
          disabled={!panelOpen}
          onPointerDown={() => setResizing(true)}
          onPointerUp={() => setResizing(false)}
        />

        <Panel
          id="rightPanel"
          panelRef={rightRef}
          defaultSize={config.rightPanel.defaultSize}
          minSize={config.rightPanel.minSize}
          maxSize={config.rightPanel.maxSize}
          collapsible
          collapsedSize={0}
          className="min-w-0 overflow-hidden"
        >
          {panelOpen ? (
            <RightPanel
              appRailWidth={railWidth}
              embedded
              onResizeStart={() => setResizing(true)}
              onResizeEnd={() => setResizing(false)}
            />
          ) : null}
        </Panel>
      </Group>
    </div>
  );
}
