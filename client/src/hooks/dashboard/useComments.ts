import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { commentsApi } from "@/api/dashboard/commentsApi";

import type { CreateCommentPayload } from "@/types/api/dashboard/comment";

export const commentKeys = {
  all: ["comments"] as const,
  forCard: (cardId: string) => [...commentKeys.all, "card", cardId] as const,
};

/** Comments for a single card, oldest first. */
export function useComments(cardId: string | undefined) {
  return useQuery({
    queryKey: cardId ? commentKeys.forCard(cardId) : commentKeys.all,
    queryFn: () => commentsApi.listComments(cardId!),
    enabled: Boolean(cardId),
  });
}

export function useCreateComment(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommentPayload) =>
      commentsApi.createComment(cardId, payload),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: commentKeys.forCard(cardId),
      });
    },
  });
}

export function useDeleteComment(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(commentId),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: commentKeys.forCard(cardId),
      });
    },
  });
}
