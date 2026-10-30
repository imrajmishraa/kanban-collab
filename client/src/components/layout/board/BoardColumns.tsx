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
  onEditColumn: (columnId: string) => void;
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
  onEditColumn,
  onDeleteColumn,
  onClearColumn,
}: BoardColumnsProps) {
  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="flex h-full min-w-max gap-4 pb-2">
        {columns.map((column, index) => (
          <BoardColumn
            key={column.id}
            column={column}
            index={index + 1}
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
            onEditColumn={onEditColumn}
            onDeleteColumn={onDeleteColumn}
            onClearColumn={onClearColumn}
          />
        ))}

        {/* Compact tile rather than a full-height panel: the old one was as
            tall as the board, which read as empty space instead of a button. */}
        <button
          type="button"
          onClick={onAddColumn}
          className="group/add flex h-24 w-64 shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-(--hairline-strong) bg-(--tint-2) text-[12px] text-(--text-secondary) transition-colors duration-200 hover:border-(--hairline-strong) hover:bg-(--tint-4) hover:text-(--text-primary)"
        >
          <HugeiconsIcon
            icon={Add01Icon}
            size={16}
            strokeWidth={1.6}
            className="transition-colors duration-200 group-hover/add:text-(--accent)"
          />
          Add column
        </button>
      </div>
    </div>
  );
}
