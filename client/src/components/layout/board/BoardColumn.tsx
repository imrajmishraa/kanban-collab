import { MoreHorizontal, Plus } from "lucide-react";

import type { BoardCard as BoardCardType } from "@/types/api/dashboard/board";

import BoardCard from "@components/ui/board/BoardCard";

interface BoardColumnProps {
  id: string;
  title: string;
  cards: BoardCardType[];
  onAddCard?: (columnId: string) => void;
}

export default function BoardColumn({
  id,
  title,
  cards,
  onAddCard,
}: BoardColumnProps) {
  const sortedCards = [...cards].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <section
      aria-label={`${title} column`}
      className="flex h-full w-75 shrink-0 flex-col border border-neutral-800 bg-[#0b0b0b]"
    >
      {/* Column header */}
      <header className="flex items-center justify-between border-b border-neutral-800 px-3 py-3">
        <div className="flex items-center gap-2">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-wide text-neutral-300">
            {title}
          </h2>

          <span className="font-mono text-[10px] text-neutral-600">
            {cards.length}
          </span>
        </div>

        <button
          type="button"
          aria-label={`${title} column actions`}
          className="flex h-7 w-7 items-center justify-center text-neutral-600 transition hover:text-neutral-300"
        >
          <MoreHorizontal size={16} />
        </button>
      </header>

      {/* Cards */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="flex min-h-full flex-col gap-2">
          {sortedCards.length > 0 ? (
            sortedCards.map((card) => <BoardCard key={card.id} card={card} />)
          ) : (
            <div
              className="flex min-h-24 flex-1 items-center justify-center border border-dashed border-neutral-800"
              aria-label={`No cards in ${title}`}
            >
              <p className="font-mono text-[10px] uppercase tracking-wide text-neutral-700">
                No cards yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add card */}
      <footer className="border-t border-neutral-800 p-2">
        <button
          type="button"
          onClick={() => onAddCard?.(id)}
          className="flex w-full items-center gap-2 px-2 py-2 font-mono text-xs text-neutral-600 transition hover:bg-neutral-900 hover:text-neutral-300"
        >
          <Plus size={14} />
          Add card
        </button>
      </footer>
    </section>
  );
}
