/**
 * useBoardDoc — bind a Kanban board to a live Yjs document (T5).
 *
 * Replaces the old "local useState + REST refetch" board state:
 *
 *   const { board, addCard, updateCard, moveCard, ... } = useBoardDoc({
 *     doc,               // from useCollaboration()
 *     board: restBoard,  // initial snapshot from GET /boards/:id
 *   });
 *
 * Seeding rules:
 *   - If the CRDT is empty, it is seeded once from the REST snapshot.
 *   - If the CRDT already has state (a peer seeded it, or it was restored from
 *     persistence), the REST snapshot is ignored — the CRDT wins. This is what
 *     stops a late GET from clobbering a live edit.
 *
 * React Compiler notes:
 *   - The effect body never calls `setState` synchronously — updates go through
 *     `requestAnimationFrame`, matching the pattern in `useCollaboration`.
 *   - No refs are read or written during render. `board` is a dependency of the
 *     effect, so it is captured directly instead of mirrored into a ref.
 *     Seeding the CRDT is an external-system write and is safe to do inline.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type * as Y from "yjs";

import type { BoardDetails } from "@/types/api/dashboard/board";

import {
  addCard as addCardToDoc,
  addColumn as addColumnToDoc,
  isBoardSeeded,
  moveCard as moveCardInDoc,
  observeBoard,
  readBoard,
  removeCard as removeCardFromDoc,
  removeColumn as removeColumnFromDoc,
  renameColumn as renameColumnInDoc,
  seedBoard,
  updateCard as updateCardInDoc,
  type CardRecord,
  type NewCardInput,
} from "./boardDoc";

export interface UseBoardDocOptions {
  /** The collaborative document, or null while disconnected. */
  doc: Y.Doc | null;
  /** The REST snapshot used to seed an empty document. */
  board: BoardDetails;
  enabled?: boolean;
}

export interface BoardDocApi {
  /** Live board state (CRDT-backed once seeded). */
  board: BoardDetails;
  /** True once the CRDT holds the board (i.e. collaboration is active). */
  live: boolean;
  addCard: (input: NewCardInput) => string | null;
  updateCard: (cardId: string, patch: Partial<Omit<CardRecord, "id">>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (
    cardId: string,
    targetColumnId: string,
    targetOrderIndex: number,
  ) => void;
  addColumn: (name: string) => string | null;
  renameColumn: (columnId: string, name: string) => void;
  deleteColumn: (columnId: string) => void;
}

export function useBoardDoc({
  doc,
  board,
  enabled = true,
}: UseBoardDocOptions): BoardDocApi {
  const [state, setState] = useState<BoardDetails>(() =>
    doc ? (readBoard(doc) ?? board) : board,
  );

  // `board` is a dependency (not a ref) so a refetch still reaches state when
  // collaboration is off. It is expected to be referentially stable between
  // renders (react-query data), so this does not churn the subscription.
  useEffect(() => {
    let cancelled = false;
    let frame = 0;

    const schedule = (fn: () => void) => {
      frame = requestAnimationFrame(() => {
        if (!cancelled) fn();
      });
    };

    if (!doc || !enabled) {
      // No live document — mirror the REST snapshot.
      schedule(() => setState(board));
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }

    // Seed once, only when the CRDT is empty. This is an external-system
    // write (into the Y.Doc), not a React state update.
    if (!isBoardSeeded(doc)) {
      seedBoard(doc, board);
    }

    schedule(() => setState(readBoard(doc) ?? board));

    const unsubscribe = observeBoard(doc, () => {
      setState(readBoard(doc) ?? board);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [doc, enabled, board]);

  const boardId = state.id;

  const addCard = useCallback(
    (input: NewCardInput) => {
      if (!doc) return null;
      return addCardToDoc(doc, boardId, input);
    },
    [doc, boardId],
  );

  const updateCard = useCallback(
    (cardId: string, patch: Partial<Omit<CardRecord, "id">>) => {
      if (!doc) return;
      updateCardInDoc(doc, cardId, patch);
    },
    [doc],
  );

  const deleteCard = useCallback(
    (cardId: string) => {
      if (!doc) return;
      removeCardFromDoc(doc, cardId);
    },
    [doc],
  );

  const moveCard = useCallback(
    (cardId: string, targetColumnId: string, targetOrderIndex: number) => {
      if (!doc) return;
      moveCardInDoc(doc, cardId, targetColumnId, targetOrderIndex);
    },
    [doc],
  );

  const addColumn = useCallback(
    (name: string) => {
      if (!doc) return null;
      return addColumnToDoc(doc, boardId, name);
    },
    [doc, boardId],
  );

  const renameColumn = useCallback(
    (columnId: string, name: string) => {
      if (!doc) return;
      renameColumnInDoc(doc, columnId, name);
    },
    [doc],
  );

  const deleteColumn = useCallback(
    (columnId: string) => {
      if (!doc) return;
      removeColumnFromDoc(doc, columnId);
    },
    [doc],
  );

  const live = useMemo(
    () => Boolean(doc) && isBoardSeeded(doc as Y.Doc),
    [doc],
  );

  return {
    board: state,
    live,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    addColumn,
    renameColumn,
    deleteColumn,
  };
}
