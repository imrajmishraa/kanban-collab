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
import {
  panelConfigByDevice,
  percentOf,
  type PanelDevice,
} from "@/lib/panelConfig";
import { useRightPanel } from "@/stores/rightPanel";

interface DashboardLayoutProps {
  /** Which column of the config this viewport is in. */
  device: PanelDevice;
  /** The workspace — board or page. Takes what the two edges leave. */
  children: ReactNode;
  /** Reported in pixels, for the spike's readout. */
  onSizes?: (sizes: { left: number; centre: number; right: number }) => void;
}

/**
 * The shell's three regions, in one resizable group.
 *
 *     DashboardLayout
 *     ├── LeftPanel        rail / MainSidebar   → Separator
 *     ├── WorkspaceLayout  board or page
 *     └── RightPanel                            → Separator
 *
 * Sizing is percentage-first (`lib/panelConfig`): the edges are a share of the
 * window with a pixel floor, the centre has no `defaultSize` and takes the rest.
 * That is what makes a laptop and a 4K monitor the same layout rather than two.
 *
 * The two edges are collapsed, not unmounted, when their store says hidden: a
 * collapsed panel keeps its width for the reopen, and a percentage of the group
 * is meaningless once the panel is gone from the DOM.
 */
export default function DashboardLayout({
  device,
  children,
  onSizes,
}: DashboardLayoutProps) {
  const config = panelConfigByDevice[device];

  const railMode = useSidebarState((state) => state.mode);
  const setRailWidth = useSidebarState((state) => state.setWidth);
  const panelMode = useRightPanel((state) => state.mode);
  const setPanelWidth = useRightPanel((state) => state.setWidth);

  const leftRef = usePanelRef();
  const rightRef = usePanelRef();
  const groupEl = useRef<HTMLDivElement | null>(null);

  /* Percentages, read once for the first paint. The centre is whatever is left,
     which is why the two edges carry a default and it does not. */
  const [defaultLayout] = useState<Layout>(() => {
    const left = percentOf(config.leftPanel.defaultSize);
    const right = percentOf(config.rightPanel.defaultSize);

    return {
      leftPanel: left,
      workspaceLayout: Math.max(0, 100 - left - right),
      rightPanel: right,
    };
  });

  const railVisible = railMode !== "hidden";
  const panelOpen = panelMode !== "off";

  /* The stores decide visibility; the group only knows sizes. */
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
   * Percentage in, pixels out.
   *
   * The components inside the panes read the stores for their own label
   * thresholds, so a percentage alone is not enough — and the write happens on a
   * settled layout, not on every frame, because a rail re-render mid-drag is what
   * makes a boundary stutter.
   */
  const report = useCallback(
    (layout: Layout) => {
      const width = groupEl.current?.clientWidth ?? 0;
      if (!width) return;

      const px = (id: string) => Math.round(((layout[id] ?? 0) / 100) * width);

      onSizes?.({
        left: px("leftPanel"),
        centre: px("workspaceLayout"),
        right: px("rightPanel"),
      });
    },
    [onSizes],
  );

  const onLayoutChanged = useCallback(
    (layout: Layout) => {
      report(layout);

      const width = groupEl.current?.clientWidth ?? 0;
      if (!width) return;

      const left = Math.round(((layout.leftPanel ?? 0) / 100) * width);
      const right = Math.round(((layout.rightPanel ?? 0) / 100) * width);

      if (railVisible && left > 0) setRailWidth(left);
      if (panelOpen && right > 0) setPanelWidth(right);
    },
    [panelOpen, railVisible, report, setPanelWidth, setRailWidth],
  );

  return (
    <div ref={groupEl} className="min-h-0 flex-1">
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
          minSize={config.leftPanel.minSize}
          maxSize={config.leftPanel.maxSize}
          collapsible={config.leftPanel.collapsible}
          collapsedSize={0}
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

        {/* Cursor, hairline and hover live in `styles/components.css` under
            `[data-separator]`: the library gives the element the separator role,
            the tab stop and the arrow keys itself, and this element accepts none
            of them as a prop. */}
        <Separator className="w-px shrink-0" />

        <Panel
          id="workspaceLayout"
          minSize={config.workspaceLayout.minSize}
          className="min-w-0"
        >
          {children}
        </Panel>

        {/* Cursor, hairline and hover live in `styles/components.css` under
            `[data-separator]`: the library gives the element the separator role,
            the tab stop and the arrow keys itself, and this element accepts none
            of them as a prop. */}
        <Separator className="w-px shrink-0" />

        <Panel
          id="rightPanel"
          panelRef={rightRef}
          defaultSize={config.rightPanel.defaultSize}
          minSize={config.rightPanel.minSize}
          maxSize={config.rightPanel.maxSize}
          collapsible={config.rightPanel.collapsible}
          collapsedSize={0}
          className="min-w-0"
        >
          <RightPanel
            appRailWidth={0}
            embedded
            onResizeStart={() => undefined}
            onResizeEnd={() => undefined}
          />
        </Panel>
      </Group>
    </div>
  );
}
