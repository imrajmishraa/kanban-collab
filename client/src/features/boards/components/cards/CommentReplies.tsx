import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

import CommentItem from "./CommentItem";

import { useReplies } from "@/hooks/useComments";

interface CommentRepliesProps {
  commentId: string;
  cardId: string;
  currentUserId: string | undefined;
  onVote: (commentId: string, action: 1 | -1) => void;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, text: string) => void;
}

/**
 * Replies for one comment, fetched only once this renders.
 *
 * The parent only mounts this when "N replies" is pressed, so a card with
 * hundreds of replies costs nothing until someone asks for them.
 */
export default function CommentReplies({
  commentId,
  cardId,
  currentUserId,
  onVote,
  onDelete,
  onEdit,
}: CommentRepliesProps) {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useReplies(commentId, true);

  const replies = data?.pages.flatMap((page) => page.replies) ?? [];

  return (
    <div className="mt-2.5 space-y-3 border-l border-(--hairline) pl-3">
      {isLoading && (
        <p className="text-[11px] text-(--text-muted)">Loading replies…</p>
      )}

      {isError && (
        <p className="text-[11px] text-(--danger)">Could not load replies.</p>
      )}

      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          cardId={cardId}
          currentUserId={currentUserId}
          isReply
          onVote={onVote}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
          className="flex cursor-pointer items-center gap-1.5 text-[11px] text-(--text-secondary) transition-colors duration-200 hover:text-(--accent) disabled:opacity-50"
        >
          {isFetchingNextPage && (
            <HugeiconsIcon
              icon={Loading03Icon}
              size={11}
              strokeWidth={2}
              className="animate-spin"
            />
          )}
          View more replies
        </button>
      )}
    </div>
  );
}
