import { useState } from "react";

import DashboardLayout from "@/layouts/DashboardLayout";
import { NewWorkspaceDialogProvider } from "@/components/dashboard/workspace/create/NewWorkspaceDialogProvider";
import { useSidebarState } from "@/features/dashboard";
import { MOBILE_MAX_VIEWPORT, deviceFor } from "@/lib/layoutRules";
import { useRightPanel } from "@/stores/rightPanel";
import { useLayoutShellStore } from "@/layouts/stores/layoutShellStore";

import { BoardPlaceholder } from "./layout-spike/BoardPlaceholder";
import { RuleReadout } from "./layout-spike/RuleReadout";
import { SpikeBar } from "./layout-spike/SpikeBar";
import { useViewportWidth } from "./layout-spike/useViewportWidth";

/**
 * Dev-only layout spike (`/layout-spike`).
 * Behaviour must match Layout.md (Grok-style shell).
 */
export default function LayoutSpikePage() {
  const viewport = useViewportWidth();
  const device = deviceFor(viewport);

  const sizes = useLayoutShellStore((s) => s.sizes);
  const toggleRail = useLayoutShellStore((s) => s.toggleRail);
  const togglePanel = useLayoutShellStore((s) => s.togglePanel);

  const railMode = useSidebarState((state) => state.mode);
  const panelMode = useRightPanel((state) => state.mode);

  const railVisible = railMode !== "hidden";
  const panelOpen = panelMode !== "off";

  const [showRules, setShowRules] = useState(true);

  if (device === "mobile") {
    return (
      <p className="grid h-dvh place-items-center bg-(--bg-root) p-6 text-center text-(--text-primary)">
        Below {MOBILE_MAX_VIEWPORT}px there is no group — the column is the
        full-screen sheet and the rail does not exist.
      </p>
    );
  }

  return (
    <NewWorkspaceDialogProvider>
      <div className="flex h-dvh flex-col bg-(--bg-root) text-(--text-primary)">
        <SpikeBar
          device={device}
          viewport={viewport}
          sizes={[sizes.left, sizes.centre, sizes.right]}
          railVisible={railVisible}
          panelOpen={panelOpen}
          showRules={showRules}
          onToggleRail={toggleRail}
          onTogglePanel={togglePanel}
          onToggleRules={() => setShowRules((value) => !value)}
        />

        <DashboardLayout device={device}>
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
