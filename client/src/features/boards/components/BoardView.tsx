import { useCallback, useMemo, useState } from "react";
import type { DragEvent } from "react";

import BoardColumns from "@components/layout/board/BoardColumns";
import BoardHeader from "@components/layout/board/BoardHeader";
import BoardListView from "@components/layout/board/BoardListView";
import BoardOverview from "@components/layout/board/BoardOverview";
import BoardPresence from "@components/layout/board/BoardPresence";
import BoardToolbar from "@components/layout/board/BoardToolbar";
import CardDetailModal from "@components/layout/board/CardDetailModal";

import {
  buildCollaborationWsUrl,
  useBoardDoc,
  useCollaboration,
  useCursors,
} from "@/collaboration";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useAuthStore } from "@/stores/useAuthStore";

import { isOverdue } from "@/features/boards/board.helpers";
import { useActiveWorkspaceMembers } from "@/features/boards/hooks/useActiveWorkspaceMembers";
import { useBoardMutations } from "@/features/boards/hooks/useBoardMutations";

import type { BoardCard, BoardDetails } from "@/types/api/dashboard/board";
import type { SortKey, ViewMode } from "@/features/boards/board.helpers";

interface BoardViewProps {
  board: BoardDetails;
  boardId?: string;
}

export default function BoardView({ board, boardId }: BoardViewProps) {
  const { activeWorkspaceName } = useActiveWorkspace();
  const currentUser = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const members = useActiveWorkspaceMembers();

  /* ── Collaboration (live board state) ── */
  // The server expects `{WS_BASE}/ws?token=…&boardId=…`.
  const wsUrl = useMemo(
    () => buildCollaborationWsUrl(boardId, accessToken),
    [boardId, accessToken],
  );

  // Stable object — a fresh literal here re-runs the collab effect on every
  // render and opens a new socket each time (the "infinite request" loop).
  const collabUser = useMemo(() => {
    if (!currentUser) return null;
    return {
      userId: currentUser.id,
      name: currentUser.fullName,
      color: "#ff6b35",
    };
  }, [currentUser]);

  const { doc, awareness, status, peers } = useCollaboration({
    room: boardId ?? null,
    wsUrl,
    user: collabUser,
  });

  /* ── Board state: CRDT-backed when connected, REST otherwise ── */
  const docApi = useBoardDoc({ doc, board });
  const rest = useBoardMutations(boardId ?? board.id);

  const live = Boolean(doc);
  const state = docApi.board;

  /* ── Presence cursors (T7) ── */
  const { setCursor, clearCursor, peersOnCard } = useCursors(awareness);

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

  const openCard = useCallback(
    (card: BoardCard) => {
      setActiveCard(card);
      setCursor({ cardId: card.id, columnId: card.columnId });
    },
    [setCursor],
  );

  const closeCard = useCallback(() => {
    setActiveCard(null);
    clearCursor();
  }, [clearCursor]);

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

  /* ── Mutations: live CRDT when connected, REST fallback otherwise ── */

  const addCard = (columnId: string, title: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    const orderIndex = column?.cards.length ?? 0;

    if (live) {
      docApi.addCard({ columnId, title, orderIndex });
      return;
    }

    rest.createCard.mutate({ columnId, boardId: state.id, title, orderIndex });
  };

  const moveCard = (cardId: string, toColumnId: string, toIndex: number) => {
    if (live) {
      docApi.moveCard(cardId, toColumnId, toIndex);
      return;
    }

    rest.moveCard.mutate({
      cardId,
      targetColumnId: toColumnId,
      targetOrderIndex: toIndex,
    });
  };

  const handleUpdateCard = (updated: BoardCard) => {
    if (live) {
      docApi.updateCard(updated.id, {
        title: updated.title,
        description: updated.description,
        dueDate: updated.dueDate ?? null,
        members: updated.members,
        labels: updated.labels,
      });
    } else {
      rest.updateCard.mutate({
        cardId: updated.id,
        title: updated.title,
        description: updated.description,
        dueDate: updated.dueDate ?? null,
        members: updated.members,
        labels: updated.labels,
      });
    }
    closeCard();
  };

  const handleDeleteCard = (cardId: string) => {
    if (live) {
      docApi.deleteCard(cardId);
    } else {
      rest.deleteCard.mutate(cardId);
    }
    closeCard();
  };

  const addColumn = () => {
    const orderIndex = state.columns.length;

    if (live) {
      docApi.addColumn(`Column ${orderIndex + 1}`);
      return;
    }

    rest.createColumn.mutate({
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

    if (live) {
      docApi.renameColumn(columnId, next.trim());
      return;
    }

    rest.updateColumn.mutate({ columnId, name: next.trim() });
  };

  const clearColumn = async (columnId: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (!column) return;

    for (const card of column.cards) {
      if (live) {
        docApi.deleteCard(card.id);
      } else {
        await rest.deleteCard.mutateAsync(card.id);
      }
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (!column) return;

    // The API refuses to delete a non-empty column — clear it first.
    for (const card of column.cards) {
      if (live) {
        docApi.deleteCard(card.id);
      } else {
        await rest.deleteCard.mutateAsync(card.id);
      }
    }

    if (live) {
      docApi.deleteColumn(columnId);
    } else {
      rest.deleteColumn.mutate(columnId);
    }
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
              onOpenCard={openCard}
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
              onDeleteColumn={handleDeleteColumn}
              onClearColumn={clearColumn}
            />
          ) : (
            <BoardListView columns={visibleColumns} onOpenCard={openCard} />
          )}
        </div>
      </div>

      {activeCard && (
        <CardDetailModal
          key={activeCard.id}
          card={activeCard}
          members={members}
          onClose={closeCard}
          onSave={handleUpdateCard}
          onDelete={handleDeleteCard}
          watchers={peersOnCard(activeCard.id)}
        />
      )}
    </div>
  );
}
