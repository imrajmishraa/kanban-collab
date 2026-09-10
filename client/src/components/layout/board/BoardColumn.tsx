import { HugeiconsIcon } from "@hugeicons/react";
import {
  MoreHorizontalIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import type { BoardCard as BoardCardType } from "@/types/api/dashboard/board";

interface BoardColumnProps {
  id: string;
  title: string;
  cards: BoardCardType[];
  onAddCard?: (columnId: string) => void;
  onCardClick?: (card: BoardCardType) => void;
}

export default function BoardColumn({
  id: _id,
  title,
  cards,
  onAddCard,
  onCardClick,
}: BoardColumnProps) {
  const sortedCards = [...cards].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  return (
    <section
      aria-label={`${title} column`}
      className="flex h-full w-75 shrink-0 flex-col border border-(--border) bg-(--surface-elevated)"
    >
      {/* Column header */}
      <header className="flex items-center justify-between border-b border-(--border) px-3 py-3">
        <div className="flex items-center gap-2">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-wide text-(--text-primary)">
            {title}
          </h2>

          <span className="font-mono text-[10px] text-(--text-muted)">
            {cards.length}
          </span>
        </div>

        <button
          type="button"
          aria-label={`${title} column actions`}
          className="flex h-7 w-7 items-center justify-center text-(--text-muted) transition hover:text-(--text-primary)"
        >
          <HugeiconsIcon
            icon={MoreHorizontalIcon}
            size={16}
            strokeWidth={1.5}
          />
        </button>
      </header>

      {/* Cards */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="flex min-h-full flex-col gap-2">
          {sortedCards.length > 0 ? (
            sortedCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => onCardClick?.(card)}
                className="w-full rounded-lg border border-(--border) bg-(--bg-surface) p-3 text-left transition hover:border-(--brand) hover:bg-(--brand-muted)"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-mono text-xs font-medium text-(--text-primary)">
                    {card.title}
                  </p>
                  {card.dueDate ? (
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--text-muted)">
                      {new Date(card.dueDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  ) : null}
                </div>

                {card.description ? (
                  <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-(--text-secondary)">
                    {card.description}
                  </p>
                ) : null}

                {card.labels.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {card.labels.slice(0, 3).map((label, index) => (
                      <span
                        key={`${card.id}-label-${index}`}
                        className="rounded-full border border-(--border) bg-(--surface-elevated) px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-(--text-muted)"
                      >
                        {typeof label === "string" ? label : "label"}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            ))
          ) : (
            <div
              className="flex min-h-24 flex-1 items-center justify-center border border-dashed border-(--border)"
              aria-label={`No cards in ${title}`}
            >
              <p className="font-mono text-[10px] uppercase tracking-wide text-(--text-muted)">
                No cards yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add card */}
      <footer className="border-t border-(--border) p-2">
        <button
          type="button"
          onClick={() => onAddCard?.(_id)}
          className="flex w-full items-center gap-2 px-2 py-2 font-mono text-xs text-(--text-muted) transition hover:bg-(--hover) hover:text-(--text-primary)"
        >
          <HugeiconsIcon
            icon={Add01Icon}
            size={14}
            strokeWidth={1.5}
          />

          Add card
        </button>
      </footer>
    </section>
  );
}

