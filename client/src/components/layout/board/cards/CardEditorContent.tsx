import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import type { Dispatch, SetStateAction } from "react";
import type { BoardCard } from "@/types/api/dashboard/board";

export const editorLabel = "block text-[11px] font-medium text-(--text-soft)";

export const editorField =
  "h-10 w-full rounded-lg border border-(--hairline) bg-(--tint-4) px-3 text-[13px] text-(--text-primary) outline-hidden transition-colors duration-200 placeholder:text-(--text-subtle) hover:border-(--hairline-strong) focus:border-(--border-strong) focus:bg-(--tint-5)";

export const editorSmallField =
  "h-8 min-w-0 flex-1 rounded-lg border border-(--hairline) bg-(--tint-4) px-2 text-[11.5px] text-(--text-primary) outline-hidden transition-colors placeholder:text-(--text-subtle) hover:border-(--hairline-strong) focus:border-(--border-strong)";

export const editorAddButton =
  "cursor-pointer rounded-lg border border-(--hairline) px-2.5 py-1 text-[10px] uppercase tracking-wider text-(--text-secondary) transition-colors duration-200 hover:border-(--hairline-strong) hover:bg-(--tint-6) hover:text-(--text-primary)";

interface CardEditorContentProps {
  draft: BoardCard;
  setDraft: Dispatch<SetStateAction<BoardCard>>;
  checklistInput: string;
  setChecklistInput: (value: string) => void;
  addChecklistItem: () => void;
  toggleCheck: (index: number) => void;
  removeCheck: (index: number) => void;
}

/**
 * The writing half of the card editor: title, description and checklist.
 *
 * Split out of `CardDetailModal` so the metadata column (due date, labels,
 * members) can change without touching this, and so a compact palette can
 * render just this part.
 */
export default function CardEditorContent({
  draft,
  setDraft,
  checklistInput,
  setChecklistInput,
  addChecklistItem,
  toggleCheck,
  removeCheck,
}: CardEditorContentProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="card-title" className={editorLabel}>
          Title
        </label>
        <input
          id="card-title"
          value={draft.title}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, title: event.target.value }))
          }
          className={editorField}
          maxLength={200}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="card-desc" className={editorLabel}>
          Description
        </label>
        <textarea
          id="card-desc"
          value={draft.description}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, description: event.target.value }))
          }
          rows={4}
          placeholder="Add a more detailed description…"
          className="w-full resize-none rounded-lg border border-(--hairline) bg-(--tint-4) p-3 text-[12.5px] leading-5 text-(--text-primary) outline-hidden transition-colors duration-200 placeholder:text-(--text-subtle) hover:border-(--hairline-strong) focus:border-(--border-strong)"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={editorLabel}>Checklist</span>

          {draft.checklists.length > 0 && (
            <span className="font-mono text-[10px] tabular-nums text-(--text-muted)">
              {draft.checklists.filter((item) => item.isCompleted).length}/
              {draft.checklists.length}
            </span>
          )}
        </div>

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
                aria-label={
                  item.isCompleted ? "Mark as not done" : "Mark as done"
                }
                className={[
                  "flex size-4 shrink-0 cursor-pointer items-center justify-center rounded border text-[9px] transition-colors duration-200",
                  item.isCompleted
                    ? "border-(--accent-soft) bg-(--accent)/20 text-(--accent)"
                    : "border-(--hairline-strong) text-transparent hover:border-(--hairline-strong)",
                ].join(" ")}
              >
                ✓
              </button>

              <span
                className={[
                  "min-w-0 flex-1 text-[11.5px]",
                  item.isCompleted
                    ? "text-(--text-muted) line-through"
                    : "text-(--text-soft)",
                ].join(" ")}
              >
                {item.title}
              </span>

              <button
                type="button"
                onClick={() => removeCheck(index)}
                aria-label="Remove item"
                className="cursor-pointer text-(--text-subtle) opacity-0 transition-opacity duration-200 group-hover/check:opacity-100 hover:text-(--danger)"
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
            <p className="text-[11.5px] text-(--text-subtle)">No items yet</p>
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
            aria-label="New checklist item"
            className={editorSmallField}
          />
          <button
            type="button"
            onClick={addChecklistItem}
            className={editorAddButton}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
