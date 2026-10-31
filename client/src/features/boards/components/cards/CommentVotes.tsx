import { HugeiconsIcon } from "@hugeicons/react";
import { ThumbsDownIcon, ThumbsUpIcon } from "@hugeicons/core-free-icons";

import { Tooltip } from "@/components/Tooltips/ToolTip";

interface CommentVotesProps {
  likeCount: number;
  dislikeCount: number;
  userAction: 1 | -1 | 0;
  onVote: (action: 1 | -1) => void;
  disabled?: boolean;
}

/**
 * Like and dislike, with the caller's own vote highlighted.
 *
 * Both buttons use the cream accent for the active state and neutral text
 * otherwise, per the design system: colour as text, never a filled pill.
 */
export default function CommentVotes({
  likeCount,
  dislikeCount,
  userAction,
  onVote,
  disabled = false,
}: CommentVotesProps) {
  const base =
    "flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[11px] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex items-center gap-1">
      <Tooltip label="Like" side="top" size="sm">
        <button
          type="button"
          onClick={() => onVote(1)}
          disabled={disabled}
          aria-pressed={userAction === 1}
          aria-label={`Like, ${likeCount} so far`}
          className={[
            base,
            userAction === 1
              ? "text-(--accent) hover:bg-(--bg-hover)"
              : "text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-primary)",
          ].join(" ")}
        >
          <HugeiconsIcon
            icon={ThumbsUpIcon}
            size={13}
            strokeWidth={userAction === 1 ? 2 : 1.7}
          />
          <span className="font-mono tabular-nums">
            {likeCount > 0 ? likeCount : ""}
          </span>
        </button>
      </Tooltip>

      <Tooltip label="Dislike" side="top" size="sm">
        <button
          type="button"
          onClick={() => onVote(-1)}
          disabled={disabled}
          aria-pressed={userAction === -1}
          aria-label={`Dislike, ${dislikeCount} so far`}
          className={[
            base,
            userAction === -1
              ? "text-(--accent) hover:bg-(--bg-hover)"
              : "text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-primary)",
          ].join(" ")}
        >
          <HugeiconsIcon
            icon={ThumbsDownIcon}
            size={13}
            strokeWidth={userAction === -1 ? 2 : 1.7}
          />
          <span className="font-mono tabular-nums">
            {dislikeCount > 0 ? dislikeCount : ""}
          </span>
        </button>
      </Tooltip>
    </div>
  );
}
