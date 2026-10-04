import { useBoardDetails } from "@/hooks/dashboard/useBoards";

import type { BoardDetails } from "@/types/api/dashboard/board";

export interface UseBoardForPageResult {
  /** The real board from the API — undefined until it loads. */
  board: BoardDetails | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}

/**
 * Loads a board for a page straight from the API. There is no mock
 * fallback: pages render loading / error / empty states from this result.
 */
export function useBoardForPage(boardId?: string): UseBoardForPageResult {
  const { data, isLoading, isError, error, refetch } = useBoardDetails(boardId);

  return { board: data, isLoading, isError, error, refetch };
}
