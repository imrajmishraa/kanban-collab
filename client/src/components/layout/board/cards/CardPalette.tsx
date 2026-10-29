import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Cancel01Icon,
  Delete02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import CardAttachments from "./attachments/CardAttachments";
import CardComments from "./comments/CardComments";
import CardEditorContent from "./CardEditorContent";
import CardEditorMeta from "./CardEditorMeta";

import { avatarColor } from "@/features/boards/board.helpers";

import type { BoardMember } from "@/features/boards/board.helpers";
import type {
  BoardCard,
  BoardColumn as BoardColumnType,
} from "@/types/api/dashboard/board";

interface CardPaletteProps {
  columns: BoardColumnType[];
  members: BoardMember[];
  /** Opened from a card click, so start in the editor rather than the list. */
  initialCard?: BoardCard;
  onSave: (card: BoardCard) => void;
  onDelete?: (cardId: string) => void;
  onClose: () => void;
}

interface Row {
  card: BoardCard;
  columnName: string;
}

/**
 * Command box for cards, opened with ⌘K on a board.
 *
 * Same shape as the search palette: a filter row, a keyboard-navigable list,
 * and a footer of hints. Choosing a card swaps the list for the editor, which
 * is the two halves of `CardDetailModal` (`CardEditorContent` and
 * `CardEditorMeta`) rendered inside the box rather than in a separate modal.
 */
export default function CardPalette({
  columns,
  members,
  initialCard,
  onSave,
  onDelete,
  onClose,
}: CardPaletteProps) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [editing, setEditing] = useState<BoardCard | null>(initialCard ?? null);

  const [draft, setDraft] = useState<BoardCard | null>(initialCard ?? null);
  const [labelInput, setLabelInput] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  /* Edit, comments and attachments are three tabs of one box, so a card can be
     finished without leaving the palette. */
  const [tab, setTab] = useState<"edit" | "comments" | "attachments">("edit");

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const rows = useMemo<Row[]>(() => {
    const needle = query.trim().toLowerCase();

    return columns
      .flatMap((column) =>
        column.cards.map((card) => ({ card, columnName: column.name })),
      )
      .filter((row) =>
        needle ? row.card.title.toLowerCase().includes(needle) : true,
      )
      .slice(0, 40);
  }, [columns, query]);

  /* Render-phase reset instead of an effect: a new query or a new card must
     not keep a stale cursor or a stale draft. */
  const signature = `${query}|${editing?.id ?? "none"}`;
  const [lastSignature, setLastSignature] = useState(signature);
  if (signature !== lastSignature) {
    setLastSignature(signature);
    setCursor(0);
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (editing) {
          setEditing(null);
          setDraft(null);
          return;
        }
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [editing, onClose]);

  const startEditing = (card: BoardCard) => {
    setEditing(card);
    setDraft(card);
    setLabelInput("");
    setChecklistInput("");
    setTab("edit");
  };

  const toggleMember = (memberId: string) =>
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            members: prev.members.includes(memberId)
              ? prev.members.filter((id) => id !== memberId)
              : [...prev.members, memberId],
          }
        : prev,
    );

  const addLabel = () => {
    const value = labelInput.trim().toLowerCase();
    if (!value) return;

    setDraft((prev) =>
      prev
        ? {
            ...prev,
            labels: prev.labels.includes(value)
              ? prev.labels
              : [...prev.labels, value],
          }
        : prev,
    );
    setLabelInput("");
  };

  const addChecklistItem = () => {
    const value = checklistInput.trim();
    if (!value) return;

    setDraft((prev) =>
      prev
        ? {
            ...prev,
            checklists: [
              ...prev.checklists,
              { title: value, isCompleted: false },
            ],
          }
        : prev,
    );
    setChecklistInput("");
  };

  const toggleCheck = (index: number) =>
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            checklists: prev.checklists.map((item, position) =>
              position === index
                ? { ...item, isCompleted: !item.isCompleted }
                : item,
            ),
          }
        : prev,
    );

  const removeCheck = (index: number) =>
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            checklists: prev.checklists.filter(
              (_, position) => position !== index,
            ),
          }
        : prev,
    );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft || !draft.title.trim()) return;

    onSave({ ...draft, title: draft.title.trim() });
    onClose();
  };

  const candidates = useMemo(() => {
    const map = new Map<string, BoardMember>();

    members.forEach((member) => map.set(member.id, member));
    draft?.members.forEach((id) => {
      if (!map.has(id)) map.set(id, { id, name: id, color: avatarColor(id) });
    });

    return [...map.values()];
  }, [members, draft?.members]);

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-[12vh] backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={editing ? "Edit card" : "Find a card"}
        className="w-full max-w-xl overflow-hidden rounded-xl border border-orange-50/15 bg-[#0a0a0a]/95 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200"
      >
        {/* Filter row */}
        <div className="flex items-center gap-2 border-b border-orange-50/10 px-3 py-2.5">
          {editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setDraft(null);
              }}
              aria-label="Back to the card list"
              className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200"
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={13}
                strokeWidth={2}
                className="rotate-180"
              />
            </button>
          ) : (
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              strokeWidth={1.6}
              className="shrink-0 text-neutral-600"
            />
          )}

          {editing ? (
            <p className="min-w-0 flex-1 truncate text-[12.5px] text-neutral-300">
              {editing.title}
            </p>
          ) : (
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setCursor((previous) =>
                    Math.min(previous + 1, rows.length - 1),
                  );
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setCursor((previous) => Math.max(previous - 1, 0));
                }
                if (event.key === "Enter" && rows[cursor]) {
                  event.preventDefault();
                  startEditing(rows[cursor].card);
                }
              }}
              placeholder="Find a card to edit"
              aria-label="Find a card"
              className="min-w-0 flex-1 bg-transparent text-[13px] tracking-tight text-neutral-100 placeholder:text-neutral-600 outline-hidden ring-0 focus:outline-hidden focus:ring-0 focus-visible:outline-hidden"
            />
          )}

          <kbd className="shrink-0 rounded border border-orange-50/15 bg-white/6 px-1 py-0.5 font-mono text-[9px] text-neutral-500">
            Esc
          </kbd>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
          </button>
        </div>

        {editing && draft ? (
          <>
            <div className="flex items-center gap-1 border-b border-orange-50/10 px-2 py-1.5">
              {(
                [
                  ["edit", "Edit"],
                  ["comments", "Comments"],
                  ["attachments", "Attachments"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-pressed={tab === key}
                  className={[
                    "h-7 cursor-pointer rounded-md px-2.5 text-[11.5px] transition-colors duration-200",
                    tab === key
                      ? "bg-white/8 text-orange-100"
                      : "text-neutral-500 hover:bg-white/5 hover:text-neutral-200",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "comments" ? (
              <div className="max-h-[58vh] overflow-y-auto p-4">
                <CardComments cardId={editing.id} />
              </div>
            ) : tab === "attachments" ? (
              <div className="max-h-[58vh] overflow-y-auto p-4">
                <CardAttachments cardId={editing.id} />
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="max-h-[58vh] overflow-y-auto p-4">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <CardEditorContent
                      draft={draft}
                      setDraft={(value) =>
                        setDraft((prev) =>
                          prev
                            ? typeof value === "function"
                              ? value(prev)
                              : value
                            : prev,
                        )
                      }
                      checklistInput={checklistInput}
                      setChecklistInput={setChecklistInput}
                      addChecklistItem={addChecklistItem}
                      toggleCheck={toggleCheck}
                      removeCheck={removeCheck}
                    />

                    <CardEditorMeta
                      draft={draft}
                      setDraft={(value) =>
                        setDraft((prev) =>
                          prev
                            ? typeof value === "function"
                              ? value(prev)
                              : value
                            : prev,
                        )
                      }
                      members={candidates}
                      labelInput={labelInput}
                      setLabelInput={setLabelInput}
                      addLabel={addLabel}
                      toggleMember={toggleMember}
                    />
                  </div>
                </div>

                <footer className="flex items-center justify-between gap-2 border-t border-orange-50/10 px-4 py-2.5">
                  {onDelete ? (
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(draft.id);
                        onClose();
                      }}
                      className="flex cursor-pointer items-center gap-1.5 text-[10px] uppercase tracking-wider text-rose-300 transition-opacity duration-200 hover:opacity-80"
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={13}
                        strokeWidth={1.6}
                      />
                      Delete
                    </button>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="h-8 cursor-pointer rounded-none rounded-tl-lg rounded-br-lg border border-orange-50/20 px-3 text-[11.5px] text-neutral-300 transition-colors duration-200 hover:border-orange-50/35 hover:bg-white/4 hover:text-neutral-100"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!draft.title.trim()}
                      className="h-8 cursor-pointer rounded-none rounded-tr-lg rounded-bl-lg bg-white px-3 text-[11.5px] font-semibold text-black transition-colors duration-200 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-neutral-500"
                    >
                      Save card
                    </button>
                  </div>
                </footer>
              </form>
            )}
          </>
        ) : (
          <>
            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-1">
              {rows.length === 0 ? (
                <p className="px-2 py-6 text-center text-[12px] text-neutral-500">
                  {query.trim()
                    ? `No cards match “${query.trim()}”`
                    : "This board has no cards yet"}
                </p>
              ) : (
                rows.map((row, index) => (
                  <button
                    key={row.card.id}
                    type="button"
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => startEditing(row.card)}
                    className={[
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150",
                      index === cursor ? "bg-white/[0.07]" : "",
                    ].join(" ")}
                  >
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-neutral-200">
                      {row.card.title}
                    </span>

                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-neutral-600">
                      {row.columnName}
                    </span>
                  </button>
                ))
              )}
            </div>

            <footer className="flex items-center gap-3 border-t border-orange-50/10 px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-neutral-600">
              <span>↑↓ navigate</span>
              <span>↵ edit</span>
              <span>esc close</span>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
