import { useEffect, useRef } from "react";

import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Restores the signed-in user's last-used workspace so they never have to
 * pick one manually. It does NOT navigate anywhere — it only selects the
 * workspace; the user stays on whatever route they landed on.
 *
 * Resolution order:
 *   1. the current selection, if it still exists;
 *   2. the user's last-used workspace, if it still exists;
 *   3. the first workspace in the list.
 *
 * Mounted once in AppLayout.
 */
export function useEnsureActiveWorkspace() {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.user?.id ?? null);

  const activeWorkspaceId = useActiveWorkspace((s) => s.activeWorkspaceId);
  const lastWorkspaceByUser = useActiveWorkspace((s) => s.lastWorkspaceByUser);
  const setActiveWorkspace = useActiveWorkspace((s) => s.setActiveWorkspace);

  const { workspaces, isSuccess } = useWorkspaces();

  // Resolve once per user per session, so we never fight a manual selection.
  const resolvedFor = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;
    if (!isSuccess) return;
    if (resolvedFor.current === userId) return;

    const exists = (id: string) => workspaces.some((w) => w.id === id);

    if (!activeWorkspaceId || !exists(activeWorkspaceId)) {
      const remembered = lastWorkspaceByUser[userId];
      const chosen =
        remembered && exists(remembered.id)
          ? { id: remembered.id, name: remembered.name }
          : workspaces[0]
            ? { id: workspaces[0].id, name: workspaces[0].name }
            : null;

      if (!chosen) return; // user has no workspaces yet — nothing to select
      setActiveWorkspace(chosen.id, chosen.name);
    }

    resolvedFor.current = userId;
  }, [
    status,
    userId,
    isSuccess,
    workspaces,
    activeWorkspaceId,
    lastWorkspaceByUser,
    setActiveWorkspace,
  ]);
}
