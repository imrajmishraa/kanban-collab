import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { workspaceApi } from "@/features/workspaces/api/workspaceApi";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useAuthStore } from "@/stores/useAuthStore";

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

  /* `/me` carries the signed-in user's avatar even when the members endpoint
     does not, so their own face always renders. */
  const me = useAuthStore((state) => state.user);

  const { data } = useQuery({
    queryKey: ["workspace-members", activeWorkspaceId],
    queryFn: () => workspaceApi.listMembers(activeWorkspaceId!),
    enabled: Boolean(activeWorkspaceId),
    staleTime: 60_000,
  });

  return useMemo(() => {
    if (!data) return [];

    return data.map((member) => {
      const isMe = me?.id === member.userId;

      return {
        id: member.userId,
        // Name first, then email: an email still gives a sensible initial.
        name:
          member.name ??
          (isMe ? me?.fullName : undefined) ??
          member.email ??
          undefined,
        avatarUrl: member.avatarUrl ?? (isMe ? (me?.avatarUrl ?? null) : null),
        color: avatarColor(member.userId),
      };
    });
  }, [data, me]);
}
