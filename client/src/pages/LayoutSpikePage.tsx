import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Allotment, type AllotmentHandle } from "allotment";

import "allotment/dist/style.css";

import RightPanel from "@/components/layout/RightPanel";
import DashboardSidebar from "@/components/sidebar/DashboardSidebar";
import { NewWorkspaceDialogProvider } from "@/components/dashboard/workspace/create/NewWorkspaceDialogProvider";
import { useSidebarState } from "@/features/dashboard";
import {
  MOBILE_MAX_VIEWPORT,
  SPIKE,
  deviceFor,
  panelMaxFor,
  railMaxFor,
} from "@/lib/layoutRules";
import { useRightPanel } from "@/stores/rightPanel";

import { BoardPlaceholder } from "./layout-spike/BoardPlaceholder";
import { RuleReadout } from "./layout-spike/RuleReadout";
import { SpikeBar, type SpikeLevel } from "./layout-spike/SpikeBar";
import { attachSashKeys } from "./layout-spike/sashKeys";
import { useViewportWidth } from "./layout-spike/useViewportWidth";

/**
 * The Allotment spike.
 *
 * A dev-only page (`/layout-spike`) that runs the settled rail/panel rules
 * through `allotment@1.20.6` with the *real* `DashboardSidebar` and `RightPanel`
 * inside its panes — the same components `AppLayout` mounts, so what the panes
 * do to them is what the swap will do to the app.
 *
 * The rules this page exists to prove, as settled on 25/11:
 *
 *   1. the column's ceiling is `viewport - rail - 420` (board keeps its floor),
 *      or `viewport - 420` with the rail hidden;
 *   2. the two edges push each other: neither drag is capped while the other
 *      side has room to give;
 *   3. in a fullscreen layout the rail is not stuck at 420 — it pushes the
 *      column down to the column's own minimum instead;
 *   4. sashes work from the keyboard, because `allotment` ships no key handling.
 */
export default function LayoutSpikePage() {
  const viewport = useViewportWidth();
  const device = deviceFor(viewport);
  const rules = SPIKE[device];

  const railMode = useSidebarState((state) => state.mode);
  const railStored = useSidebarState((state) => state.width);
  const setRailWidth = useSidebarState((state) => state.setWidth);
  const setRailMode = useSidebarState((state) => state.setMode);

  const panelMode = useRightPanel((state) => state.mode);
  const panelStored = useRightPanel((state) => state.width);
  const setPanelWidth = useRightPanel((state) => state.setWidth);
  const setPanelMode = useRightPanel((state) => state.setMode);

  const [level, setLevel] = useState<SpikeLevel>("normal");
  const [showRules, setShowRules] = useState(true);

  const railVisible = railMode !== "hidden" && level !== "full";
  const panelOpen = panelMode !== "off";
  const boardVisible = level === "normal";

  const handle = useRef<AllotmentHandle>(null);
  const container = useRef<HTMLDivElement>(null);

  const [sizes, setSizes] = useState<number[]>(() => [
    Math.max(rules.rail.min, Math.min(rules.rail.max, railStored)),
    Math.max(rules.boardMin, viewport - railStored - panelStored),
    panelOpen ? Math.max(rules.panel.min, panelStored) : rules.panel.default,
  ]);

  /* `defaultSizes` is read once: feeding the live sizes back in would make every
     drag fight the state that produced it. */
  const [initialSizes] = useState(sizes);

  const railWidthNow = sizes[0] ?? 0;

  /* Rule 1. The board's floor is what the ceiling is made of. */
  const panelMax =
    level === "full"
      ? viewport
      : level === "remaining"
        ? Math.max(rules.panel.min, viewport - (railVisible ? railWidthNow : 0))
        : panelMaxFor(
            viewport,
            railVisible ? railWidthNow : 0,
            rules.boardMin,
            rules.panel.min,
          );

  /* Rule 3. With the column open the rail takes its width from the column. */
  const railMax = railMaxFor(
    viewport,
    rules.panel.min,
    rules.rail.min,
    rules.rail.max,
    panelOpen,
  );

  /* Memoised on the numbers themselves: the sash listeners re-attach on every
     size change, and a fresh array each render would also re-run them on renders
     that changed nothing. */
  const bounds = useMemo(
    () => [
      { min: rules.rail.min, max: railMax },
      { min: boardVisible ? rules.boardMin : 0, max: viewport },
      { min: rules.panel.min, max: panelMax },
    ],
    [
      boardVisible,
      panelMax,
      railMax,
      rules.boardMin,
      rules.panel.min,
      rules.rail.min,
      viewport,
    ],
  );

  /**
   * What the three panes should be, given the mode.
   *
   * Written from the stores rather than from `sizes` so the effect below has a
   * stable dependency list: deriving it from the live sizes would re-run on every
   * pointer move and fight the drag it is trying to describe.
   */
  const targetSizes = useCallback((): number[] => {
    const rail = Math.max(rules.rail.min, Math.min(rules.rail.max, railStored));

    if (level === "full") return [rail, 0, viewport];

    const panel = panelOpen
      ? Math.max(
          rules.panel.min,
          Math.min(panelStored, viewport - rules.boardMin),
        )
      : rules.panel.default;

    if (level === "remaining") {
      return [rail, 0, Math.max(rules.panel.min, viewport - rail)];
    }

    const visibleRail = railVisible ? rail : 0;
    const visiblePanel = panelOpen ? panel : 0;

    return [
      rail,
      Math.max(rules.boardMin, viewport - visibleRail - visiblePanel),
      panel,
    ];
  }, [
    level,
    panelOpen,
    panelStored,
    railStored,
    railVisible,
    rules.boardMin,
    rules.panel.default,
    rules.panel.min,
    rules.rail.max,
    rules.rail.min,
    viewport,
  ]);

  /**
   * The board has to come back.
   *
   * `visible={false}` on a pane removes it, but `allotment` keeps the widths it
   * last had — so closing both edges left the board sitting at its old size with
   * the rest of the window empty. Every mode change now hands the group an
   * explicit set of sizes instead of trusting the reflow.
   */
  useEffect(() => {
    /* `resize` is the external system; the sizes come back through `onChange`,
       so this effect never sets state itself. */
    handle.current?.resize(targetSizes());
  }, [targetSizes]);

  /* Rule 4. Re-attached whenever a size or a bound moves: the listeners close
     over `sizes`, so a stale pair would apply its delta to the wrong panes. */
  useEffect(() => {
    return attachSashKeys({
      root: container.current,
      handle: handle.current,
      sizes,
      bounds,
      onResize: setSizes,
    });
  }, [bounds, sizes]);

  const onChange = useCallback((next: number[]) => setSizes(next), []);

  /* The stores are written when the drag ends, not on every frame: each write
     re-renders the whole rail, and a rail re-render mid-drag is what made the
     boundary stutter. */
  const onDragEnd = useCallback(
    (next: number[]) => {
      const [rail, , panel] = next;

      if (railVisible && typeof rail === "number" && rail > 0) {
        setRailWidth(rail);
      }

      if (panelOpen && typeof panel === "number" && panel > 0) {
        setPanelWidth(panel);
      }
    },
    [panelOpen, railVisible, setPanelWidth, setRailWidth],
  );

  const changeLevel = (next: SpikeLevel) => {
    setLevel(next);

    /* Fullscreen means the rail is off the page; coming back to `normal` has to
       put it back, or the button would be a one-way door. */
    if (next === "full") setRailMode("hidden");
    else if (railMode === "hidden") setRailMode("open");
  };

  if (device === "mobile") {
    return (
      <p className="grid h-dvh place-items-center bg-(--bg-root) p-6 text-center text-(--text-primary)">
        Below {MOBILE_MAX_VIEWPORT}px there is no Allotment group — the panel is
        the full-screen sheet and the rail does not exist.
      </p>
    );
  }

  return (
    /* `DashboardSidebar` reaches `MobileSidebar` -> `MobileWorkspaceSwitch`, which
       reads the new-workspace dialog context. `AppLayout` is the only other host of
       that provider, and this page deliberately renders outside it. */
    <NewWorkspaceDialogProvider>
      <div className="flex h-dvh flex-col bg-(--bg-root) text-(--text-primary)">
        <SpikeBar
          device={device}
          viewport={viewport}
          sizes={sizes}
          railVisible={railVisible}
          panelOpen={panelOpen}
          level={level}
          showRules={showRules}
          onChangeLevel={changeLevel}
          onToggleRail={() =>
            setRailMode(railMode === "hidden" ? "open" : "hidden")
          }
          onTogglePanel={() => setPanelMode(panelOpen ? "off" : "panel")}
          onToggleRules={() => setShowRules((value) => !value)}
        />

        <div ref={container} className="min-h-0 flex-1">
          <Allotment
            ref={handle}
            className="h-full"
            defaultSizes={initialSizes}
            snap
            onChange={onChange}
            onDragEnd={onDragEnd}
          >
            <Allotment.Pane
              visible={railVisible}
              minSize={bounds[0].min}
              maxSize={bounds[0].max}
              preferredSize={rules.rail.default}
            >
              <DashboardSidebar
                onToggle={() =>
                  setRailMode(railMode === "hidden" ? "open" : "hidden")
                }
                embedded
              />
            </Allotment.Pane>

            <Allotment.Pane
              visible={boardVisible}
              minSize={bounds[1].min}
              maxSize={bounds[1].max}
            >
              <BoardPlaceholder />
            </Allotment.Pane>

            <Allotment.Pane
              visible={panelOpen}
              minSize={bounds[2].min}
              maxSize={bounds[2].max}
              preferredSize={rules.panel.default}
            >
              <RightPanel
                appRailWidth={0}
                embedded
                onResizeStart={() => undefined}
                onResizeEnd={() => undefined}
              />
            </Allotment.Pane>
          </Allotment>
        </div>

        {showRules && (
          <RuleReadout
            device={device}
            viewport={viewport}
            sizes={sizes}
            level={level}
            railVisible={railVisible}
            panelOpen={panelOpen}
            panelMax={panelMax}
            railMax={railMax}
          />
        )}
      </div>
    </NewWorkspaceDialogProvider>
  );
}
