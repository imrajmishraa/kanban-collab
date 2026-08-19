import { MoreHorizontal, Star } from "lucide-react";

import type { BoardDetails } from "@/types/api/dashboard/board";

interface BoardHeaderProps {
  board: BoardDetails;
}

export default function BoardHeader({ board }: BoardHeaderProps) {
  const columnCount = board.columns.length;

  const cardCount = board.columns.reduce(
    (total, column) => total + column.cards.length,
    0,
  );

  return (
    <header className="border-b border-neutral-800 bg-[#080808] px-4 py-4 md:px-6">
      <div className="flex items-start justify-between gap-6">
        {/* Board information */}
        <div className="min-w-0 flex-1">
          {/* Breadcrumb */}
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-600">
            WORKSPACE / BOARD
          </div>

          {/* Title */}
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="truncate text-lg font-semibold text-neutral-100 md:text-xl">
              {board.name}
            </h1>
          </div>

          {/* Description */}
          {board.description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-5 text-neutral-500">
              {board.description}
            </p>
          )}

          {/* Statistics */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <BoardStat label="COLUMNS" value={columnCount} />

            <BoardStat label="CARDS" value={cardCount} />

            <BoardStat label="BOARD ID" value={board.id} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Favorite board"
            className="flex h-9 w-9 items-center justify-center border border-neutral-800 text-neutral-500 transition hover:border-neutral-700 hover:text-neutral-200"
          >
            <Star size={16} />
          </button>

          <button
            type="button"
            aria-label="Board actions"
            className="flex h-9 w-9 items-center justify-center border border-neutral-800 text-neutral-500 transition hover:border-neutral-700 hover:text-neutral-200"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}

interface BoardStatProps {
  label: string;
  value: number | string;
}

function BoardStat({ label, value }: BoardStatProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-700">
        {label}
      </span>

      <span className="max-w-45 truncate font-mono text-[10px] text-neutral-500">
        {value}
      </span>
    </div>
  );
}
