import { useState } from "react";
import type { FormEvent } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

import CommentItem from "./CommentItem";

import { useAuth } from "@/hooks/auth/useAuth";
import {
  useClearVote,
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
  useVoteComment,
} from "@/hooks/dashboard/useComments";

interface CardCommentsProps {
  cardId: string;
}

/**
 * Comment thread for a card.
 *
 * Top-level comments render flat; replies are collapsed behind their own
 * count and fetched per comment. Voting is a single request per press, and the
 * server owns the toggle so two rapid clicks cannot desync the counts.
 */
export default function CardComments({ cardId }: CardCommentsProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useComments(cardId);

  const createComment = useCreateComment(cardId);
  const deleteComment = useDeleteComment(cardId);
  const updateComment = useUpdateComment(cardId);
  const voteComment = useVoteComment(cardId);
  const clearVote = useClearVote(cardId);

  const comments = data?.pages.flatMap((page) => page.comments) ?? [];
  const total = comments.length;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = text.trim();
    if (!value || createComment.isPending) return;

    createComment.mutate({ text: value }, { onSuccess: () => setText("") });
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="text-[12.5px] font-medium tracking-tight text-(--text-primary)">
          Comments
          {total > 0 && (
            <span className="ml-1.5 font-mono text-[10px] tabular-nums text-(--text-muted)">
              {total}
              {hasNextPage ? "+" : ""}
            </span>
          )}
        </h3>
      </div>

      <form onSubmit={submit} className="mt-3">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={2}
          placeholder="Write a comment…"
          aria-label="Write a comment"
          className="w-full resize-y rounded-lg border border-(--hairline) bg-(--tint-4) px-3 py-2 text-[12.5px] text-(--text-primary) outline-hidden transition-colors duration-200 placeholder:text-(--text-subtle) hover:border-(--hairline-strong) focus:border-(--border-strong)"
        />

        <div className="mt-2 flex items-center justify-between">
          {createComment.isError ? (
            <p className="text-[11px] text-(--danger)">
              Could not post that comment.
            </p>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={!text.trim() || createComment.isPending}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-(--solid-bg) px-3 text-[11.5px] font-semibold text-(--solid-text) transition-colors duration-200 hover:bg-(--solid-bg-hover) disabled:cursor-not-allowed disabled:bg-(--tint-15) disabled:text-(--text-muted)"
          >
            {createComment.isPending && (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={12}
                strokeWidth={2}
                className="animate-spin"
              />
            )}
            Comment
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-4">
        {isLoading && (
          <p className="text-[11.5px] text-(--text-muted)">Loading comments…</p>
        )}

        {isError && (
          <p className="text-[11.5px] text-(--danger)">
            Could not load comments.
          </p>
        )}

        {!isLoading && !isError && comments.length === 0 && (
          <p className="text-[11.5px] text-(--text-muted)">
            No comments yet, start the conversation
          </p>
        )}

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            cardId={cardId}
            currentUserId={user?.id}
            isVoting={voteComment.isPending || clearVote.isPending}
            /* Clicking the vote you already have removes it, which is what
               DELETE /comments/:id/like is for. */
            onVote={(commentId, action) => {
              const existing = comments.find(
                (comment) => comment.id === commentId,
              );

              if (existing?.userAction === action) {
                clearVote.mutate(commentId);
                return;
              }

              voteComment.mutate({ commentId, action });
            }}
            onDelete={(commentId) => deleteComment.mutate(commentId)}
            onEdit={(commentId, nextText) =>
              updateComment.mutate({ commentId, text: nextText })
            }
            isSaving={updateComment.isPending}
          />
        ))}

        {hasNextPage && (
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="flex cursor-pointer items-center gap-1.5 text-[11.5px] text-(--text-secondary) transition-colors duration-200 hover:text-(--accent) disabled:opacity-50"
          >
            {isFetchingNextPage && (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={12}
                strokeWidth={2}
                className="animate-spin"
              />
            )}
            View more comments
          </button>
        )}
      </div>
    </section>
  );
}
