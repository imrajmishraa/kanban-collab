import { useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Delete02Icon,
  Edit02Icon,
  Loading03Icon,
  Message01Icon,
  MoreHorizontalIcon,
  ReplyIcon,
} from "@hugeicons/core-free-icons";

import CommentReplies from "./CommentReplies";
import CommentVotes from "./CommentVotes";

import { useCreateComment } from "@/hooks/dashboard/useComments";

import { Avatar } from "@components/layout/board/BoardAvatar";
import { Tooltip } from "@/components/Tooltips/ToolTip";

import { avatarColor, formatRelative } from "@/features/boards/board.helpers";

import type { Comment } from "@/types/api/dashboard/comment";

interface CommentItemProps {
  comment: Comment;
  cardId: string;
  currentUserId: string | undefined;
  isReply?: boolean;
  onVote: (commentId: string, action: 1 | -1) => void;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, text: string) => void;
  isVoting?: boolean;
  isSaving?: boolean;
}

/**
 * One comment.
 *
 * Top-level comments render flat; replies hide behind an "N replies" button
 * that fetches them the first time it opens. Your own comments get a menu with
 * edit and delete, and edit happens in place so the thread does not jump.
 */
export default function CommentItem({
  comment,
  cardId,
  currentUserId,
  isReply = false,
  onVote,
  onDelete,
  onEdit,
  isVoting = false,
  isSaving = false,
}: CommentItemProps) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  /* Replying is the same endpoint as commenting, with a parentId, so this
     works at any depth: a reply to a reply just points at the reply. */
  const createReply = useCreateComment(cardId);

  const menuRef = useRef<HTMLDivElement>(null);

  const isOwn = currentUserId === comment.userId;
  const hasReplies = comment.repliesCount > 0;

  /* Render-phase reset: if the comment changes underneath us (an edit landed
     from another client), drop the stale draft rather than keep it. */
  const [lastText, setLastText] = useState(comment.text);
  if (!editing && comment.text !== lastText) {
    setLastText(comment.text);
    setDraft(comment.text);
  }

  useEffect(() => {
    if (!menuOpen) return;

    const onDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const submitReply = () => {
    const value = replyText.trim();
    if (!value || createReply.isPending) return;

    createReply.mutate(
      { text: value, parentId: comment.id },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyOpen(false);
          // Show the thread so the new reply is visible straight away.
          setRepliesOpen(true);
        },
      },
    );
  };

  const save = () => {
    const value = draft.trim();
    if (!value || value === comment.text) {
      setEditing(false);
      setDraft(comment.text);
      return;
    }

    onEdit(comment.id, value);
    setEditing(false);
  };

  return (
    <article className={isReply ? "flex gap-2.5" : "flex gap-3"}>
      <Avatar
        member={{
          id: comment.userId,
          name: comment.authorName,
          avatarUrl: comment.authorAvatarUrl,
          color: avatarColor(comment.userId),
        }}
        size={isReply ? 24 : 28}
        ring={false}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="truncate text-[12.5px] font-medium tracking-tight text-neutral-100">
              {comment.authorName}
            </span>

            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
              {formatRelative(comment.createdAt)}
            </span>

            {comment.updatedAt !== comment.createdAt && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-700">
                edited
              </span>
            )}
          </div>

          {isOwn && (
            <div ref={menuRef} className="relative ml-auto shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((previous) => !previous)}
                aria-label="Comment actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={[
                  "flex size-6 cursor-pointer items-center justify-center rounded-md transition-colors duration-200",
                  menuOpen
                    ? "bg-white/8 text-neutral-100"
                    : "text-neutral-600 hover:bg-white/6 hover:text-neutral-300",
                ].join(" ")}
              >
                <HugeiconsIcon
                  icon={MoreHorizontalIcon}
                  size={14}
                  strokeWidth={1.8}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Comment actions"
                  className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-orange-50/15 bg-[#141416] p-1"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setEditing(true);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11.5px] text-neutral-300 transition-colors duration-150 hover:bg-white/6 hover:text-neutral-100"
                  >
                    <HugeiconsIcon
                      icon={Edit02Icon}
                      size={13}
                      strokeWidth={1.6}
                    />
                    Edit
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(comment.id);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11.5px] text-rose-300 transition-colors duration-150 hover:bg-rose-500/10 hover:text-rose-200"
                  >
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      size={13}
                      strokeWidth={1.6}
                    />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-1.5">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setEditing(false);
                  setDraft(comment.text);
                }
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  save();
                }
              }}
              rows={2}
              autoFocus
              aria-label="Edit comment"
              className="w-full resize-none rounded-lg border border-orange-50/15 bg-white/4 px-2.5 py-2 text-[12.5px] text-neutral-100 outline-hidden transition-colors duration-200 hover:border-orange-50/25 focus:border-white/25"
            />

            <div className="mt-1.5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDraft(comment.text);
                }}
                className="h-7 cursor-pointer rounded-none rounded-tl-lg rounded-br-lg border border-orange-50/20 px-2.5 text-[11px] text-neutral-300 transition-colors duration-200 hover:border-orange-50/35 hover:bg-white/4 hover:text-neutral-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={save}
                disabled={!draft.trim() || isSaving}
                className="flex h-7 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-white px-2.5 text-[11px] font-semibold text-black transition-colors duration-200 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-neutral-500"
              >
                {isSaving && (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={11}
                    strokeWidth={2}
                    className="animate-spin"
                  />
                )}
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap wrap-break-word text-[12.5px] leading-5 text-neutral-300">
            {comment.text}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-1">
          <CommentVotes
            likeCount={comment.likeCount}
            dislikeCount={comment.dislikeCount}
            userAction={comment.userAction}
            onVote={(action) => onVote(comment.id, action)}
            disabled={isVoting}
          />

          <Tooltip label="Reply" side="top" size="sm">
            <button
              type="button"
              onClick={() => setReplyOpen((previous) => !previous)}
              aria-expanded={replyOpen}
              className={[
                "flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[11px] transition-colors duration-200",
                replyOpen
                  ? "text-orange-100"
                  : "text-neutral-500 hover:bg-white/5 hover:text-neutral-200",
              ].join(" ")}
            >
              <HugeiconsIcon icon={ReplyIcon} size={12} strokeWidth={1.8} />
              Reply
            </button>
          </Tooltip>

          {hasReplies && (
            <Tooltip
              label={repliesOpen ? "Hide replies" : "View replies"}
              side="top"
              size="sm"
            >
              <button
                type="button"
                onClick={() => setRepliesOpen((previous) => !previous)}
                aria-expanded={repliesOpen}
                className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[11px] text-neutral-400 transition-colors duration-200 hover:bg-white/5 hover:text-orange-100"
              >
                <HugeiconsIcon
                  icon={repliesOpen ? ArrowDown01Icon : Message01Icon}
                  size={12}
                  strokeWidth={1.8}
                />
                {comment.repliesCount}{" "}
                {comment.repliesCount === 1 ? "reply" : "replies"}
              </button>
            </Tooltip>
          )}
        </div>

        {replyOpen && (
          <div className="mt-2">
            <textarea
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setReplyOpen(false);
                  setReplyText("");
                }
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitReply();
                }
              }}
              rows={2}
              autoFocus
              placeholder={`Reply to ${comment.authorName}…`}
              aria-label={`Reply to ${comment.authorName}`}
              className="w-full resize-none rounded-lg border border-orange-50/15 bg-white/4 px-2.5 py-2 text-[12.5px] text-neutral-100 outline-hidden transition-colors duration-200 placeholder:text-neutral-600 hover:border-orange-50/25 focus:border-white/25"
            />

            <div className="mt-1.5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setReplyOpen(false);
                  setReplyText("");
                }}
                className="h-7 cursor-pointer rounded-none rounded-tl-lg rounded-br-lg border border-orange-50/20 px-2.5 text-[11px] text-neutral-300 transition-colors duration-200 hover:border-orange-50/35 hover:bg-white/4 hover:text-neutral-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitReply}
                disabled={!replyText.trim() || createReply.isPending}
                className="flex h-7 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-white px-2.5 text-[11px] font-semibold text-black transition-colors duration-200 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-neutral-500"
              >
                {createReply.isPending && (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={11}
                    strokeWidth={2}
                    className="animate-spin"
                  />
                )}
                Reply
              </button>
            </div>
          </div>
        )}

        {repliesOpen && (
          <CommentReplies
            commentId={comment.id}
            cardId={cardId}
            currentUserId={currentUserId}
            onVote={onVote}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </div>
    </article>
  );
}
