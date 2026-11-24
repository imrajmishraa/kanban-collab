import { useCallback, useState } from "react";

import { Allotment } from "allotment";

import "allotment/dist/style.css";

import { useRightPanel } from "@/stores/rightPanel";
import { useSidebarState } from "@/features/dashboard";
import DashboardSidebar from "@/components/sidebar/DashboardSidebar";
import RightPanel from "@/components/layout/RightPanel";
import { NewWorkspaceDialogProvider } from "@/components/dashboard/workspace/create/NewWorkspaceDialogProvider";
import { MOBILE_MAX_VIEWPORT, SPIKE, deviceFor } from "@/lib/layoutRules";

import { BoardPlaceholder } from "./layout-spike/BoardPlaceholder";
import { RuleReadout } from "./layout-spike/RuleReadout";
import { SpikeBar } from "./layout-spike/SpikeBar";
import { useViewportWidth } from "./layout-spike/useViewportWidth";

/**
 * The Allotment spike.
 *
 * A dev-only page (`/layout-spike`) that runs the settled rail/panel rules
 * through `allotment@1.20.6` with the *real* `DashboardSidebar` and `RightPanel`
 * inside its panes — the same components `AppLayout` mounts, so what the panes
 * do to them is what the swap will do to the app.
 *
 * Why a page and not `AppLayout` itself: the app's shell positions both edges
 * with `fixed` and margins, and its numbers live in modules this branch is not
 * allowed to move yet. Proving px minimums, the snap stops, the coupling and
 * `visible={false}` reflow here costs one file; getting them wrong in the shell
 * costs a revert.
 *
 * The numbers come from `lib/layoutRules.ts`, which mirrors the rules form, not
 * from the production constants. `SPIKE_DELTAS` lists the places the two still
 * differ — the readout shows them as pending, never as passes.
 */
export default function LayoutSpikePage() {
  const viewport = useViewportWidth();
  const device = deviceFor(viewport);
  const rules = SPIKE[device];

  const railMode = useSidebarState((state) => state.mode);
  const railWidth = useSidebarState((state) => state.width);
  const setRailWidth = useSidebarState((state) => state.setWidth);
  const setRailMode = useSidebarState((state) => state.setMode);

  const panelMode = useRightPanel((state) => state.mode);
  const panelWidth = useRightPanel((state) => state.width);
  const setPanelWidth = useRightPanel((state) => state.setWidth);
  const setPanelMode = useRightPanel((state) => state.setMode);

  const railVisible = railMode !== "hidden";
  const panelOpen = panelMode !== "off";

  /* The panes' own sizes, as Allotment reports them. The stores are written from
     here so the components inside the panes render at the width the pane gave
     them — one number, two readers, the way `AppLayout` already works. */
  const [sizes, setSizes] = useState<number[]>(() => [
    Math.max(rules.rail.min, railWidth),
    Math.max(rules.boardMin, 480),
    panelOpen ? Math.max(rules.panel.min, panelWidth) : rules.panel.default,
  ]);

  const [showRules, setShowRules] = useState(true);

  /* `defaultSizes` is read once: feeding the live sizes back in would make every
     drag fight the state that produced it. */
  const [initialSizes] = useState(sizes);

  const onChange = useCallback(
    (next: number[]) => {
      setSizes(next);

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

  const toggleRail = () =>
    setRailMode(railMode === "hidden" ? "open" : "hidden");
  const togglePanel = () => setPanelMode(panelOpen ? "off" : "panel");

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
          showRules={showRules}
          onToggleRules={() => setShowRules((value) => !value)}
          onToggleRail={toggleRail}
          onTogglePanel={togglePanel}
        />

        <div className="min-h-0 flex-1">
          <Allotment
            className="h-full"
            defaultSizes={initialSizes}
            snap
            onChange={onChange}
          >
            <Allotment.Pane
              visible={railVisible}
              minSize={rules.rail.min}
              maxSize={rules.rail.max}
              preferredSize={rules.rail.default}
            >
              <DashboardSidebar onToggle={toggleRail} embedded />
            </Allotment.Pane>

            <Allotment.Pane minSize={rules.boardMin}>
              <BoardPlaceholder />
            </Allotment.Pane>

            <Allotment.Pane
              visible={panelOpen}
              minSize={rules.panel.min}
              maxSize={rules.panel.max}
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
            railVisible={railVisible}
            panelOpen={panelOpen}
          />
        )}
      </div>
    </NewWorkspaceDialogProvider>
  );
}
