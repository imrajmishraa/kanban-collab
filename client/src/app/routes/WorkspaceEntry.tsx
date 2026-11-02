import { useEffect } from "react";

import { useActiveWorkspace } from "@/stores/activeWorkspace";

import { DashboardPage } from "./pages";

/**
 * `/workspaces` is the picker. Arriving here is the visitor saying "let me
 * choose", so the remembered workspace is dropped and the next pick becomes the
 * active one.
 *
 * Only this route clears it: every other page keeps whatever was chosen, and a
 * stale id is corrected by `WorkspaceScope` when the scoped route cannot find
 * it.
 */
export default function WorkspaceEntry() {
  const { clearActiveWorkspace } = useActiveWorkspace();

  useEffect(() => {
    clearActiveWorkspace();
  }, [clearActiveWorkspace]);

  return <DashboardPage />;
}
