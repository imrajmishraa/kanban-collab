import { HugeiconsIcon } from "@hugeicons/react";
import { ListChecksIcon } from "@hugeicons/core-free-icons";
import type { DragEvent } from "react";

import { AvatarStack } from "./BoardAvatar";

import {
  formatDue,
  isOverdue,
  labelColor,
} from "@/features/boards/board.helpers";

import type { BoardCard } from "@/types/api/dashboard/board";

interface BoardCardItemProps {
  card: BoardCard;
  draggable: boolean;
  isDragging: boolean;
  onOpen: (card: BoardCard) => void;
  onDragStart: (card: BoardCard, event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  onDragOverCard: (columnId: string, index: number) => void;
}

export default function BoardCardItem({
  card,
  draggable,
  isDragging,
  onOpen,
  onDragStart,
  onDragEnd,
  onDragOverCard,
}: BoardCardItemProps) {
  const totalChecks = card.checklists.length;
  const doneChecks = card.checklists.filter((c) => c.isCompleted).length;
  const progress =
    totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;
  const overdue = isOverdue(card.dueDate);

  return (
    <article
      draggable={draggable}
      onDragStart={(event) => onDragStart(card, event)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        if (!draggable) return;
        event.preventDefault();
        event.stopPropagation();
        onDragOverCard(card.columnId, card.orderIndex);
      }}
      onClick={() => onOpen(card)}
      className={[
        "group/card cursor-pointer rounded-lg border border-white/8 bg-white/3 p-3 text-left",
        "transition-colors duration-200 hover:border-white/14 hover:bg-white/6",
        isDragging ? "opacity-40" : "opacity-100",
      ].join(" ")}
    >
      {card.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.labels.map((label) => (
            <span
              key={label}
              className="rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest"
              style={{
                color: labelColor(label),
                background: `${labelColor(label)}1f`,
                border: `1px solid ${labelColor(label)}40`,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <p className="font-mono text-[12px] font-medium leading-5 text-(--text-primary)">
        {card.title}
      </p>

      {card.description && (
        <p className="mt-1.5 line-clamp-2 font-mono text-[11px] leading-5 text-(--text-secondary)">
          {card.description}
        </p>
      )}

      {totalChecks > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between font-mono text-[9px] text-(--text-muted)">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <HugeiconsIcon
                icon={ListChecksIcon}
                size={11}
                strokeWidth={1.7}
              />
              {doneChecks}/{totalChecks}
            </span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: "var(--brand)" }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        {card.dueDate ? (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[9px] tabular-nums"
            style={{
              color: overdue ? "var(--danger)" : "var(--text-muted)",
              background: overdue ? "rgba(241,107,122,0.1)" : "transparent",
            }}
          >
            {formatDue(card.dueDate)}
          </span>
        ) : (
          <span />
        )}

        <AvatarStack ids={card.members} />
      </div>
    </article>
  );
}
