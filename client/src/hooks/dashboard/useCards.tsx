import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cardApi } from "@/api/cardApi";
import type { CreateCardRequest } from "@/types/dashboard/card";

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
