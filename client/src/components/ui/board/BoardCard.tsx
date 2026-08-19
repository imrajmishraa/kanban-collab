import { CalendarDays, CheckSquare } from "lucide-react";

import type { BoardCard as BoardCardType } from "@/types/api/dashboard/board";

interface BoardCardProps {
  card: BoardCardType;
  onClick?: (card: BoardCardType) => void;
}

export default function BoardCard({ card, onClick }: BoardCardProps) {
  const checklistCount = card.checkLists.length;
  const labelCount = card.labels.length;

  const handleClick = () => {
    onClick?.(card);
  };

  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (!onClick) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(card);
        }
      }}
      className={[
        "group border border-neutral-800 bg-[#0d0d0d] p-3",
        "transition-colors duration-150",
        "hover:border-neutral-700 hover:bg-[#101010]",
        onClick
          ? "cursor-pointer focus:outline-none focus-visible:border-[#ff1f5a]/60"
          : "",
      ].join(" ")}
    >
      {/* Card ID */}
      <div className="font-mono text-[10px] uppercase tracking-wide text-neutral-700">
        {card.id}
      </div>

      {/* Title */}
      <h3 className="mt-2 text-sm font-medium leading-5 text-neutral-200">
        {card.title}
      </h3>

      {/* Description */}
      {card.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-neutral-600">
          {card.description}
        </p>
      )}

      {/* Labels / checklist / due date */}
      {(labelCount > 0 || checklistCount > 0 || card.dueDate) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Labels */}
          {labelCount > 0 && (
            <span className="border border-neutral-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-neutral-500">
              {labelCount} {labelCount === 1 ? "label" : "labels"}
            </span>
          )}

          {/* Checklist */}
          {checklistCount > 0 && (
            <span className="flex items-center gap-1 border border-neutral-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-neutral-500">
              <CheckSquare size={10} />

              {checklistCount}
            </span>
          )}

          {/* Due date */}
          {card.dueDate && (
            <span className="flex items-center gap-1 font-mono text-[9px] text-neutral-600">
              <CalendarDays size={10} />

              {formatDueDate(card.dueDate)}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function formatDueDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
  }).format(date);
}
