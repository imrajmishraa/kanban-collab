import type { Dispatch, SetStateAction } from "react";

import { Avatar } from "@components/layout/board/BoardAvatar";
import {
  editorAddButton,
  editorField,
  editorLabel,
  editorSmallField,
} from "./CardEditorContent";

import { labelColor } from "@/features/boards/board.helpers";

import type { BoardMember } from "@/features/boards/board.helpers";
import type { BoardCard } from "@/types/api/dashboard/board";

interface CardEditorMetaProps {
  draft: BoardCard;
  setDraft: Dispatch<SetStateAction<BoardCard>>;
  members: BoardMember[];
  labelInput: string;
  setLabelInput: (value: string) => void;
  addLabel: () => void;
  toggleMember: (memberId: string) => void;
}

/**
 * The attribute half of the card editor: due date, labels and assignees.
 *
 * Kept apart from `CardEditorContent` because these are pickers over data,
 * not free text, and they are the part a compact palette would hide.
 */
export default function CardEditorMeta({
  draft,
  setDraft,
  members,
  labelInput,
  setLabelInput,
  addLabel,
  toggleMember,
}: CardEditorMetaProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="card-due" className={editorLabel}>
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
          className={editorField}
        />
      </div>

      <div className="space-y-1.5">
        <span className={editorLabel}>Labels</span>

        <div className="flex flex-wrap gap-1.5">
          {draft.labels.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  labels: prev.labels.filter((label) => label !== item),
                }))
              }
              aria-label={`Remove ${item} label`}
              className="cursor-pointer rounded-md px-2 py-0.5 text-[9px] uppercase tracking-wider transition-opacity duration-200 hover:opacity-80"
              style={{
                color: labelColor(item),
                background: "var(--tint-4)",
                border: `1px solid ${labelColor(item)}40`,
              }}
            >
              {item} ×
            </button>
          ))}

          {draft.labels.length === 0 && (
            <span className="text-[11px] text-(--text-subtle)">None</span>
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
            aria-label="New label"
            className={editorSmallField}
          />
          <button type="button" onClick={addLabel} className={editorAddButton}>
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <span className={editorLabel}>Members</span>

        {members.length === 0 ? (
          <p className="text-[11.5px] text-(--text-subtle)">
            No workspace members available
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {members.map((member) => {
              const active = draft.members.includes(member.id);

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  aria-pressed={active}
                  className={[
                    "flex max-w-full cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 text-[11.5px] transition-colors duration-200",
                    active
                      ? "border-(--accent-soft) bg-(--accent-soft) text-(--text-primary)"
                      : "border-(--hairline) text-(--text-secondary) hover:border-(--hairline-strong) hover:bg-(--tint-4) hover:text-(--text-primary)",
                  ].join(" ")}
                >
                  <Avatar member={member} size={18} ring={false} />
                  <span className="truncate">
                    {member.name ?? "Unknown member"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
