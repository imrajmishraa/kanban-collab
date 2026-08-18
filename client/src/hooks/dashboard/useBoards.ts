import { useQuery } from "@tanstack/react-query";

import { boardApi } from "@/api/dashboard/boardApi";

export const boardKeys = {
  all: ["boards"] as const,

  lists: () => [...boardKeys.all, "list"] as const,

  list: (workspaceId: string) => [...boardKeys.lists(), workspaceId] as const,

  detail: (boardId: string) => [...boardKeys.all, "detail", boardId] as const,
};

export function useBoards(workspaceId?: string) {
  return useQuery({
    queryKey: workspaceId ? boardKeys.list(workspaceId) : boardKeys.lists(),

    queryFn: () => boardApi.listBoards(workspaceId!),

    enabled: Boolean(workspaceId),
  });
}

export function useBoardDetails(boardId?: string) {
  return useQuery({
    queryKey: boardId
      ? boardKeys.detail(boardId)
      : ([...boardKeys.all, "detail"] as const),

    queryFn: () => boardApi.getBoardDetails(boardId!),

    enabled: Boolean(boardId),
  });
}
