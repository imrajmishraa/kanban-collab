import { useCallback, useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";

import BoardColumns from "@components/layout/board/BoardColumns";
import BoardHeader from "@components/layout/board/BoardHeader";
import BoardListView from "@components/layout/board/BoardListView";
import BoardOverview from "@components/layout/board/BoardOverview";
import BoardPresence from "@components/layout/board/BoardPresence";
import BoardToolbar from "@components/layout/board/BoardToolbar";
import CardPalette from "@components/layout/board/cards/CardPalette";
import BoardActivityPanel from "@components/layout/board/BoardActivityPanel";
import ConfirmDialog from "@components/ui/dialog/ConfirmDialog";
import {
  AddColumnDialog,
  EditColumnDialog,
} from "@/features/workspaces/components/board-dialogs";

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
  const members = useActiveWorkspaceMembers();

  /* ── Collaboration (live board state) ── */
  // F-8: the URL carries only the board id — the access token travels in the
  // `kanban.auth` subprotocol — so the URL is stable across token refreshes and
  // no longer tears the Y.Doc down every 15 minutes.
  const wsUrl = useMemo(() => buildCollaborationWsUrl(boardId), [boardId]);

  // Stable accessor: the provider reads the *current* token at connect and
  // reconnect time, so a refresh doesn't require rebuilding the connection.
  const getToken = useCallback(() => useAuthStore.getState().accessToken, []);

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

  const { doc, awareness, status, peers, synced } = useCollaboration({
    room: boardId ?? null,
    wsUrl,
    getToken,
    user: collabUser,
  });

  /* ── Board state: CRDT-backed when connected, REST otherwise ── */
  const docApi = useBoardDoc({ doc, board, synced });
  const rest = useBoardMutations(boardId ?? board.id);

  // F-9: "live" means connected AND synced — not merely "a doc exists". While
  // connecting/reconnecting, mutations fall back to REST so nothing is dropped.
  const live = status === "connected" && synced;
  const state = docApi.board;

  /* ── Presence cursors (T7) ── */
  const { setCursor, clearCursor } = useCursors(awareness);

  /* ── View state ── */
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("manual");
  const [view, setView] = useState<ViewMode>("board");
  const [paletteCard, setPaletteCard] = useState<BoardCard | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    run: () => void;
  } | null>(null);
  const [composerColumnId, setComposerColumnId] = useState<string | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  /* Declared before the callbacks below: the React Compiler rejects a setter
     that is read before its declaration, even inside a closure that runs
     later. */
  const [paletteOpen, setPaletteOpen] = useState(false);

  /* Opening a card now goes through the palette, so there is one editor in
     the app rather than two that can drift apart. */
  const openCard = useCallback(
    (card: BoardCard) => {
      setPaletteCard(card);
      setPaletteOpen(true);
      setCursor({ cardId: card.id, columnId: card.columnId });
    },
    [setCursor],
  );

  const closeCard = useCallback(() => {
    setPaletteCard(null);
    setPaletteOpen(false);
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

  const hasActiveFilter = labelFilter !== null;
  const dragEnabled =
    !hasActiveFilter && sortBy === "manual" && view === "board";

  /* ── Filtered + sorted projection used for rendering ── */
  const visibleColumns = useMemo(() => {
    return [...state.columns]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((column) => {
        let cards = column.cards.filter(
          (card) => !labelFilter || card.labels.includes(labelFilter),
        );

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
  }, [state, labelFilter, sortBy]);

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
        checklists: updated.checklists,
      });
    } else {
      rest.updateCard.mutate({
        cardId: updated.id,
        title: updated.title,
        description: updated.description,
        dueDate: updated.dueDate ?? null,
        members: updated.members,
        labels: updated.labels,
        checklists: updated.checklists,
      });
    }
    closeCard();
  };

  const performDeleteCard = (cardId: string) => {
    if (live) {
      docApi.deleteCard(cardId);
    } else {
      rest.deleteCard.mutate(cardId);
    }
    closeCard();
  };

  const handleDeleteCard = (cardId: string) => {
    const card = state.columns
      .flatMap((c) => c.cards)
      .find((c) => c.id === cardId);

    setConfirm({
      title: "Delete card",
      message: `Delete “${card?.title ?? "this card"}”? This can't be undone.`,
      confirmLabel: "Delete",
      run: () => performDeleteCard(cardId),
    });
  };

  /* Ask for a name instead of inventing "Column 4": a column called
     "Column 4" is one nobody can find later. */
  const [addColumnOpen, setAddColumnOpen] = useState(false);

  const createColumnNamed = (name: string) => {
    const orderIndex = state.columns.length;

    if (live) {
      docApi.addColumn(name);
      return;
    }

    rest.createColumn.mutate({
      boardId: state.id,
      name,
      orderIndex,
    });
  };

  /* Columns had no description and rename used window.prompt, which cannot
     carry one. This opens a dialog for both fields. */
  const [editColumnId, setEditColumnId] = useState<string | null>(null);

  /* ⌘I on a board opens the card palette. ⌘K still works because it was the
     original binding and AppLayout already stands down on board routes, so
     there is nothing for it to collide with. */

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || event.shiftKey) return;

      const key = event.key.toLowerCase();
      if (key !== "i" && key !== "k") return;

      event.preventDefault();
      setPaletteOpen((previous) => !previous);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const saveColumn = (
    columnId: string,
    values: { name: string; description: string },
  ) => {
    if (live) {
      docApi.renameColumn(columnId, values.name);
      return;
    }

    rest.updateColumn.mutate({
      columnId,
      name: values.name,
      description: values.description,
    });
  };

  const performClearColumn = async (columnId: string) => {
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

  const clearColumn = (columnId: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (!column || column.cards.length === 0) return;

    setConfirm({
      title: "Clear column",
      message: `Remove all ${column.cards.length} card(s) from “${column.name}”? This can't be undone.`,
      confirmLabel: "Clear cards",
      run: () => {
        void performClearColumn(columnId);
      },
    });
  };

  const performDeleteColumn = async (columnId: string) => {
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

  const handleDeleteColumn = (columnId: string) => {
    const column = state.columns.find((c) => c.id === columnId);
    if (!column) return;

    setConfirm({
      title: "Delete column",
      message: `Delete “${column.name}” and its ${column.cards.length} card(s)? This can't be undone.`,
      confirmLabel: "Delete column",
      run: () => {
        void performDeleteColumn(columnId);
      },
    });
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
          boardId={boardId ?? board.id}
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

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setShowActivity((prev) => !prev)}
            className="rounded-lg border border-(--hairline) bg-(--tint-4) px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-(--text-secondary) transition-colors hover:text-(--text-primary)"
          >
            {showActivity ? "Hide activity" : "Activity"}
          </button>
        </div>

        {showActivity && (
          <BoardActivityPanel
            boardId={boardId ?? state.id}
            onClose={() => setShowActivity(false)}
          />
        )}

        <BoardToolbar
          onOpenPalette={() => setPaletteOpen(true)}
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
              onAddColumn={() => setAddColumnOpen(true)}
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
              onEditColumn={setEditColumnId}
              onDeleteColumn={handleDeleteColumn}
              onClearColumn={clearColumn}
            />
          ) : (
            <BoardListView columns={visibleColumns} onOpenCard={openCard} />
          )}
        </div>
      </div>

      {paletteOpen && (
        <CardPalette
          key={paletteCard?.id ?? "palette"}
          columns={state.columns}
          members={members}
          initialCard={paletteCard ?? undefined}
          onSave={(card) => handleUpdateCard(card)}
          onDelete={handleDeleteCard}
          onClose={closeCard}
        />
      )}

      {editColumnId &&
        (() => {
          const column = state.columns.find((c) => c.id === editColumnId);
          if (!column) return null;

          return (
            <EditColumnDialog
              currentName={column.name}
              currentDescription={column.description}
              onSave={(values) => saveColumn(editColumnId, values)}
              onClose={() => setEditColumnId(null)}
            />
          );
        })()}

      {addColumnOpen && (
        <AddColumnDialog
          suggestedName={`Column ${state.columns.length + 1}`}
          onCreate={createColumnNamed}
          onClose={() => setAddColumnOpen(false)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          open
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          destructive
          onConfirm={() => {
            const run = confirm.run;
            setConfirm(null);
            run();
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
