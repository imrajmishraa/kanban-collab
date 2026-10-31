import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { commentsApi } from "@/features/boards/api/commentsApi";

import type { CreateCommentPayload } from "@/types/comment";

export const commentKeys = {
  all: ["comments"] as const,
  forCard: (cardId: string) => [...commentKeys.all, "card", cardId] as const,
  replies: (commentId: string) =>
    [...commentKeys.all, "replies", commentId] as const,
  single: (commentId: string) =>
    [...commentKeys.all, "one", commentId] as const,
};

/** Top-level comments, newest first, paged with a cursor. */
export function useComments(cardId: string | undefined) {
  return useInfiniteQuery({
    queryKey: cardId ? commentKeys.forCard(cardId) : commentKeys.all,
    queryFn: ({ pageParam }) =>
      commentsApi.listComments(cardId!, {
        cursor: pageParam as string | null,
        limit: 10,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(cardId),
  });
}

/**
 * Direct replies for one comment.
 *
 * Disabled until `enabled` flips, which is what makes replies collapsed by
 * default: nothing is fetched until "View N replies" is pressed.
 */
export function useReplies(commentId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: commentKeys.replies(commentId),
    queryFn: ({ pageParam }) =>
      commentsApi.listReplies(commentId, {
        cursor: pageParam as string | null,
        limit: 5,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });
}

export function useCreateComment(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommentPayload) =>
      commentsApi.createComment(cardId, payload),

    onSuccess: () => {
      /* A new top-level comment changes the first page and the reply count on
         its parent, so both listings are refetched. */
      void queryClient.invalidateQueries({
        queryKey: commentKeys.forCard(cardId),
      });
      void queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}

/**
 * Like or dislike, with an optimistic patch.
 *
 * The server decides the final counts (toggle, switch, or clear), so the
 * optimistic update only moves the numbers by one and the response corrects
 * it a moment later.
 */
export function useVoteComment(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      action,
    }: {
      commentId: string;
      action: 1 | -1;
    }) => commentsApi.vote(commentId, action),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: commentKeys.forCard(cardId),
      });
      void queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}

export function useClearVote(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentsApi.clearVote(commentId),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: commentKeys.forCard(cardId),
      });
      void queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}

export function useUpdateComment(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      commentsApi.updateComment(commentId, text),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: commentKeys.forCard(cardId),
      });
      void queryClient.invalidateQueries({ queryKey: commentKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}
