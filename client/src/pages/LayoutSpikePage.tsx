import { useCallback, useState } from "react";

import DashboardLayout from "@/layouts/DashboardLayout";
import { NewWorkspaceDialogProvider } from "@/components/dashboard/workspace/create/NewWorkspaceDialogProvider";
import { useSidebarState } from "@/features/dashboard";
import { MOBILE_MAX_VIEWPORT, deviceFor } from "@/lib/layoutRules";
import { useRightPanel } from "@/stores/rightPanel";

import { BoardPlaceholder } from "./layout-spike/BoardPlaceholder";
import { RuleReadout } from "./layout-spike/RuleReadout";
import { SpikeBar } from "./layout-spike/SpikeBar";
import { useViewportWidth } from "./layout-spike/useViewportWidth";

interface Sizes {
  left: number;
  centre: number;
  right: number;
}

/**
 * The layout spike.
 *
 * A dev-only page (`/layout-spike`) that mounts `DashboardLayout` — the real
 * three-region shell — with the real `DashboardSidebar` and `RightPanel` inside
 * it, so the settled rules can be tried before `AppLayout` moves.
 *
 * The engine is `react-resizable-panels`: percentage sizes with pixel floors,
 * which is the only combination that keeps a side panel a side panel on a 4K
 * monitor and still refuses to shrink it past a readable width.
 */
export default function LayoutSpikePage() {
  const viewport = useViewportWidth();
  const device = deviceFor(viewport);

  const railMode = useSidebarState((state) => state.mode);
  const setRailMode = useSidebarState((state) => state.setMode);
  const panelMode = useRightPanel((state) => state.mode);
  const setPanelMode = useRightPanel((state) => state.setMode);

  const railVisible = railMode !== "hidden";
  const panelOpen = panelMode !== "off";

  const [sizes, setSizes] = useState<Sizes>({ left: 0, centre: 0, right: 0 });
  const [showRules, setShowRules] = useState(true);

  const onSizes = useCallback((next: Sizes) => setSizes(next), []);

  if (device === "mobile") {
    return (
      <p className="grid h-dvh place-items-center bg-(--bg-root) p-6 text-center text-(--text-primary)">
        Below {MOBILE_MAX_VIEWPORT}px there is no group — the column is the
        full-screen sheet and the rail does not exist.
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
          sizes={[sizes.left, sizes.centre, sizes.right]}
          railVisible={railVisible}
          panelOpen={panelOpen}
          showRules={showRules}
          onToggleRail={() => setRailMode(railVisible ? "hidden" : "open")}
          onTogglePanel={() => setPanelMode(panelOpen ? "off" : "panel")}
          onToggleRules={() => setShowRules((value) => !value)}
        />

        <DashboardLayout device={device} onSizes={onSizes}>
          <BoardPlaceholder />
        </DashboardLayout>

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
