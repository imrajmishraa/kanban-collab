import { useMemo } from "react";

import { useWorkspaces } from "@/hooks/useWorkspaces";
import type { WorkspaceRole } from "@/lib/workspacePermissions";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * The caller's role in a workspace, as the client sees it.
 *
 * The server is the authority — `application/boards/boardAccess.ts` decides what
 * is allowed, and every route checks it. This exists so the UI can stop offering
 * actions that will answer 403: a member who clicks "Delete board" and is told
 * "Only workspace owners and admins can delete a board" has learned the rule too
 * late, from an error, after a confirmation dialog.
 *
 * `null` means "not known yet" (the workspace list is still loading, or the
 * caller is not in it), and every caller treats that as "no permission" — the
 * safe direction for a control that destroys something.
 */
export function useWorkspaceRole(workspaceId?: string): WorkspaceRole | null {
  const { workspaces } = useWorkspaces();
  const userId = useAuthStore((state) => state.user?.id);

  return useMemo(() => {
    if (!workspaceId || !userId) return null;

    const workspace = workspaces.find((entry) => entry.id === workspaceId);

    if (!workspace) return null;

    const member = workspace.members?.find((entry) => entry.userId === userId);

    return member?.role ?? null;
  }, [workspaceId, userId, workspaces]);
}

export {
  canManageWorkspaceContent,
  canWriteWorkspaceContent,
  type WorkspaceRole,
} from "@/lib/workspacePermissions";
