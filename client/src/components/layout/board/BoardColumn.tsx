import { useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import type { DragEvent } from "react";

import BoardCardItem from "./BoardCardItem";
import CardComposer from "./CardComposer";

import { ui } from "@/features/boards/board.helpers";

import type {
  BoardCard,
  BoardColumn as BoardColumnType,
} from "@/types/api/dashboard/board";

interface BoardColumnProps {
  column: BoardColumnType;
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
  onRenameColumn: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onClearColumn: (columnId: string) => void;
}

export default function BoardColumn({
  column,
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
  onRenameColumn,
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

  const menuItem = (label: string, onClick: () => void, danger = false) => (
    <button
      type="button"
      role="menuitem"
      onClick={(event) => {
        event.stopPropagation();
        setMenuOpen(false);
        onClick();
      }}
      className={[
        "flex h-9 w-full items-center px-3 text-left font-mono text-[11px] transition-colors hover:bg-white/6",
        danger
          ? "text-(--danger)"
          : "text-(--text-secondary) hover:text-(--text-primary)",
      ].join(" ")}
    >
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
        isDropTarget ? "border-(--brand-border)" : "border-white/8",
      ].join(" ")}
    >
      <span aria-hidden="true" className={ui.hairline} />

      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/6 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-primary)">
            {column.name}
          </h2>
          <span className="rounded-full border border-white/10 bg-white/4 px-1.5 font-mono text-[10px] tabular-nums text-(--text-muted)">
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
            className="flex size-7 items-center justify-center rounded-full text-(--text-muted) transition-colors hover:bg-white/6 hover:text-(--text-primary)"
          >
            <HugeiconsIcon
              icon={MoreHorizontalIcon}
              size={16}
              strokeWidth={1.6}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-(--bg-elevated) shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]"
            >
              {menuItem("Rename column", () => onRenameColumn(column.id))}
              {menuItem("Clear cards", () => onClearColumn(column.id))}
              {menuItem("Delete column", () => onDeleteColumn(column.id), true)}
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
            <div className="flex min-h-20 flex-1 items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/2">
              <p className="font-mono text-[10px] uppercase tracking-wide text-(--text-muted)">
                Drop cards here
              </p>
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
      <footer className="border-t border-white/6 p-2">
        <button
          type="button"
          onClick={() => onOpenComposer(column.id)}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 font-mono text-[12px] text-(--text-muted) transition-colors hover:bg-white/6 hover:text-(--text-primary)"
        >
          <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={1.6} />
          Add card
        </button>
      </footer>
    </section>
  );
}
