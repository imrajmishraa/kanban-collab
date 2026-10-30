import { useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import type { DragEvent } from "react";

import BoardCardItem from "@components/layout/board/BoardCardItem";
import CardComposer from "@components/layout/board/cards/CardComposer";

import { ui } from "@/features/boards/board.helpers";

import type {
  BoardCard,
  BoardColumn as BoardColumnType,
} from "@/types/api/dashboard/board";

interface BoardColumnProps {
  column: BoardColumnType;
  /** 1-based position, shown as the column's number. */
  index: number;
  cards: BoardCard[];
  dragEnabled: boolean;
  draggingCardId: string | null;
  isDropTarget: boolean;
  composerOpen: boolean;
  onOpenComposer: (columnId: string) => void;
  onCloseComposer: () => void;
  onAddCard: (columnId: string, title: string) => void;
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

export default function BoardColumn({
  column,
  index,
  cards,
  dragEnabled,
  draggingCardId,
  isDropTarget,
  composerOpen,
  onOpenComposer,
  onCloseComposer,
  onAddCard,
  onOpenCard,
  onDragStartCard,
  onDragEndCard,
  onDragOverCard,
  onDragOverColumn,
  onDropColumn,
  onEditColumn,
  onDeleteColumn,
  onClearColumn,
}: BoardColumnProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const menuItem = (
    label: string,
    icon: typeof MoreHorizontalIcon,
    onClick: () => void,
    danger = false,
  ) => (
    <button
      type="button"
      role="menuitem"
      onClick={(event) => {
        event.stopPropagation();
        setMenuOpen(false);
        onClick();
      }}
      className={[
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11.5px] transition-colors duration-150",
        danger
          ? "text-(--danger) hover:bg-(--tint-4) hover:text-(--danger)"
          : "text-(--text-soft) hover:bg-(--bg-hover) hover:text-(--text-primary)",
      ].join(" ")}
    >
      <HugeiconsIcon icon={icon} size={13} strokeWidth={1.6} />
      {label}
    </button>
  );

  return (
    <section
      aria-label={`${column.name} column`}
      onDragOver={(event) => {
        if (!dragEnabled) return;
        event.preventDefault();
        onDragOverColumn(column.id, cards.length);
      }}
      onDrop={(event) => {
        if (!dragEnabled) return;
        event.preventDefault();
        onDropColumn(column.id, cards.length);
      }}
      className={[
        ui.panel,
        "flex h-full w-72 shrink-0 flex-col transition-colors",
        isDropTarget ? "border-(--hairline-strong)" : "border-(--hairline)",
      ].join(" ")}
    >
      <span aria-hidden="true" className={ui.hairline} />

      {/* Header */}
      <header className="flex items-center justify-between gap-2 border-b border-(--hairline) px-2.5 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="flex size-5 shrink-0 items-center justify-center rounded-md border border-(--hairline) font-mono text-[9px] tabular-nums text-(--text-muted)"
          >
            {String(index).padStart(2, "0")}
          </span>

          <h2 className="truncate text-[12px] font-medium tracking-tight text-(--text-primary)">
            {column.name}
          </h2>

          <span className="shrink-0 rounded-md border border-(--hairline) bg-(--tint-4) px-1.5 font-mono text-[9px] tabular-nums text-(--text-muted)">
            {cards.length}
          </span>
        </div>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label={`${column.name} column actions`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className={[
              "flex size-6 cursor-pointer items-center justify-center rounded-md border transition-colors duration-200",
              menuOpen
                ? "border-(--hairline-strong) bg-(--tint-8) text-(--text-primary)"
                : "border-transparent text-(--text-muted) hover:border-(--hairline-strong) hover:bg-(--bg-hover) hover:text-(--text-primary)",
            ].join(" ")}
          >
            <HugeiconsIcon
              icon={MoreHorizontalIcon}
              size={14}
              strokeWidth={1.8}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-1 w-44 rounded-lg border border-(--hairline) bg-(--bg-root) p-1"
            >
              {menuItem("Edit column", Edit02Icon, () =>
                onEditColumn(column.id),
              )}
              {menuItem("Clear cards", Delete02Icon, () =>
                onClearColumn(column.id),
              )}
              {menuItem(
                "Delete column",
                Delete02Icon,
                () => onDeleteColumn(column.id),
                true,
              )}
            </div>
          )}
        </div>
      </header>

      {/* Cards */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        <div className="flex min-h-full flex-col gap-2">
          {cards.length > 0 ? (
            cards.map((card) => (
              <BoardCardItem
                key={card.id}
                card={card}
                draggable={dragEnabled}
                isDragging={draggingCardId === card.id}
                onOpen={onOpenCard}
                onDragStart={onDragStartCard}
                onDragEnd={onDragEndCard}
                onDragOverCard={onDragOverCard}
              />
            ))
          ) : (
            <div className="flex min-h-20 flex-1 items-center justify-center rounded-lg border border-dashed border-(--hairline) bg-(--tint-2)">
              <p className="text-[11px] text-(--text-subtle)">No cards yet</p>
            </div>
          )}

          {composerOpen && (
            <CardComposer
              onSubmit={(title) => onAddCard(column.id, title)}
              onCancel={onCloseComposer}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-(--hairline) p-2">
        <button
          type="button"
          onClick={() => onOpenComposer(column.id)}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[11.5px] text-(--text-muted) transition-colors duration-200 hover:bg-(--bg-hover) hover:text-(--text-primary)"
        >
          <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={1.6} />
          Add card
        </button>
      </footer>
    </section>
  );
}
