import type { BoardDetails, BoardCard as BoardCardType } from "@/types/api/dashboard/board";
import BoardColumn from "./BoardColumn";

interface BoardColumnsProps {
  board: BoardDetails;
  onAddCard?: (columnId: string) => void;
  onCardClick?: (card: BoardCardType) => void;
}

export default function BoardColumns({
  board,
  onAddCard,
  onCardClick,
}: BoardColumnsProps) {
  const columns = [...board.columns].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  return (
    <section
      aria-label={`${board.name} columns`}
      className="
        h-full min-h-0
        overflow-x-auto overflow-y-hidden
        bg-(--bg-surface)
      "
    >
      <div className="flex h-full min-w-max gap-4 p-4 md:p-6">
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            id={column.id}
            title={column.name}
            cards={column.cards}
            onAddCard={onAddCard}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </section>
  );
}
