import { useEffect, useRef } from "react";

import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Restores the workspace the user picked last time. It does NOT navigate
 * anywhere — it only selects the workspace; the user stays on whatever route
 * they landed on.
 *
 * Resolution order:
 *   1. the current selection, if it still exists;
 *   2. the user's last-used workspace, if it still exists;
 *   3. nothing. The user has never chosen, so `RequireWorkspace` asks.
 *
 * There used to be a third fallback to `workspaces[0]`, which silently picked
 * a workspace for every user. That made the "choose a workspace" screen
 * unreachable: by the time a gated route rendered, something was always
 * selected. Guessing a workspace is also wrong on its own terms, since it can
 * drop you into someone else's project.
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

      // Only restore a workspace the user actually chose. No guessing.
      if (!remembered || !exists(remembered.id)) {
        resolvedFor.current = userId;
        return;
      }

      setActiveWorkspace(remembered.id, remembered.name);
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
