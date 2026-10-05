import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, KanbanIcon } from "@hugeicons/core-free-icons";

import BoardColumns from "@components/layout/board/BoardColumns";

import { ui } from "@/features/boards/board.helpers";
import { useBoardMutations } from "@/features/boards/hooks/useBoardMutations";

import type { BoardCard, BoardDetails } from "@/types/api/dashboard/board";

interface DashboardBoardEmbedProps {
  board: BoardDetails;
  boardId: string;
}

/**
 * Compact, interactive kanban embed for the dashboard — reuses BoardColumns
 * (columns + cards + drag-and-drop) under a slim bar that shows the board
 * name, its id, and an "Open board" link. No duplicated page chrome.
 *
 * Mutations are server-backed (same hook the full board page uses), so edits
 * persist instead of reverting on refresh.
 */
export default function DashboardBoardEmbed({
  board,
  boardId,
}: DashboardBoardEmbedProps) {
  const navigate = useNavigate();

  const {
    createCard,
    moveCard: moveCardMutation,
    createColumn,
    updateColumn,
    deleteCard: deleteCardMutation,
    deleteColumn: deleteColumnMutation,
  } = useBoardMutations(boardId);

  const [state, setState] = useState<BoardDetails>(board);
  const [synced, setSynced] = useState<BoardDetails>(board);
  if (board !== synced) {
    setSynced(board);
    setState(board);
  }

  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [composerColumnId, setComposerColumnId] = useState<string | null>(null);

  const columns = useMemo(
    () =>
      [...state.columns]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((column) => ({
          ...column,
          cards: [...column.cards].sort((a, b) => a.orderIndex - b.orderIndex),
        })),
    [state],
  );

  const cardCount = columns.reduce(
    (total, column) => total + column.cards.length,
    0,
  );

  /* ── Mutations (server-backed; each invalidates the board query) ── */

  const addCard = (columnId: string, title: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    createCard.mutate({
      columnId,
      boardId: state.id,
      title,
      orderIndex: column?.cards.length ?? 0,
    });
  };

  const moveCard = (cardId: string, toColumnId: string, toIndex: number) => {
    moveCardMutation.mutate({
      cardId,
      targetColumnId: toColumnId,
      targetOrderIndex: toIndex,
    });
  };

  const addColumn = () => {
    const orderIndex = state.columns.length;
    createColumn.mutate({
      boardId: state.id,
      name: `Column ${orderIndex + 1}`,
      orderIndex,
    });
  };

  const renameColumn = (columnId: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (!column) return;
    const next = window.prompt("Rename column", column.name);
    if (!next || !next.trim()) return;
    updateColumn.mutate({ columnId, name: next.trim() });
  };

  const clearColumn = async (columnId: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (!column) return;
    for (const card of column.cards) {
      await deleteCardMutation.mutateAsync(card.id);
    }
  };

  const deleteColumn = async (columnId: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (!column) return;
    // The API refuses to delete a non-empty column — clear it first.
    for (const card of column.cards) {
      await deleteCardMutation.mutateAsync(card.id);
    }
    deleteColumnMutation.mutate(columnId);
  };

  /* ── Drag handlers ── */

  const handleDragStart = (card: BoardCard, event: DragEvent<HTMLElement>) => {
    setDraggingCardId(card.id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.id);
  };

  const handleDragEnd = () => {
    setDraggingCardId(null);
    setDragOverColumnId(null);
    setDropIndex(null);
  };

  const handleDropColumn = (columnId: string, index: number) => {
    if (!draggingCardId) return;
    moveCard(draggingCardId, columnId, dropIndex ?? index);
    setDraggingCardId(null);
    setDragOverColumnId(null);
    setDropIndex(null);
  };

  return (
    <section className={[ui.panel, "p-4 sm:p-5"].join(" ")}>
      <span aria-hidden="true" className={ui.hairline} />

      {/* Slim bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <HugeiconsIcon
            icon={KanbanIcon}
            size={15}
            strokeWidth={1.6}
            className="shrink-0 text-(--brand)"
          />
          <h2 className="truncate font-mono text-[15px] font-semibold text-(--text-primary)">
            {state.name}
          </h2>
          <code className="shrink-0 rounded border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[10px] text-(--text-muted)">
            {boardId}
          </code>
          <span className="hidden shrink-0 font-mono text-[10px] text-(--text-muted) sm:inline">
            {cardCount} {cardCount === 1 ? "card" : "cards"}
          </span>
        </div>

        <Link
          to={`/boards/${boardId}`}
          className="group/open inline-flex shrink-0 items-center gap-2 rounded-full border border-(--brand-border) bg-(--brand-muted) px-3.5 py-1.5 font-mono text-[11px] text-(--brand-hover) transition-colors duration-200 hover:bg-[rgba(255,107,53,0.18)] hover:text-(--text-primary)"
        >
          Open board
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={12}
            strokeWidth={1.8}
            className="transition-transform duration-200 group-hover/open:translate-x-0.5"
          />
        </Link>
      </div>

      {/* Kanban */}
      <div className="mt-4 h-110 min-h-80">
        <BoardColumns
          columns={columns}
          dragEnabled
          draggingCardId={draggingCardId}
          dragOverColumnId={dragOverColumnId}
          composerColumnId={composerColumnId}
          onOpenComposer={setComposerColumnId}
          onCloseComposer={() => setComposerColumnId(null)}
          onAddCard={addCard}
          onAddColumn={addColumn}
          onOpenCard={() => navigate(`/boards/${boardId}`)}
          onDragStartCard={handleDragStart}
          onDragEndCard={handleDragEnd}
          onDragOverCard={(columnId, index) => {
            setDragOverColumnId(columnId);
            setDropIndex(index);
          }}
          onDragOverColumn={(columnId, count) => {
            setDragOverColumnId(columnId);
            setDropIndex(count);
          }}
          onDropColumn={handleDropColumn}
          onRenameColumn={renameColumn}
          onDeleteColumn={deleteColumn}
          onClearColumn={clearColumn}
        />
      </div>
    </section>
  );
}
