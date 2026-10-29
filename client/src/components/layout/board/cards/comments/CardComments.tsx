import { useState } from "react";
import type { FormEvent } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

import CommentItem from "./CommentItem";

import { useAuth } from "@/hooks/auth/useAuth";
import {
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
        <h3 className="text-[12.5px] font-medium tracking-tight text-neutral-100">
          Comments
          {total > 0 && (
            <span className="ml-1.5 font-mono text-[10px] tabular-nums text-neutral-500">
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
          className="w-full resize-y rounded-lg border border-orange-50/15 bg-white/[0.04] px-3 py-2 text-[12.5px] text-neutral-100 outline-hidden transition-colors duration-200 placeholder:text-neutral-600 hover:border-orange-50/25 focus:border-white/25"
        />

        <div className="mt-2 flex items-center justify-between">
          {createComment.isError ? (
            <p className="text-[11px] text-rose-300">
              Could not post that comment.
            </p>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={!text.trim() || createComment.isPending}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-white px-3 text-[11.5px] font-semibold text-black transition-colors duration-200 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-neutral-500"
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
          <p className="text-[11.5px] text-neutral-500">Loading comments…</p>
        )}

        {isError && (
          <p className="text-[11.5px] text-rose-300">
            Could not load comments.
          </p>
        )}

        {!isLoading && !isError && comments.length === 0 && (
          <p className="text-[11.5px] text-neutral-500">
            No comments yet, start the conversation
          </p>
        )}

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            cardId={cardId}
            currentUserId={user?.id}
            isVoting={voteComment.isPending}
            onVote={(commentId, action) =>
              voteComment.mutate({ commentId, action })
            }
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
            className="flex cursor-pointer items-center gap-1.5 text-[11.5px] text-neutral-400 transition-colors duration-200 hover:text-orange-100 disabled:opacity-50"
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
