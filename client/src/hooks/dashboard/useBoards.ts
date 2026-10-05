import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { boardApi } from "@/api/dashboard/boardApi";
import { useActiveWorkspace } from "@/stores/activeWorkspace";

export const boardKeys = {
  all: ["boards"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  list: (workspaceId: string, limit: number) =>
    [...boardKeys.lists(), workspaceId, { limit }] as const,
  /** Heavy overview list — boards with nested columns + cards. */
  listWithDetails: (workspaceId: string, limit: number) =>
    [
      ...boardKeys.lists(),
      workspaceId,
      { limit, include: "columns,cards" },
    ] as const,
  detail: (boardId: string) => [...boardKeys.all, "detail", boardId] as const,
};

/**
 * The single page size every boards list must use. `limit` is part of the
 * query key, so callers passing different limits create separate cache
 * entries — and therefore duplicate `/boards` requests. Keep everyone on
 * this constant so the sidebar, navbar, dashboard and overview all share
 * one query (one request).
 */
export const BOARDS_LIST_LIMIT = 6;

export function useBoards(limit: number = BOARDS_LIST_LIMIT) {
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
