import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, KanbanIcon } from "@hugeicons/core-free-icons";

import type { Board, BoardDetails } from "@/types/api/dashboard/board";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();

  if (Number.isNaN(diff)) return "";

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

interface BoardCardProps {
  board: Board;
  details?: BoardDetails;
  isLoadingDetails?: boolean;
  onClick: () => void;
}

/**
 * One board, compact. The whole card is the link: the previous version
 * rendered every column and card inline, which made a single board taller
 * than the viewport and gave no clear way in.
 */
export function BoardCard({
  board,
  details,
  isLoadingDetails = false,
  onClick,
}: BoardCardProps) {
  const columnCount = details?.columns.length ?? 0;
  const cardCount =
    details?.columns.reduce(
      (total, column) => total + column.cards.length,
      0,
    ) ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex w-full cursor-pointer flex-col rounded-xl
        border border-orange-50/6 bg-[#0a0a0a]/50
        px-4 py-3.5 text-left
        transition-colors duration-300 ease-out
        hover:border-orange-50/20 hover:bg-white/3
      "
    >
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-orange-50/15 text-neutral-500 transition-colors duration-200 group-hover:text-orange-100">
          <HugeiconsIcon icon={KanbanIcon} size={14} strokeWidth={1.7} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13.5px] font-medium tracking-tight text-neutral-100">
            {board.name}
          </h3>

          <p className="mt-0.5 truncate text-[12px] text-neutral-500">
            {board.description?.trim() || "No description"}
          </p>
        </div>

        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          size={14}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-neutral-600 transition-colors duration-200 group-hover:text-orange-100"
        />
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-500">
        {isLoadingDetails ? (
          <span className="h-2.5 w-24 animate-pulse rounded bg-white/6" />
        ) : (
          <>
            <span className="tabular-nums">{columnCount}</span>
            <span>{columnCount === 1 ? "column" : "columns"}</span>
            <span aria-hidden="true" className="text-neutral-700">
              /
            </span>
            <span className="tabular-nums text-orange-100">{cardCount}</span>
            <span>{cardCount === 1 ? "card" : "cards"}</span>
          </>
        )}

        <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-wider text-neutral-600">
          {relativeTime(board.updatedAt)}
        </span>
      </div>
    </button>
  );
}
