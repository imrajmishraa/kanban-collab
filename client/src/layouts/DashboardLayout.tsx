import {
  useCallback,
  useEffect,
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
import { panelConfigByDevice, type PanelDevice } from "@/lib/panelConfig";
import { useRightPanel } from "@/stores/rightPanel";
import { useLayoutShellStore } from "@/layouts/stores/layoutShellStore";

interface DashboardLayoutProps {
  /** Which column of the config this viewport is in. */
  device: PanelDevice;
  /** The workspace — board or page. Takes what the two edges leave. */
  children: ReactNode;
  /**
   * Optional pixel sizes callback (spike readout). Prefer the shell store;
   * this is kept for callers that still pass onSizes.
   */
  onSizes?: (sizes: { left: number; centre: number; right: number }) => void;
}

/**
 * The shell's three regions, in one resizable group.
 *
 *     DashboardLayout
 *     ├── leftPanel     rail / DashboardSidebar
 *     ├── centreLayout  board or page
 *     └── rightPanel    RightPanel
 *
 * Visibility and persisted widths come from `sidebarState` + `rightPanel`.
 * Pixel sizes, resize flag, and layout→store writes go through
 * `useLayoutShellStore`.
 */
export default function DashboardLayout({
  device,
  children,
  onSizes,
}: DashboardLayoutProps) {
  const config = panelConfigByDevice[device];

  const railMode = useSidebarState((state) => state.mode);
  const panelMode = useRightPanel((state) => state.mode);
  const level = useRightPanel((state) => state.level);

  const setDevice = useLayoutShellStore((s) => s.setDevice);
  const setResizing = useLayoutShellStore((s) => s.setResizing);
  const applyLayout = useLayoutShellStore((s) => s.applyLayout);
  const defaultLayoutFor = useLayoutShellStore((s) => s.defaultLayoutFor);
  const setSizes = useLayoutShellStore((s) => s.setSizes);
  const resizing = useLayoutShellStore((s) => s.resizing);
  const railWidth = useSidebarState((s) => s.width);

  const leftRef = usePanelRef();
  const workspaceRef = usePanelRef();
  const rightRef = usePanelRef();
  const groupEl = useRef<HTMLDivElement | null>(null);

  const railVisible = railMode !== "hidden";
  const panelOpen = panelMode !== "off";

  useEffect(() => {
    setDevice(device);
  }, [device, setDevice]);

  const [defaultLayout] = useState<Layout>(() =>
    defaultLayoutFor(device, panelOpen),
  );

  /* Stores decide visibility; the group only knows sizes. */
  useEffect(() => {
    const panel = leftRef.current;
    if (!panel) return;
    if (railVisible) panel.expand();
    else panel.collapse();
  }, [leftRef, railVisible]);

  useEffect(() => {
    const panel = rightRef.current;
    if (!panel) return;
    if (panelOpen) panel.expand();
    else panel.collapse();
  }, [panelOpen, rightRef]);

  /**
   * `remaining`: column takes everything the rail leaves — collapse the
   * workspace rather than leave a 1% board sliver.
   */
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;
    if (level === "remaining" && panelOpen) workspace.collapse();
    else workspace.expand();
  }, [level, panelOpen, workspaceRef]);

  /* ⌘⇧J — same gesture as AppLayout; safe on the spike (outside AppLayout). */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || !event.shiftKey || event.key.toLowerCase() !== "j") return;

      event.preventDefault();
      useLayoutShellStore.getState().toggleLevel();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
      applyLayout(layout as Record<string, number>, width);
    },
    [applyLayout, report],
  );

  const onPointerDownSeparator = useCallback(() => {
    setResizing(true);
  }, [setResizing]);

  const onPointerUpSeparator = useCallback(() => {
    setResizing(false);
    // Flush final pixel sizes into sidebar / rightPanel after the drag settles.
    const { sizes } = useLayoutShellStore.getState();
    if (railVisible && sizes.left > 0) {
      useSidebarState.getState().setWidth(sizes.left);
    }
    if (panelOpen && sizes.right > 0) {
      useRightPanel.getState().setWidth(sizes.right);
    }
  }, [panelOpen, railVisible, setResizing]);

  return (
    <div
      ref={groupEl}
      className="min-h-0 flex-1"
      data-resizing={resizing ? "true" : undefined}
    >
      <Group
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
          minSize={railVisible ? config.leftPanel.minSize : 0}
          maxSize={railVisible ? config.leftPanel.maxSize : "0%"}
          collapsible={config.leftPanel.collapsible}
          collapsedSize={config.leftPanel.collapsedSize}
          className="min-w-0"
        >
          <DashboardSidebar
            onToggle={() =>
              useSidebarState
                .getState()
                .setMode(railVisible ? "hidden" : "open")
            }
            embedded
          />
        </Panel>

        <Separator
          className="w-px shrink-0"
          onPointerDown={onPointerDownSeparator}
          onPointerUp={onPointerUpSeparator}
        />

        <Panel
          id="centreLayout"
          panelRef={workspaceRef}
          minSize={config.centreLayout.minSize}
          maxSize={panelOpen ? config.centreLayout.maxSize : "100%"}
          collapsible
          collapsedSize={0}
          className="min-w-0"
        >
          {children}
        </Panel>

        <Separator
          className="w-px shrink-0"
          onPointerDown={onPointerDownSeparator}
          onPointerUp={onPointerUpSeparator}
        />

        {/*
         * Keep the pane mounted; closed column is zero-wide.
         * Unmounting makes the group throw "Panel constraints not found"
         * when the panel is opened later.
         */}
        <Panel
          id="rightPanel"
          panelRef={rightRef}
          defaultSize={config.rightPanel.defaultSize}
          collapsible={config.rightPanel.collapsible}
          collapsedSize={config.rightPanel.collapsedSize}
          minSize={panelOpen ? config.rightPanel.minSize : 0}
          className="min-w-0"
        >
          <RightPanel
            appRailWidth={railWidth}
            embedded
            onResizeStart={() => setResizing(true)}
            onResizeEnd={() => setResizing(false)}
          />
        </Panel>
      </Group>
    </div>
  );
}
