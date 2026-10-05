import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Delete02Icon } from "@hugeicons/core-free-icons";

import { Avatar } from "./BoardAvatar";

import { avatarColor, labelColor, ui } from "@/features/boards/board.helpers";

import type { BoardMember } from "@/features/boards/board.helpers";
import type { BoardCard } from "@/types/api/dashboard/board";

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

const fieldClass =
  "h-10 w-full rounded-lg border border-white/8 bg-white/4 px-3 font-mono text-[12px] text-(--text-primary) outline-none transition-colors duration-200 placeholder:text-(--text-muted) hover:border-white/14 focus:border-(--brand-border)";

const label =
  "block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-(--text-muted)";

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

  // Parent remounts with key={card.id}; draft is seeded on mount.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Workspace members, plus any id already on the card so it can be removed. */
  const candidates = useMemo(() => {
    const map = new Map<string, BoardMember>();
    members.forEach((member) => map.set(member.id, member));
    draft.members.forEach((id) => {
      if (!map.has(id)) map.set(id, { id, color: avatarColor(id) });
    });
    return Array.from(map.values());
  }, [members, draft.members]);

  const toggleMember = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      members: prev.members.includes(id)
        ? prev.members.filter((m) => m !== id)
        : [...prev.members, id],
    }));
  };

  const addLabel = () => {
    const value = labelInput.trim();
    if (!value || draft.labels.includes(value)) return;
    setDraft((prev) => ({ ...prev, labels: [...prev.labels, value] }));
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

  const toggleCheck = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      checklists: prev.checklists.map((item, i) =>
        i === index ? { ...item, isCompleted: !item.isCompleted } : item,
      ),
    }));
  };

  const removeCheck = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      checklists: prev.checklists.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    onSave({
      ...draft,
      title: draft.title.trim(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-[2px] sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-detail-title"
        className="relative my-8 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-(--bg-elevated) shadow-2xl shadow-black/60"
      >
        <span aria-hidden="true" className={ui.hairline} />

        <header className="flex items-start justify-between border-b border-white/6 px-5 py-4">
          <div className="min-w-0 pr-4">
            <div className="mb-2 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full"
                style={{ background: "var(--brand)" }}
              />
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-muted)">
                Card
              </p>
            </div>
            <h2
              id="card-detail-title"
              className="font-mono text-[13px] font-semibold text-(--text-primary)"
            >
              Edit card
            </h2>
            {watchers && watchers.length > 0 && (
              <p className="mt-1 font-mono text-[10px] text-(--text-muted)">
                {watchers.length === 1
                  ? `${watchers[0]?.name ?? "Someone"} is viewing`
                  : `${watchers.length} others viewing`}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-(--text-muted) transition-colors hover:bg-white/6 hover:text-(--text-primary)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={17} strokeWidth={1.6} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
            <div className="space-y-1.5">
              <label htmlFor="card-title" className={label}>
                Title
              </label>
              <input
                id="card-title"
                value={draft.title}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, title: event.target.value }))
                }
                className={fieldClass}
                maxLength={200}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="card-desc" className={label}>
                Description
              </label>
              <textarea
                id="card-desc"
                value={draft.description}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={3}
                placeholder="Add a more detailed description…"
                className="w-full resize-none rounded-lg border border-white/8 bg-white/4 p-3 font-mono text-[12px] leading-5 text-(--text-primary) outline-none transition-colors duration-200 placeholder:text-(--text-muted) hover:border-white/14 focus:border-(--brand-border)"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="card-due" className={label}>
                  Due date
                </label>
                <input
                  id="card-due"
                  type="date"
                  value={draft.dueDate ? draft.dueDate.slice(0, 10) : ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      dueDate: event.target.value
                        ? new Date(event.target.value).toISOString()
                        : undefined,
                    }))
                  }
                  className={fieldClass}
                />
              </div>

              <div className="space-y-1.5">
                <span className={label}>Labels</span>
                <div className="flex flex-wrap gap-1.5">
                  {draft.labels.map((item) => (
                    <button
                      key={item}
                      type="button"
                      title="Remove label"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          labels: prev.labels.filter((l) => l !== item),
                        }))
                      }
                      className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest"
                      style={{
                        color: labelColor(item),
                        background: `${labelColor(item)}1f`,
                        border: `1px solid ${labelColor(item)}40`,
                      }}
                    >
                      {item} ×
                    </button>
                  ))}
                  {draft.labels.length === 0 && (
                    <span className="font-mono text-[10px] text-(--text-muted)">
                      None
                    </span>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    value={labelInput}
                    onChange={(event) => setLabelInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addLabel();
                      }
                    }}
                    placeholder="Add label…"
                    className="h-8 min-w-0 flex-1 rounded-lg border border-white/8 bg-white/4 px-2 font-mono text-[11px] text-(--text-primary) outline-none placeholder:text-(--text-muted) focus:border-(--brand-border)"
                  />
                  <button
                    type="button"
                    onClick={addLabel}
                    className="rounded-lg border border-white/8 px-2 font-mono text-[10px] uppercase tracking-wider text-(--text-secondary) transition-colors hover:bg-white/6 hover:text-(--text-primary)"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className={label}>Members</span>
              {candidates.length === 0 ? (
                <p className="font-mono text-[11px] text-(--text-muted)">
                  No workspace members available.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {candidates.map((member) => {
                    const active = draft.members.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleMember(member.id)}
                        className={[
                          "flex items-center gap-2 rounded-full border px-2 py-1.5 font-mono text-[11px] transition-colors duration-200",
                          active
                            ? "border-(--brand-border) bg-(--brand-muted) text-(--text-primary)"
                            : "border-white/8 text-(--text-secondary) hover:border-white/16 hover:text-(--text-primary)",
                        ].join(" ")}
                      >
                        <Avatar member={member} size={18} ring={false} />
                        {member.name ?? member.id}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className={label}>Checklist</span>
              <div className="space-y-1">
                {draft.checklists.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="group/check flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCheck(index)}
                      aria-pressed={item.isCompleted}
                      className={[
                        "flex size-4 shrink-0 items-center justify-center rounded border font-mono text-[9px] transition-colors",
                        item.isCompleted
                          ? "border-(--brand) bg-(--brand) text-black"
                          : "border-white/16 text-transparent hover:border-(--brand-border)",
                      ].join(" ")}
                    >
                      ✓
                    </button>
                    <span
                      className={[
                        "min-w-0 flex-1 font-mono text-[11px]",
                        item.isCompleted
                          ? "text-(--text-muted) line-through"
                          : "text-(--text-secondary)",
                      ].join(" ")}
                    >
                      {item.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCheck(index)}
                      aria-label="Remove item"
                      className="text-(--text-muted) opacity-0 transition-opacity group-hover/check:opacity-100 hover:text-(--danger)"
                    >
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        size={13}
                        strokeWidth={1.6}
                      />
                    </button>
                  </div>
                ))}
                {draft.checklists.length === 0 && (
                  <p className="font-mono text-[11px] text-(--text-muted)">
                    No items yet.
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  value={checklistInput}
                  onChange={(event) => setChecklistInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addChecklistItem();
                    }
                  }}
                  placeholder="Add item…"
                  className="h-8 min-w-0 flex-1 rounded-lg border border-white/8 bg-white/4 px-2 font-mono text-[11px] text-(--text-primary) outline-none placeholder:text-(--text-muted) focus:border-(--brand-border)"
                />
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="rounded-lg border border-white/8 px-2 font-mono text-[10px] uppercase tracking-wider text-(--text-secondary) transition-colors hover:bg-white/6 hover:text-(--text-primary)"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <footer className="flex items-center justify-between border-t border-white/6 bg-white/2 px-5 py-3">
            <button
              type="button"
              onClick={() => onDelete(draft.id)}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-(--danger) transition-opacity hover:opacity-80"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={1.6} />
              Delete
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-full border border-white/8 bg-white/6 px-4 font-mono text-[11px] text-(--text-secondary) transition-colors hover:bg-white/10 hover:text-(--text-primary)"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!draft.title.trim()}
                className="h-9 rounded-full border border-(--brand-border) bg-(--brand-muted) px-4 font-mono text-[11px] text-(--brand-hover) transition-colors hover:bg-[rgba(255,107,53,0.18)] hover:text-(--text-primary) disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-transparent disabled:text-(--text-muted)"
              >
                Save changes
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
