import { useMemo, useState } from "react";
import type { DragEvent } from "react";

import BoardColumns from "@components/layout/board/BoardColumns";
import BoardHeader from "@components/layout/board/BoardHeader";
import BoardListView from "@components/layout/board/BoardListView";
import BoardOverview from "@components/layout/board/BoardOverview";
import BoardPresence from "@components/layout/board/BoardPresence";
import BoardToolbar from "@components/layout/board/BoardToolbar";
import CardDetailModal from "@components/layout/board/CardDetailModal";

import { useCollaboration } from "@/collaboration";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useAuthStore } from "@/stores/useAuthStore";

import {
  isOverdue,
  reindex,
  reindexColumns,
  uid,
} from "@/features/boards/board.helpers";
import { useActiveWorkspaceMembers } from "@/features/boards/hooks/useActiveWorkspaceMembers";

import type { BoardCard, BoardDetails } from "@/types/api/dashboard/board";
import type { SortKey, ViewMode } from "@/features/boards/board.helpers";

interface BoardViewProps {
  board: BoardDetails;
  boardId?: string;
}

export default function BoardView({ board, boardId }: BoardViewProps) {
  const { activeWorkspaceName } = useActiveWorkspace();
  const currentUser = useAuthStore((state) => state.user);
  const members = useActiveWorkspaceMembers();

  /* ── Editable copy of the board, re-synced when the prop changes ── */
  const [state, setState] = useState<BoardDetails>(board);
  const [synced, setSynced] = useState<BoardDetails>(board);
  if (board !== synced) {
    setSynced(board);
    setState(board);
  }

  /* ── Collaboration (presence only; idle without a WS URL) ── */
  const wsUrl = useMemo(() => {
    const base = import.meta.env.VITE_WS_URL as string | undefined;
    if (!base || !boardId) return null;
    return `${base.replace(/\/$/, "")}/collab?room=${encodeURIComponent(boardId)}`;
  }, [boardId]);

  const { status, peers } = useCollaboration({
    room: boardId ?? null,
    wsUrl,
    user: currentUser
      ? { userId: currentUser.id, name: currentUser.fullName, color: "#ff6b35" }
      : null,
  });

  /* ── View state ── */
  const [search, setSearch] = useState("");
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("manual");
  const [view, setView] = useState<ViewMode>("board");
  const [activeCard, setActiveCard] = useState<BoardCard | null>(null);
  const [composerColumnId, setComposerColumnId] = useState<string | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const allLabels = useMemo(() => {
    const set = new Set<string>();
    state.columns.forEach((column) =>
      column.cards.forEach((card) =>
        card.labels.forEach((label) => set.add(label)),
      ),
    );
    return Array.from(set).sort();
  }, [state]);

  const hasActiveFilter = search.trim().length > 0 || labelFilter !== null;
  const dragEnabled =
    !hasActiveFilter && sortBy === "manual" && view === "board";

  /* ── Filtered + sorted projection used for rendering ── */
  const visibleColumns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...state.columns]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((column) => {
        let cards = column.cards.filter((card) => {
          const matchesQuery =
            !query ||
            card.title.toLowerCase().includes(query) ||
            card.description.toLowerCase().includes(query);
          const matchesLabel =
            !labelFilter || card.labels.includes(labelFilter);
          return matchesQuery && matchesLabel;
        });

        if (sortBy === "dueDate") {
          cards = [...cards].sort((a, b) => {
            const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return aTime - bTime;
          });
        } else if (sortBy === "title") {
          cards = [...cards].sort((a, b) => a.title.localeCompare(b.title));
        } else {
          cards = [...cards].sort((a, b) => a.orderIndex - b.orderIndex);
        }

        return { ...column, cards };
      });
  }, [state, search, labelFilter, sortBy]);

  const stats = useMemo(() => {
    const columnCount = state.columns.length;
    const cardCount = state.columns.reduce(
      (total, column) => total + column.cards.length,
      0,
    );
    const lastColumn = [...state.columns].sort(
      (a, b) => b.orderIndex - a.orderIndex,
    )[0];
    const doneCount = lastColumn?.cards.length ?? 0;
    const overdueCount = state.columns.reduce(
      (total, column) =>
        total + column.cards.filter((card) => isOverdue(card.dueDate)).length,
      0,
    );
    return { columnCount, cardCount, doneCount, overdueCount };
  }, [state]);

  /* ── Mutations (local) ── */

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

  const updateCard = (updated: BoardCard) => {
    setState((prev) => ({
      ...prev,
      columns: prev.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          card.id === updated.id ? updated : card,
        ),
      })),
    }));
    setActiveCard(null);
  };

  const deleteCard = (cardId: string) => {
    setState((prev) => ({
      ...prev,
      columns: prev.columns.map((column) => ({
        ...column,
        cards: reindex(column.cards.filter((card) => card.id !== cardId)),
      })),
    }));
    setActiveCard(null);
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
    <div className="min-h-screen bg-(--bg-root) text-(--text-primary)">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        <BoardHeader
          name={state.name}
          description={state.description}
          workspaceName={activeWorkspaceName ?? undefined}
          presence={<BoardPresence peers={peers} status={status} />}
        />

        <BoardOverview
          columnCount={stats.columnCount}
          cardCount={stats.cardCount}
          doneCount={stats.doneCount}
          overdueCount={stats.overdueCount}
        />

        <BoardToolbar
          search={search}
          onSearch={setSearch}
          labels={allLabels}
          labelFilter={labelFilter}
          onToggleLabel={(label) =>
            setLabelFilter((prev) => (prev === label ? null : label))
          }
          sortBy={sortBy}
          onSortChange={setSortBy}
          view={view}
          onViewChange={setView}
          onAddCard={() => setComposerColumnId(visibleColumns[0]?.id ?? null)}
          dragPaused={!dragEnabled}
        />

        <div className="mt-4 h-[calc(100vh-23rem)] min-h-96">
          {view === "board" ? (
            <BoardColumns
              columns={visibleColumns}
              dragEnabled={dragEnabled}
              draggingCardId={draggingCardId}
              dragOverColumnId={dragOverColumnId}
              composerColumnId={composerColumnId}
              onOpenComposer={setComposerColumnId}
              onCloseComposer={() => setComposerColumnId(null)}
              onAddCard={addCard}
              onAddColumn={addColumn}
              onOpenCard={setActiveCard}
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
          ) : (
            <BoardListView
              columns={visibleColumns}
              onOpenCard={setActiveCard}
            />
          )}
        </div>
      </div>

      {activeCard && (
        <CardDetailModal
          key={activeCard.id}
          card={activeCard}
          members={members}
          onClose={() => setActiveCard(null)}
          onSave={updateCard}
          onDelete={deleteCard}
        />
      )}
    </div>
  );
}
