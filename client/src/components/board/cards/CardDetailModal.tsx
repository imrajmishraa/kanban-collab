import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Delete02Icon,
  File02Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";

import { CardAttachmentsDialog } from "@/features/boards";
import { CardCommentsDialog } from "@/features/boards";
import { CardEditorContent } from "@/features/boards";
import { CardEditorMeta } from "@/features/boards";

import { Tooltip } from "@/components/Tooltips/ToolTip";

import { Avatar } from "@/components/board/BoardAvatar";

import { avatarColor } from "@/features/boards";

import type { BoardMember } from "@/features/boards";
import type { BoardCard } from "@/types/board";

interface CardDetailModalProps {
  card: BoardCard;
  /** Real members of the active workspace (may be empty). */
  members: BoardMember[];
  /** Remote peers currently viewing this card (T7 awareness). */
  watchers?: Array<{ userId: string; name?: string; color?: string }>;
  onClose: () => void;
  onSave: (card: BoardCard) => void;
  onDelete: (cardId: string) => void;
}

/**
 * Card editor shell.
 *
 * The fields live in `CardEditorContent` (title, description, checklist) and
 * `CardEditorMeta` (due date, labels, members); this file owns the state, the
 * submit path and the surrounding chrome.
 */
export default function CardDetailModal({
  card,
  members,
  watchers,
  onClose,
  onSave,
  onDelete,
}: CardDetailModalProps) {
  const [draft, setDraft] = useState<BoardCard>(card);
  const [labelInput, setLabelInput] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [panel, setPanel] = useState<"comments" | "attachments" | null>(null);

  // Escape closes, as with every other dialog in the app.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  /* Members already on the card but not in the workspace list still need a
     row, otherwise they cannot be removed. */
  const candidates = useMemo(() => {
    const map = new Map<string, BoardMember>();

    members.forEach((member) => map.set(member.id, member));
    draft.members.forEach((id) => {
      if (!map.has(id)) {
        map.set(id, { id, name: undefined, color: avatarColor(id) });
      }
    });

    return [...map.values()];
  }, [members, draft.members]);

  const toggleMember = (memberId: string) =>
    setDraft((prev) => ({
      ...prev,
      members: prev.members.includes(memberId)
        ? prev.members.filter((id) => id !== memberId)
        : [...prev.members, memberId],
    }));

  const addLabel = () => {
    const value = labelInput.trim().toLowerCase();
    if (!value) return;

    setDraft((prev) => ({
      ...prev,
      labels: prev.labels.includes(value)
        ? prev.labels
        : [...prev.labels, value],
    }));
    setLabelInput("");
  };

  const addChecklistItem = () => {
    const value = checklistInput.trim();
    if (!value) return;

    setDraft((prev) => ({
      ...prev,
      checklists: [...prev.checklists, { title: value, isCompleted: false }],
    }));
    setChecklistInput("");
  };

  const toggleCheck = (index: number) =>
    setDraft((prev) => ({
      ...prev,
      checklists: prev.checklists.map((item, position) =>
        position === index ? { ...item, isCompleted: !item.isCompleted } : item,
      ),
    }));

  const removeCheck = (index: number) =>
    setDraft((prev) => ({
      ...prev,
      checklists: prev.checklists.filter((_, position) => position !== index),
    }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    onSave({ ...draft, title: draft.title.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-[2px] sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-detail-title"
        className="relative my-6 w-full max-w-xl overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-root)/95 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200"
      >
        <header className="flex items-start justify-between gap-3 border-b border-(--hairline) px-4 py-3">
          <div className="min-w-0 pr-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-(--text-muted)">
              Card
            </p>

            <h2
              id="card-detail-title"
              className="mt-1 text-[15px] font-medium tracking-tight text-(--text-primary)"
            >
              Edit card
            </h2>

            {watchers && watchers.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="flex items-center">
                  {watchers.slice(0, 3).map((watcher, index) => (
                    <span
                      key={watcher.userId}
                      style={{ marginLeft: index === 0 ? 0 : -6 }}
                    >
                      <Avatar
                        member={{
                          id: watcher.userId,
                          name: watcher.name,
                          color: watcher.color ?? avatarColor(watcher.userId),
                        }}
                        size={18}
                      />
                    </span>
                  ))}
                </span>

                <p className="text-[11px] text-(--text-muted)">
                  {watchers.length === 1
                    ? `${watchers[0]?.name ?? "Someone"} is viewing`
                    : `${watchers.length} others viewing`}
                </p>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Tooltip
              label="Comments"
              highlight="and replies"
              side="bottom"
              size="sm"
            >
              <button
                type="button"
                onClick={() => setPanel("comments")}
                aria-label="Comments"
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-(--text-muted) transition-colors duration-200 hover:bg-(--bg-hover) hover:text-(--text-primary)"
              >
                <HugeiconsIcon
                  icon={Message01Icon}
                  size={14}
                  strokeWidth={1.7}
                />
              </button>
            </Tooltip>

            <Tooltip
              label="Attachments"
              highlight="files"
              side="bottom"
              size="sm"
            >
              <button
                type="button"
                onClick={() => setPanel("attachments")}
                aria-label="Attachments"
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-(--text-muted) transition-colors duration-200 hover:bg-(--bg-hover) hover:text-(--text-primary)"
              >
                <HugeiconsIcon icon={File02Icon} size={14} strokeWidth={1.7} />
              </button>
            </Tooltip>

            <span
              aria-hidden="true"
              className="mx-0.5 h-4 w-px bg-(--hairline)"
            />

            <Tooltip label="Close" highlight="esc" side="bottom" size="sm">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-(--text-muted) transition-colors duration-200 hover:bg-(--bg-hover) hover:text-(--text-primary)"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={14}
                  strokeWidth={1.8}
                />
              </button>
            </Tooltip>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[58vh] space-y-5 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <CardEditorContent
                draft={draft}
                setDraft={setDraft}
                checklistInput={checklistInput}
                setChecklistInput={setChecklistInput}
                addChecklistItem={addChecklistItem}
                toggleCheck={toggleCheck}
                removeCheck={removeCheck}
              />

              <CardEditorMeta
                draft={draft}
                setDraft={setDraft}
                members={candidates}
                labelInput={labelInput}
                setLabelInput={setLabelInput}
                addLabel={addLabel}
                toggleMember={toggleMember}
              />
            </div>
          </div>

          <footer className="flex items-center justify-between border-t border-(--hairline) bg-(--tint-2) px-4 py-2.5">
            <button
              type="button"
              onClick={() => onDelete(draft.id)}
              className="flex cursor-pointer items-center gap-1.5 text-[10px] uppercase tracking-wider text-(--danger) transition-opacity duration-200 hover:opacity-80"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={1.6} />
              Delete
            </button>

            <div className="flex items-center gap-2">
              <kbd className="hidden rounded border border-(--hairline) bg-(--tint-6) px-1 py-0.5 font-mono text-[9px] text-(--text-muted) sm:block">
                Esc
              </kbd>

              <button
                type="button"
                onClick={onClose}
                className="h-9 cursor-pointer rounded-none rounded-tl-lg rounded-br-lg border border-(--hairline-strong) px-4 text-[12px] text-(--text-soft) transition-colors duration-200 hover:border-(--hairline-strong) hover:bg-(--tint-4) hover:text-(--text-primary)"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!draft.title.trim()}
                className="h-9 cursor-pointer rounded-none rounded-tr-lg rounded-bl-lg bg-(--solid-bg) px-4 text-[12px] font-semibold text-(--solid-text) transition-colors duration-200 hover:bg-(--solid-bg-hover) disabled:cursor-not-allowed disabled:bg-(--tint-15) disabled:text-(--text-muted)"
              >
                Save changes
              </button>
            </div>
          </footer>
        </form>

        {panel === "comments" && (
          <CardCommentsDialog
            cardId={card.id}
            cardTitle={draft.title}
            onClose={() => setPanel(null)}
          />
        )}

        {panel === "attachments" && (
          <CardAttachmentsDialog
            cardId={card.id}
            cardTitle={draft.title}
            onClose={() => setPanel(null)}
          />
        )}
      </section>
    </div>
  );
}
