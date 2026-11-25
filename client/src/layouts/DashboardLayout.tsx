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
  type PanelConfig,
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

/** A share of the group at or under this is closed, not narrow. */
const CLOSED_SHARE = 0.5;

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
 * A closed edge is *zero wide*, not merely empty: the pane is pinned to a `0%`
 * ceiling as well as collapsed imperatively, because a method call can be missed
 * and a zero ceiling cannot. Reopening restores the configured share.
 */
export default function DashboardLayout({
  device,
  children,
  onSizes,
}: DashboardLayoutProps) {
  const config = panelConfigByDevice[device];
  /* Annotated so `defaultSize` stays optional: the literal types from `satisfies`
     make the `??` fallback unreachable, and TS reads that branch as `never`. */
  const leftConfig: PanelConfig = config.leftPanel;
  const rightConfig: PanelConfig = config.rightPanel;

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

  /* Percentages, read once for the first paint. The centre is whatever is left,
     which is why the two edges carry a default and it does not. */
  const [defaultLayout] = useState<Layout>(() => {
    const left = percentOf(leftConfig.defaultSize);
    const right = percentOf(rightConfig.defaultSize);

    return {
      leftPanel: left,
      workspaceLayout: Math.max(0, 100 - left - right),
      rightPanel: right,
    };
  });

  const railVisible = railMode !== "hidden";
  const panelOpen = panelMode !== "off";

  /* Previous visibility, so a reopen can tell itself apart from a re-render. */
  const wasRailVisible = useRef(railVisible);
  const wasPanelOpen = useRef(panelOpen);

  /* The stores decide visibility; the group only knows sizes. */
  useEffect(() => {
    const panel = leftRef.current;
    if (!panel) return;

    if (railVisible) {
      /* Coming back from hidden, the rail opens at its configured share rather
         than at the zero it was collapsed to. */
      if (!wasRailVisible.current) {
        panel.expand();
        panel.resize(leftConfig.defaultSize ?? `${leftConfig.minSize}px`);
      }
    } else {
      panel.collapse();
    }

    wasRailVisible.current = railVisible;
  }, [leftConfig.defaultSize, leftConfig.minSize, leftRef, railVisible]);

  useEffect(() => {
    const panel = rightRef.current;
    if (!panel) return;

    if (panelOpen) {
      if (!wasPanelOpen.current) {
        panel.expand();
        panel.resize(rightConfig.defaultSize ?? `${rightConfig.minSize}px`);
      }
    } else {
      panel.collapse();
    }

    wasPanelOpen.current = panelOpen;
  }, [panelOpen, rightConfig.defaultSize, rightConfig.minSize, rightRef]);

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

  /*
   * The shortcuts the app shell binds, repeated here because this page renders
   * outside `AppLayout`: ⌘B opens/hides the rail, ⌘⇧J toggles `remaining`.
   *
   * ⌘B is the rail's second control, not a convenience: a drag stops at the
   * minimum by design, so the keyboard is how the rail leaves the page.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;

      const key = event.key.toLowerCase();

      if (key === "b" && !event.shiftKey) {
        event.preventDefault();
        useSidebarState.getState().setMode(railVisible ? "hidden" : "open");
        return;
      }

      if (key === "j" && !event.shiftKey) {
        event.preventDefault();
        useRightPanel.getState().setMode(panelMode !== "off" ? "off" : "panel");
        toggleLevel();
      }

      if (key === "j" && event.shiftKey) {
        event.preventDefault();
        if (!panelOpen) useRightPanel.getState().setMode("panel");
        toggleLevel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panelOpen, panelMode, railVisible, toggleLevel]);

  const onLayoutChanged = useCallback(
    (layout: Layout) => {
      report(layout);

      /*
       * The column's share, first: the store has to agree with the pane.
       *
       * Dragging the column to zero *is* closing it — otherwise it slid off screen
       * while `mode` still said `panel`, and the next render put it back. Half a
       * percent of tolerance, because a collapsed pane reports 0 and a hairline is
       * not "open".
       *
       * The rail is deliberately not treated this way: it leaves the screen on a
       * click or a shortcut, never on a drag.
       */
      const rightPct = layout.rightPanel ?? 0;

      if (rightPct <= CLOSED_SHARE && panelOpen) {
        useRightPanel.getState().setMode("off");
      } else if (rightPct > CLOSED_SHARE && !panelOpen) {
        useRightPanel.getState().setMode("panel");
      }

      const width = groupEl.current?.clientWidth ?? 0;
      if (!width) return;

      const left = Math.round(((layout.leftPanel ?? 0) / 100) * width);
      const right = Math.round((rightPct / 100) * width);

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

      const leftShare = layout.leftPanel ?? 0;
      const pastRight = rightPct > percentOf(rightConfig.maxSize) + 0.5;
      const pastLeft =
        device === "tablet" && leftShare > percentOf(leftConfig.maxSize) + 0.5;

      if (pastRight || pastLeft) setLevel("remaining");
    },
    [
      device,
      level,
      panelOpen,
      railVisible,
      report,
      rightConfig.maxSize,
      leftConfig.maxSize,
      setLevel,
      setPanelWidth,
      setRailWidth,
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
          defaultSize={leftConfig.defaultSize}
          /* A closed pane is pinned to zero here as well as collapsed
             imperatively: `collapse()` is a call that can be missed, a zero
             ceiling cannot. */
          minSize={railVisible ? leftConfig.minSize : 0}
          maxSize={railVisible ? leftConfig.maxSize : "0%"}
          collapsible={leftConfig.collapsible}
          collapsedSize={0}
          /* The rail leaves the screen on a click, the navbar button or ⌘B — never
             on a drag. A drag that can hide the navigation is a drag nobody can
             aim: pulling past the minimum should stop at the minimum. This is the
             distance past `minSize` that would collapse the panel, so it is set
             beyond any window; an explicit `collapse()` still works. */
          collapsedThreshold={9999}
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
          id="workspaceLayout"
          panelRef={workspaceRef}
          minSize={config.workspaceLayout.minSize}
          maxSize={config.workspaceLayout.maxSize}
          collapsible
          collapsedSize={0}
          className="min-w-0"
        >
          {children}
        </Panel>

        {/* Cursor, hairline and hover live in `styles/components.css` under
            `[data-separator]`: the library gives the element the separator role,
            the tab stop and the arrow keys itself, and this element accepts none
            of them as a prop. */}
        <Separator className="w-px shrink-0" />

        {/* Open: a 100% ceiling, so the overshoot that enters `remaining` is
            possible. Closed: zero, so the column is off the screen instead of an
            empty frame at its last width. */}
        <Panel
          id="rightPanel"
          panelRef={rightRef}
          defaultSize={rightConfig.defaultSize}
          minSize={panelOpen ? rightConfig.minSize : 0}
          maxSize={panelOpen ? "100%" : "0%"}
          collapsible={rightConfig.collapsible}
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
