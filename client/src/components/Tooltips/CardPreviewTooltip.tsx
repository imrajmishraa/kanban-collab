import type { ReactNode } from "react";

import { Tooltip } from "@/components/Tooltips/ToolTip";
import { dueDateCopy } from "@/lib/kanbanTooltipText";

/**
 * A card, on hover.
 *
 * The board's cards show a title and almost nothing else — the assignees, the due date and
 * the counts are one hover away. This is that hover: the same fields, in the same order, at a
 * size that fits a bubble.
 */
export interface CardPreview {
  title: string;
  description?: string;
  assignees?: { name: string; avatar?: string }[];
  due?: Date | string | number;
  labels?: string[];
  counts?: { cards?: number; comments?: number; attachments?: number };
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function CardPreviewTooltip({
  card,
  children,
  side,
}: {
  card: CardPreview;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const due = card.due !== undefined ? dueDateCopy(card.due) : null;
  const counts = card.counts;

  const body = (
    <span className="block w-56 text-left">
      <span className="block text-[12px] font-medium text-(--text-primary)">
        {card.title}
      </span>

      {card.description ? (
        <span className="mt-0.5 block text-[11px] text-(--text-muted)">
          {card.description}
        </span>
      ) : null}

      {due ? (
        <span
          className="mt-1.5 block text-[11px]"
          style={{
            color:
              due.tone === "danger"
                ? "var(--danger)"
                : due.tone === "warning"
                  ? "var(--warning)"
                  : "var(--text-muted)",
          }}
        >
          {due.label}
        </span>
      ) : null}

      {card.labels?.length ? (
        <span className="mt-1.5 flex flex-wrap gap-1">
          {card.labels.map((label) => (
            <span
              key={label}
              className="rounded-full border border-(--hairline) px-1.5 py-0.5 text-[10px] text-(--text-muted)"
            >
              {label}
            </span>
          ))}
        </span>
      ) : null}

      {card.assignees?.length ? (
        <span className="mt-1.5 flex items-center gap-1">
          {card.assignees.slice(0, 3).map((person) =>
            person.avatar ? (
              <img
                key={person.name}
                src={person.avatar}
                alt={person.name}
                className="size-4 rounded-full object-cover"
              />
            ) : (
              <span
                key={person.name}
                className="grid size-4 place-items-center rounded-full bg-(--bg-hover) text-[8px] text-(--text-secondary)"
              >
                {initials(person.name)}
              </span>
            ),
          )}
          {card.assignees.length > 3 ? (
            <span className="text-[10px] text-(--text-muted)">
              +{card.assignees.length - 3}
            </span>
          ) : null}
        </span>
      ) : null}

      {counts ? (
        <span className="mt-1.5 flex gap-2 border-t border-current/10 pt-1.5 text-[10px] text-(--text-muted)">
          {counts.cards !== undefined ? (
            <span>{counts.cards} cards</span>
          ) : null}
          {counts.comments !== undefined ? (
            <span>{counts.comments} comments</span>
          ) : null}
          {counts.attachments !== undefined ? (
            <span>{counts.attachments} files</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );

  return (
    <Tooltip
      label={body}
      side={side}
      shape="card"
      maxWidth={260}
      interactive
      actions={undefined}
    >
      {children}
    </Tooltip>
  );
}
