import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { boardApi } from "@/api/dashboard/boardApi";

export const boardKeys = {
  all: ["boards"] as const,

  lists: () => [...boardKeys.all, "list"] as const,

  list: (workspaceId: string, limit: number) =>
    [...boardKeys.lists(), workspaceId, { limit }] as const,

  detail: (boardId: string) => [...boardKeys.all, "detail", boardId] as const,
};

export function useBoards(workspaceId?: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: workspaceId
      ? boardKeys.list(workspaceId, limit)
      : boardKeys.lists(),

    queryFn: ({ pageParam }) =>
      boardApi.listBoards(workspaceId!, {
        page: pageParam,
        limit,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasNextPage) {
        return undefined;
      }

      return lastPage.pagination.page + 1;
    },

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
