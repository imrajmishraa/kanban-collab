import { useMemo } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";

import { boardApi } from "@/features/boards/api/boardApi";
import { boardKeys } from "@/hooks/useBoards";
import { useActiveWorkspace } from "@/stores/activeWorkspace";

import type { Board, BoardDetails } from "@/types/board";

/** Page size for the overview. Kept separate from the sidebar's light list. */
export const BOARDS_OVERVIEW_LIMIT = 10;

export interface WorkspaceBoardItem {
  board: Board;
  /** Columns + cards for this board (undefined until loaded). */
  details: BoardDetails | undefined;
  isLoadingDetails: boolean;
}

export interface UseWorkspaceBoardsResult {
  items: WorkspaceBoardItem[];
  /** Every board in the workspace, not just the pages loaded so far. */
  totalBoards: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

/**
 * Every board in the active workspace, each paired with its columns and cards.
 *
 * Uses the opt-in heavy list (`?include=columns,cards`) so the whole overview
 * is a **single** request per page — the previous implementation fetched the
 * board list and then one `/boards/:id` per board (N+1).
 */
export function useWorkspaceBoards(): UseWorkspaceBoardsResult {
  const { activeWorkspaceId } = useActiveWorkspace();

  const query = useInfiniteQuery({
    queryKey: activeWorkspaceId
      ? boardKeys.listWithDetails(activeWorkspaceId, BOARDS_OVERVIEW_LIMIT)
      : boardKeys.lists(),

    queryFn: ({ pageParam }) =>
      boardApi.listBoardsWithColumns(activeWorkspaceId!, {
        page: pageParam as number,
        limit: BOARDS_OVERVIEW_LIMIT,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,

    enabled: Boolean(activeWorkspaceId),
  });

  const boards = useMemo(
    () => query.data?.pages.flatMap((page) => page.boards) ?? [],
    [query.data],
  );

  const items: WorkspaceBoardItem[] = boards.map((board) => ({
    board,
    details: {
      ...board,
      columns: board.columns ?? [],
    },
    isLoadingDetails: false,
  }));

  return {
    items,
    totalBoards: query.data?.pages[0]?.pagination.totalBoards ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    hasNextPage: Boolean(query.hasNextPage),
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
  };
}
