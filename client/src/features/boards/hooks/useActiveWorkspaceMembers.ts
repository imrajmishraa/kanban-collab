import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { workspaceApi } from "@/api/dashboard/workspaceApi";
import { useActiveWorkspace } from "@/stores/activeWorkspace";

import { avatarColor } from "@/features/boards/board.helpers";

import type { BoardMember } from "@/features/boards/board.helpers";

/**
 * Members of the active workspace, with their names.
 *
 * The workspaces list only exposes `userId` + `role`, so avatars used to be
 * coloured circles with no label. `/workspaces/:id/members` returns
 * `name` and `email`, which is what the card editor needs to show who an
 * assignee actually is.
 */
export function useActiveWorkspaceMembers(): BoardMember[] {
  const { activeWorkspaceId } = useActiveWorkspace();

  const { data } = useQuery({
    queryKey: ["workspace-members", activeWorkspaceId],
    queryFn: () => workspaceApi.listMembers(activeWorkspaceId!),
    enabled: Boolean(activeWorkspaceId),
    staleTime: 60_000,
  });

  return useMemo(() => {
    if (!data) return [];

    return data.map((member) => ({
      id: member.userId,
      // Name first, then email: an email still gives a sensible initial.
      name: member.name ?? member.email ?? undefined,
      avatarUrl: member.avatarUrl ?? null,
      color: avatarColor(member.userId),
    }));
  }, [data]);
}
