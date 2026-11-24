import { useMemo } from "react";

/** Enough board to see the floor hold: three columns, no data, no sockets. */
export function BoardPlaceholder() {
  const columns = useMemo(
    () => [
      { name: "Backlog", cards: 4 },
      { name: "Doing", cards: 2 },
      { name: "Done", cards: 3 },
    ],
    [],
  );

  return (
    <div className="h-full overflow-auto bg-(--bg-root) p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-muted)">
        Board placeholder — the floor, not the feature
      </p>

      <div className="flex gap-3">
        {columns.map((column) => (
          <div
            key={column.name}
            className="min-w-0 flex-1 rounded-lg border border-(--hairline) p-3"
          >
            <p className="mb-2 text-[13px] font-medium">{column.name}</p>

            <div className="space-y-2">
              {Array.from({ length: column.cards }, (_, index) => (
                <div
                  key={index}
                  className="h-12 rounded-md border border-(--hairline) bg-(--bg-surface)"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
