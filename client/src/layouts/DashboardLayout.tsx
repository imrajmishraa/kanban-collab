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
 *     ├── centreLayout  board or page
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
  const level = useRightPanel((state) => state.level);
  const setLevel = useRightPanel((state) => state.setLevel);
  const toggleLevel = useRightPanel((state) => state.toggleLevel);

  const leftRef = usePanelRef();
  const workspaceRef = usePanelRef();
  const rightRef = usePanelRef();
  const groupEl = useRef<HTMLDivElement | null>(null);

  /*
   * Percentages, read once for the first paint. The centre is whatever is left,
   * which is why the two edges carry a default and it does not.
   *
   * A column that starts closed has no pane, so it gets no entry either — a layout
   * that describes a panel which is not rendered is a share of the group nobody
   * can account for.
   */
  const [defaultLayout] = useState<Layout>(() => {
    const left = percentOf(config.leftPanel.defaultSize);
    const right = percentOf(config.rightPanel.defaultSize);
    const open = panelMode !== "off";

    return {
      leftPanel: left,
      centreLayout: Math.max(0, 100 - left - (open ? right : 0)),
      rightPanel: open ? right : 0,
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
        centre: px("centreLayout"),
        right: px("rightPanel"),
      });
    },
    [onSizes],
  );

  /**
   * `remaining`: the column takes everything the rail leaves.
   *
   * Not a width — a state. The column stops sharing the group with the board and
   * takes `viewport - leftPanel` (the whole viewport when the rail is hidden),
   * which is why the workspace is collapsed rather than merely narrow. Leaving it
   * at 1% would keep a sliver of board on screen and call it a mode.
   */
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    if (level === "remaining" && panelOpen) workspace.collapse();
    else workspace.expand();
  }, [level, panelOpen, workspaceRef]);

  /* ⌘⇧J / Ctrl+Shift+J — the same gesture the app shell already binds. */
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

  const onLayoutChanged = useCallback(
    (layout: Layout) => {
      report(layout);

      const width = groupEl.current?.clientWidth ?? 0;
      if (!width) return;

      const left = Math.round(((layout.leftPanel ?? 0) / 100) * width);
      const right = Math.round(((layout.rightPanel ?? 0) / 100) * width);

      if (railVisible && left > 0) setRailWidth(left);
      if (panelOpen && right > 0) setPanelWidth(right);

      /*
       * Dragging past a ceiling means "give me the rest", not "stop here".
       *
       * The panels are allowed to overshoot their configured `maxSize` on purpose
       * — that is the gesture. Crossing it flips the layout into `remaining`, and
       * on a tablet either edge can make that call, because there the board is
       * the first thing to go when two panels fight over the width.
       */
      if (level !== "normal" || !panelOpen) return;

      const rightShare = layout.rightPanel ?? 0;
      const leftShare = layout.leftPanel ?? 0;
      const pastRight = rightShare > percentOf(config.rightPanel.maxSize) + 0.5;
      const pastLeft =
        device === "tablet" &&
        leftShare > percentOf(config.leftPanel.maxSize) + 0.5;

      if (pastRight || pastLeft) setLevel("remaining");
    },
    [
      config.leftPanel.maxSize,
      config.rightPanel.maxSize,
      device,
      level,
      panelOpen,
      report,
      setLevel,
      setPanelWidth,
      setRailWidth,
      railVisible,
    ],
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
          minSize={railVisible ? config.leftPanel.minSize : 0}
          maxSize={railVisible ? config.leftPanel.maxSize : "0%"}
          collapsedThreshold={9999} // drag se hide na ho — button/⌘B se ho

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

        {/* Cursor, hairline and hover live in `styles/components.css` under
            `[data-separator]`: the library gives the element the separator role,
            the tab stop and the arrow keys itself, and this element accepts none
            of them as a prop. */}
        <Separator className="w-px shrink-0" />

        {/* Collapsible only so `remaining` can take the board off the screen; the
            config says `collapsible: false` because no reader is meant to fold the
            centre by hand, and the group gives it back the moment the level is
            `normal` again. */}
        <Panel
          id="centreLayout"
          panelRef={workspaceRef}
          minSize={config.centreLayout.minSize}
          /* With the column closed the centre is the last thing on the right, so
             its own ceiling must not leave the strip of empty page the pane used
             to fill. */
          maxSize={panelOpen ? config.centreLayout.maxSize : "100%"}
          collapsible
          collapsedSize={0}
          className="min-w-0"
          defaultSize={"100%"}
        >
          {children}
        </Panel>

        {/* Cursor, hairline and hover live in `styles/components.css` under
            `[data-separator]`: the library gives the element the separator role,
            the tab stop and the arrow keys itself, and this element accepts none
            of them as a prop. */}
        <Separator className="w-px shrink-0" />

        {/*
         * The pane stays mounted; a closed column is *zero wide*.
         *
         * Unmounting it is what the group cannot take: it throws "Panel constraints
         * not found for Panel rightPanel" the first time a Panel appears after
         * mount, because the group registers constraints when it lays out, not when
         * a child arrives. A zero ceiling has no such problem, and it is the same
         * result — nothing on screen, nothing reserved.
         *
         * The library's own ceiling is 100% while open, not the config's 55%: the
         * config's number is the threshold that flips into `remaining`, and a hard
         * stop at 55% would make that gesture impossible.
         */}
        <Panel
          id="rightPanel"
          panelRef={rightRef}
          defaultSize={config.rightPanel.defaultSize}
          collapsible={config.rightPanel.collapsible}
          collapsedSize={config.rightPanel.collapsedSize}
          minSize={panelOpen ? 0 : config.rightPanel.minSize}
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
