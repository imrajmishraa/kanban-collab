import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, KanbanIcon } from "@hugeicons/core-free-icons";

import BoardColumns from "@components/layout/board/BoardColumns";

import {
  reindex,
  reindexColumns,
  uid,
  ui,
} from "@/features/boards/board.helpers";

import type { BoardCard, BoardDetails } from "@/types/api/dashboard/board";

interface DashboardBoardEmbedProps {
  board: BoardDetails;
  boardId: string;
}

/**
 * Compact, interactive kanban embed for the dashboard — reuses BoardColumns
 * (columns + cards + drag-and-drop) under a slim bar that shows the board
 * name, its id, and an "Open board" link. No duplicated page chrome.
 */
export default function DashboardBoardEmbed({
  board,
  boardId,
}: DashboardBoardEmbedProps) {
  const navigate = useNavigate();

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

  /* ── Mutations (local to the embed) ── */

  const addCard = (columnId: string, title: string) => {
    setState((prev) => ({
      ...prev,
      columns: prev.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cards: [
                ...column.cards,
                {
                  id: uid("card"),
                  columnId,
                  boardId: prev.id,
                  workspaceId: prev.workspaceId,
                  title,
                  description: "",
                  orderIndex: column.cards.length,
                  members: [],
                  labels: [],
                  checklists: [],
                  isArchived: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            }
          : column,
      ),
    }));
  };

  const moveCard = (cardId: string, toColumnId: string, toIndex: number) => {
    setState((prev) => {
      let movedCard: BoardCard | undefined;
      const withoutCard = prev.columns.map((column) => {
        const index = column.cards.findIndex((card) => card.id === cardId);
        if (index === -1) return column;
        movedCard = column.cards[index];
        return {
          ...column,
          cards: reindex(column.cards.filter((card) => card.id !== cardId)),
        };
      });
      if (!movedCard) return prev;
      const cardToPlace = movedCard;
      return {
        ...prev,
        columns: withoutCard.map((column) => {
          if (column.id !== toColumnId) return column;
          const cards = [...column.cards];
          const clamped = Math.max(0, Math.min(toIndex, cards.length));
          cards.splice(clamped, 0, { ...cardToPlace, columnId: toColumnId });
          return { ...column, cards: reindex(cards) };
        }),
      };
    });
  };

  const addColumn = () => {
    setState((prev) => {
      const orderIndex = prev.columns.length;
      return {
        ...prev,
        columns: [
          ...prev.columns,
          {
            id: uid("col"),
            boardId: prev.id,
            workspaceId: prev.workspaceId,
            name: `Column ${orderIndex + 1}`,
            orderIndex,
            cards: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };
    });
  };

  const renameColumn = (columnId: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (!column) return;
    const next = window.prompt("Rename column", column.name);
    if (!next || !next.trim()) return;
    setState((prev) => ({
      ...prev,
      columns: prev.columns.map((c) =>
        c.id === columnId ? { ...c, name: next.trim() } : c,
      ),
    }));
  };

  const clearColumn = (columnId: string) => {
    setState((prev) => ({
      ...prev,
      columns: prev.columns.map((column) =>
        column.id === columnId ? { ...column, cards: [] } : column,
      ),
    }));
  };

  const deleteColumn = (columnId: string) => {
    setState((prev) => ({
      ...prev,
      columns: reindexColumns(
        prev.columns.filter((column) => column.id !== columnId),
      ),
    }));
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
