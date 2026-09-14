import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { boardApi } from "@/api/dashboard/boardApi";
import { useActiveWorkspace } from "@/stores/activeWorkspace";

export const boardKeys = {
  all: ["boards"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  list: (workspaceId: string, limit: number) =>
    [...boardKeys.lists(), workspaceId, { limit }] as const,
  detail: (boardId: string) => [...boardKeys.all, "detail", boardId] as const,
};

export function useBoards(limit = 20) {
  const { activeWorkspaceId } = useActiveWorkspace();

  return useInfiniteQuery({
    queryKey: activeWorkspaceId
      ? boardKeys.list(activeWorkspaceId, limit)
      : boardKeys.lists(),

    queryFn: ({ pageParam }) =>
      boardApi.listBoards(activeWorkspaceId!, {
        page: pageParam,
        limit,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,

    enabled: Boolean(activeWorkspaceId),
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
