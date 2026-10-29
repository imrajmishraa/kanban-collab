import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import type { Dispatch, SetStateAction } from "react";
import type { BoardCard } from "@/types/api/dashboard/board";

export const editorLabel = "block text-[11px] font-medium text-neutral-300";

export const editorField =
  "h-10 w-full rounded-lg border border-orange-50/15 bg-white/[0.04] px-3 text-[13px] text-neutral-100 outline-none transition-colors duration-200 placeholder:text-neutral-600 hover:border-orange-50/25 focus:border-white/25 focus:bg-white/[0.05]";

export const editorSmallField =
  "h-8 min-w-0 flex-1 rounded-lg border border-orange-50/15 bg-white/[0.04] px-2 text-[11.5px] text-neutral-100 outline-none transition-colors placeholder:text-neutral-600 hover:border-orange-50/25 focus:border-white/25";

export const editorAddButton =
  "cursor-pointer rounded-lg border border-orange-50/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-neutral-400 transition-colors duration-200 hover:border-orange-50/30 hover:bg-white/[0.06] hover:text-neutral-100";

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
          className="w-full resize-none rounded-lg border border-orange-50/15 bg-white/4 p-3 text-[12.5px] leading-5 text-neutral-100 outline-none transition-colors duration-200 placeholder:text-neutral-600 hover:border-orange-50/25 focus:border-white/25"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={editorLabel}>Checklist</span>

          {draft.checklists.length > 0 && (
            <span className="font-mono text-[10px] tabular-nums text-neutral-500">
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
                    ? "border-orange-100/40 bg-orange-100/20 text-orange-100"
                    : "border-orange-50/20 text-transparent hover:border-orange-50/40",
                ].join(" ")}
              >
                ✓
              </button>

              <span
                className={[
                  "min-w-0 flex-1 text-[11.5px]",
                  item.isCompleted
                    ? "text-neutral-500 line-through"
                    : "text-neutral-300",
                ].join(" ")}
              >
                {item.title}
              </span>

              <button
                type="button"
                onClick={() => removeCheck(index)}
                aria-label="Remove item"
                className="cursor-pointer text-neutral-600 opacity-0 transition-opacity duration-200 group-hover/check:opacity-100 hover:text-rose-300"
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
            <p className="text-[11.5px] text-neutral-600">No items yet</p>
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
