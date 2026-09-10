import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cardApi } from "@/api/cardApi";
import type {
  CreateCardRequest,
  MoveCardRequest,
  UpdateCardRequest,
} from "@/types/dashboard/card";
import { boardKeys } from "./useBoards";

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCardRequest) => cardApi.createCard(data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(variables.boardId),
      });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardId,
      boardId,
      data,
    }: {
      cardId: string;
      boardId: string;
      data: UpdateCardRequest;
    }) => cardApi.updateCard(cardId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(variables.boardId),
      });
    },
  });
}

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardId,
      boardId,
      data,
    }: {
      cardId: string;
      boardId: string;
      data: MoveCardRequest;
    }) => cardApi.moveCard(cardId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(variables.boardId),
      });
    },
  });
}
