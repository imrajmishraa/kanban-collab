import { useMemo } from "react";

import { useQueries } from "@tanstack/react-query";

import { boardApi } from "@/api/dashboard/boardApi";
import { boardKeys, useBoards } from "@/hooks/dashboard/useBoards";
import { useActiveWorkspace } from "@/stores/activeWorkspace";

import type { Board, BoardDetails } from "@/types/api/dashboard/board";

export interface WorkspaceBoardItem {
  board: Board;
  /** Columns + cards for this board (undefined until loaded). */
  details: BoardDetails | undefined;
  isLoadingDetails: boolean;
}

export interface UseWorkspaceBoardsResult {
  items: WorkspaceBoardItem[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

/**
 * Every board in the active workspace, each paired with its full details
 * (columns + cards) fetched from the API. No mock data anywhere.
 */
export function useWorkspaceBoards(): UseWorkspaceBoardsResult {
  const { activeWorkspaceId } = useActiveWorkspace();
  const boardsQuery = useBoards();

  const boards = useMemo(
    () => boardsQuery.data?.pages.flatMap((page) => page.boards) ?? [],
    [boardsQuery.data],
  );

  const detailQueries = useQueries({
    queries: boards.map((board) => ({
      queryKey: boardKeys.detail(board.id),
      queryFn: () => boardApi.getBoardDetails(board.id),
      enabled: Boolean(activeWorkspaceId),
    })),
  });

  const items: WorkspaceBoardItem[] = boards.map((board, index) => ({
    board,
    details: detailQueries[index]?.data,
    isLoadingDetails: detailQueries[index]?.isLoading ?? false,
  }));

  return {
    items,
    isLoading: boardsQuery.isLoading,
    isError: boardsQuery.isError,
    refetch: boardsQuery.refetch,
    hasNextPage: Boolean(boardsQuery.hasNextPage),
    isFetchingNextPage: boardsQuery.isFetchingNextPage,
    fetchNextPage: () => void boardsQuery.fetchNextPage(),
  };
}
