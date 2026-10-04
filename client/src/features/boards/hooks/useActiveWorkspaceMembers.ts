import { useMemo } from "react";

import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useActiveWorkspace } from "@/stores/activeWorkspace";

import { avatarColor } from "@/features/boards/board.helpers";

import type { BoardMember } from "@/features/boards/board.helpers";

/**
 * Members of the active workspace, sourced from the workspaces API.
 * The API exposes only `userId` + `role`, so avatars are keyed by id.
 */
export function useActiveWorkspaceMembers(): BoardMember[] {
  const { activeWorkspaceId } = useActiveWorkspace();
  const { workspaces } = useWorkspaces();

  return useMemo(() => {
    const workspace = workspaces.find((item) => item.id === activeWorkspaceId);
    if (!workspace) return [];

    return workspace.members.map((member) => ({
      id: member.userId,
      color: avatarColor(member.userId),
    }));
  }, [workspaces, activeWorkspaceId]);
}
