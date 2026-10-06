import { useMutation, useQueryClient } from "@tanstack/react-query";

import { boardKeys } from "@/hooks/dashboard/useBoards";
import { cardApi } from "@/api/dashboard/cardApi";
import { columnApi } from "@/api/dashboard/columnAPI";

/**
 * Server-backed mutations for the kanban board view.
 *
 * Every action writes through the API and then invalidates the board's
 * detail query, so the board re-syncs from the server (no more "the data
 * comes back on refresh" — deletes and edits now persist).
 */
export function useBoardMutations(boardId: string | undefined) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (boardId) {
      void queryClient.invalidateQueries({
        queryKey: boardKeys.detail(boardId),
      });
    }
    // Overview (heavy list) may be showing the same board.
    void queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
  };

  const createCard = useMutation({
    mutationFn: (input: {
      columnId: string;
      boardId: string;
      title: string;
      orderIndex?: number;
    }) => cardApi.createCard(input),
    onSuccess: invalidate,
  });

  const updateCard = useMutation({
    mutationFn: (input: {
      cardId: string;
      title?: string;
      description?: string;
      dueDate?: string | null;
      members?: string[];
      labels?: string[];
    }) => cardApi.updateCard(input.cardId, input),
    onSuccess: invalidate,
  });

  const moveCard = useMutation({
    mutationFn: (input: {
      cardId: string;
      targetColumnId: string;
      targetOrderIndex: number;
    }) =>
      cardApi.moveCard(input.cardId, {
        targetColumnId: input.targetColumnId,
        targetOrderIndex: input.targetOrderIndex,
      }),
    onSuccess: invalidate,
  });

  const deleteCard = useMutation({
    mutationFn: (cardId: string) => cardApi.deleteCard(cardId),
    onSuccess: invalidate,
  });

  const createColumn = useMutation({
    mutationFn: (input: {
      boardId: string;
      name: string;
      orderIndex: number;
    }) => columnApi.createColumn(input),
    onSuccess: invalidate,
  });

  const updateColumn = useMutation({
    mutationFn: (input: { columnId: string; name?: string }) =>
      columnApi.updateColumn(input.columnId, { name: input.name }),
    onSuccess: invalidate,
  });

  const deleteColumn = useMutation({
    mutationFn: (columnId: string) => columnApi.deleteColumn(columnId),
    onSuccess: invalidate,
  });

  return {
    createCard,
    updateCard,
    moveCard,
    deleteCard,
    createColumn,
    updateColumn,
    deleteColumn,
  };
}
