import { AvatarStack } from "./BoardAvatar";

import { formatDue, isOverdue } from "@/features/boards/board.helpers";

import type {
  BoardCard,
  BoardColumn as BoardColumnType,
} from "@/types/api/dashboard/board";

interface BoardListViewProps {
  columns: BoardColumnType[];
  onOpenCard: (card: BoardCard) => void;
}

/** Compact, grouped list rendering of the same filtered board data. */
export default function BoardListView({
  columns,
  onOpenCard,
}: BoardListViewProps) {
  const empty = columns.every((column) => column.cards.length === 0);

  if (empty) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-orange-50/15 bg-white/[0.02] p-8">
        <p className="font-mono text-[12px] uppercase tracking-wider text-neutral-500">
          No cards match your filters
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pr-1">
      <div className="space-y-6">
        {columns.map((column) => (
          <section key={column.id}>
            <div className="mb-2 flex items-center gap-2 px-1">
              <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-100">
                {column.name}
              </h2>
              <span className="rounded-full border border-orange-50/15 bg-white/[0.04] px-1.5 font-mono text-[10px] tabular-nums text-neutral-500">
                {column.cards.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {column.cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onOpenCard(card)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-orange-50/15 bg-white/[0.03] px-3 py-2.5 text-left transition-colors duration-200 hover:border-orange-50/25 hover:bg-white/[0.06]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[12px] text-neutral-100">
                      {card.title}
                    </span>
                    {card.description && (
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-neutral-400">
                        {card.description}
                      </span>
                    )}
                  </span>

                  {card.dueDate && (
                    <span
                      className="shrink-0 font-mono text-[10px] tabular-nums"
                      style={{
                        color: isOverdue(card.dueDate)
                          ? "var(--danger)"
                          : "var(--text-muted)",
                      }}
                    >
                      {formatDue(card.dueDate)}
                    </span>
                  )}

                  <AvatarStack ids={card.members} size={20} max={2} />
                </button>
              ))}

              {column.cards.length === 0 && (
                <p className="rounded-lg border border-dashed border-orange-50/15 px-3 py-4 text-center font-mono text-[10px] uppercase tracking-wide text-neutral-500">
                  Empty
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
