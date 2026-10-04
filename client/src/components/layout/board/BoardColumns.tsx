import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import type { DragEvent } from "react";

import BoardColumn from "./BoardColumn";

import type {
  BoardCard,
  BoardColumn as BoardColumnType,
} from "@/types/api/dashboard/board";

interface BoardColumnsProps {
  columns: BoardColumnType[];
  dragEnabled: boolean;
  draggingCardId: string | null;
  dragOverColumnId: string | null;
  composerColumnId: string | null;
  onOpenComposer: (columnId: string) => void;
  onCloseComposer: () => void;
  onAddCard: (columnId: string, title: string) => void;
  onAddColumn: () => void;
  onOpenCard: (card: BoardCard) => void;
  onDragStartCard: (card: BoardCard, event: DragEvent<HTMLElement>) => void;
  onDragEndCard: () => void;
  onDragOverCard: (columnId: string, index: number) => void;
  onDragOverColumn: (columnId: string, count: number) => void;
  onDropColumn: (columnId: string, index: number) => void;
  onRenameColumn: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onClearColumn: (columnId: string) => void;
}

export default function BoardColumns({
  columns,
  dragEnabled,
  draggingCardId,
  dragOverColumnId,
  composerColumnId,
  onOpenComposer,
  onCloseComposer,
  onAddCard,
  onAddColumn,
  onOpenCard,
  onDragStartCard,
  onDragEndCard,
  onDragOverCard,
  onDragOverColumn,
  onDropColumn,
  onRenameColumn,
  onDeleteColumn,
  onClearColumn,
}: BoardColumnsProps) {
  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="flex h-full min-w-max gap-4 pb-2">
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            cards={column.cards}
            dragEnabled={dragEnabled}
            draggingCardId={draggingCardId}
            isDropTarget={dragOverColumnId === column.id}
            composerOpen={composerColumnId === column.id}
            onOpenComposer={onOpenComposer}
            onCloseComposer={onCloseComposer}
            onAddCard={onAddCard}
            onOpenCard={onOpenCard}
            onDragStartCard={onDragStartCard}
            onDragEndCard={onDragEndCard}
            onDragOverCard={onDragOverCard}
            onDragOverColumn={onDragOverColumn}
            onDropColumn={onDropColumn}
            onRenameColumn={onRenameColumn}
            onDeleteColumn={onDeleteColumn}
            onClearColumn={onClearColumn}
          />
        ))}

        <button
          type="button"
          onClick={onAddColumn}
          className="flex h-full w-72 shrink-0 items-start justify-center rounded-xl border border-dashed border-white/10 bg-white/2 p-4 font-mono text-[12px] text-(--text-muted) transition-colors duration-200 hover:border-white/20 hover:bg-white/4 hover:text-(--text-primary)"
        >
          <span className="flex items-center gap-2">
            <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={1.6} />
            Add column
          </span>
        </button>
      </div>
    </div>
  );
}
