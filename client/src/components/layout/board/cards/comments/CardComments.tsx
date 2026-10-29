import { useState } from "react";
import type { FormEvent } from "react";

import { useAuth } from "@/hooks/auth/useAuth";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
} from "@/hooks/dashboard/useComments";

import {
  avatarColor,
  formatRelative,
  initials,
} from "@/features/boards/board.helpers";

interface CardCommentsProps {
  cardId: string;
}

/**
 * Comments for a single card (T10). Reads and writes `CommentModel` through
 * the card-scoped endpoints; the composer stays mounted while the list
 * refetches so typing is never interrupted.
 */
export default function CardComments({ cardId }: CardCommentsProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");

  const comments = useComments(cardId);
  const createComment = useCreateComment(cardId);
  const deleteComment = useDeleteComment(cardId);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = text.trim();
    if (!value || createComment.isPending) return;

    createComment.mutate({ text: value }, { onSuccess: () => setText("") });
  };

  return (
    <section className="mt-5 border-t border-orange-50/15 pt-4">
      <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
        Comments{comments.data ? ` (${comments.data.length})` : ""}
      </h3>

      <div className="mt-3 space-y-3">
        {comments.isLoading && (
          <p className="font-mono text-[11px] text-neutral-500">
            Loading comments…
          </p>
        )}

        {comments.isError && (
          <p className="font-mono text-[11px] text-(--danger)">
            Couldn&apos;t load comments.
          </p>
        )}

        {comments.data?.length === 0 && (
          <p className="font-mono text-[11px] text-neutral-500">
            No comments yet.
          </p>
        )}

        {comments.data?.map((comment) => (
          <article key={comment.id} className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-semibold text-black"
              style={{ background: avatarColor(comment.userId) }}
            >
              {initials(comment.authorName)}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate font-mono text-[11px] font-semibold text-neutral-100">
                  {comment.authorName}
                </span>
                <span className="font-mono text-[10px] text-neutral-500">
                  {formatRelative(comment.createdAt)}
                </span>

                {user?.id === comment.userId && (
                  <button
                    type="button"
                    onClick={() => deleteComment.mutate(comment.id)}
                    disabled={deleteComment.isPending}
                    className="ml-auto font-mono text-[10px] text-neutral-500 transition-colors hover:text-(--danger) disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>

              <p className="mt-0.5 whitespace-pre-wrap wrap-break-word text-[12.5px] leading-5 text-neutral-400">
                {comment.text}
              </p>
            </div>
          </article>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-3">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={2}
          placeholder="Write a comment…"
          className="w-full resize-y rounded-lg border border-orange-50/15 bg-white/4 px-3 py-2 font-mono text-[12px] text-neutral-100 outline-none transition-colors placeholder:text-neutral-500 hover:border-orange-50/25 focus:border-(--brand-border)"
        />

        {createComment.isError && (
          <p className="mt-1 font-mono text-[10px] text-(--danger)">
            Couldn&apos;t post that comment.
          </p>
        )}

        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!text.trim() || createComment.isPending}
            className="rounded-lg border border-orange-100/30 bg-orange-100/10 px-3 py-1.5 text-[11px] font-semibold text-orange-100 transition-colors hover:bg-orange-100/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {createComment.isPending ? "Posting…" : "Comment"}
          </button>
        </div>
      </form>
    </section>
  );
}
