import type { BoardDetails } from "@/types/api/dashboard/board";

import BoardColumn from "./BoardColumn";

interface BoardColumnsProps {
  board: BoardDetails;
}

export default function BoardColumns({ board }: BoardColumnsProps) {
  const columns = [...board.columns].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  return (
    <section
      aria-label={`${board.name} columns`}
      className="h-full min-h-0 overflow-x-auto overflow-y-hidden"
    >
      <div className="flex h-full min-w-max gap-4 p-4 md:p-6">
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            id={column.id}
            title={column.name}
            cards={column.cards}
          />
        ))}
      </div>
    </section>
  );
}
