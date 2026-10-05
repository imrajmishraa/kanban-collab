import { useQuery } from "@tanstack/react-query";

import { activityApi } from "@/api/dashboard/activityApi";

export const activityKeys = {
  all: ["activity"] as const,
  forBoard: (boardId: string) =>
    [...activityKeys.all, "board", boardId] as const,
};

/** Recent activity for a board, newest first. */
export function useBoardActivity(boardId: string | undefined, limit = 30) {
  return useQuery({
    queryKey: boardId ? activityKeys.forBoard(boardId) : activityKeys.all,
    queryFn: () => activityApi.listBoardActivity(boardId!, limit),
    enabled: Boolean(boardId),
  });
}
