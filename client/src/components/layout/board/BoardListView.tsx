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
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/2 p-8">
        <p className="font-mono text-[12px] uppercase tracking-wider text-(--text-muted)">
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
              <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-primary)">
                {column.name}
              </h2>
              <span className="rounded-full border border-white/10 bg-white/4 px-1.5 font-mono text-[10px] tabular-nums text-(--text-muted)">
                {column.cards.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {column.cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onOpenCard(card)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/8 bg-white/3 px-3 py-2.5 text-left transition-colors duration-200 hover:border-white/14 hover:bg-white/6"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[12px] text-(--text-primary)">
                      {card.title}
                    </span>
                    {card.description && (
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-(--text-secondary)">
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
                <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center font-mono text-[10px] uppercase tracking-wide text-(--text-muted)">
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
