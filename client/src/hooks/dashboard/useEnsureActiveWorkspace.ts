import { useEffect, useRef } from "react";

import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useAuthStore } from "@/stores/useAuthStore";

export function useEnsureActiveWorkspace() {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.user?.id ?? null);

  const activeWorkspaceId = useActiveWorkspace((s) => s.activeWorkspaceId);
  const clearActiveWorkspace = useActiveWorkspace(
    (s) => s.clearActiveWorkspace,
  );

  const { workspaces, isSuccess } = useWorkspaces();

  // Resolve once per user per session, so we never fight a manual selection.
  const resolvedFor = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;
    if (!isSuccess) return;
    if (resolvedFor.current === userId) return;

    const exists = (id: string) => workspaces.some((w) => w.id === id);

    // A stale selection is dropped. A missing one stays missing.
    if (activeWorkspaceId && !exists(activeWorkspaceId)) {
      clearActiveWorkspace();
    }

    resolvedFor.current = userId;
  }, [
    status,
    userId,
    isSuccess,
    workspaces,
    activeWorkspaceId,
    clearActiveWorkspace,
  ]);
}
