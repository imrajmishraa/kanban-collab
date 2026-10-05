import type * as Y from "yjs";

/**
 * Board record shapes as stored inside the collaborative Yjs document.
 *
 * These mirror the client's `client/src/collaboration/boardDoc.ts` exactly —
 * the server never authors board state, it only reads the CRDT to project it
 * into MongoDB (see `../persistence/boardReconciler.ts`).
 *
 * Document layout (root shared types):
 *   meta    : Y.Map<unknown>            → { id, workspaceId, name, description, … }
 *   columns : Y.Map<CollabColumnRecord> → columnId → record (record.cardIds is ordered)
 *   cards   : Y.Map<CollabCardRecord>   → cardId   → record
 */

export interface CollabCardRecord {
  id: string;
  columnId: string;
  boardId: string;
  workspaceId: string;
  title: string;
  description: string;
  dueDate?: string | null;
  members: string[];
  labels: string[];
  checklists?: Array<{ title: string; isCompleted: boolean }>;
  orderIndex: number;
  isArchived: boolean;
}

export interface CollabColumnRecord {
  id: string;
  boardId: string;
  workspaceId: string;
  name: string;
  orderIndex: number;
  cardIds: string[];
}

export interface BoardSnapshot {
  id: string;
  workspaceId?: string;
  columns: Array<{ record: CollabColumnRecord; cards: CollabCardRecord[] }>;
}

/** True once the document has been seeded with a board (see the client). */
export function isBoardSeeded(doc: Y.Doc): boolean {
  const id = doc.getMap<unknown>("meta").get("id");
  return typeof id === "string" && id.length > 0;
}

/**
 * Read the CRDT into a plain, ordered snapshot. Returns `null` when the
 * document has not been seeded yet (no board id) — callers treat that as
 * "nothing to reconcile".
 */
export function readBoardSnapshot(doc: Y.Doc): BoardSnapshot | null {
  const meta = doc.getMap<unknown>("meta");

  const id = meta.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }

  const workspaceIdValue = meta.get("workspaceId");
  const workspaceId =
    typeof workspaceIdValue === "string" ? workspaceIdValue : undefined;

  const columns = doc.getMap<CollabColumnRecord>("columns");
  const cards = doc.getMap<CollabCardRecord>("cards");

  const ordered = [...columns.values()]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((record) => ({
      record,
      cards: (record.cardIds ?? [])
        .map((cardId) => cards.get(cardId))
        .filter((card): card is CollabCardRecord => Boolean(card))
        .sort((a, b) => a.orderIndex - b.orderIndex),
    }));

  const snapshot: BoardSnapshot = { id, columns: ordered };

  // `exactOptionalPropertyTypes` is on for the server: an optional property may
  // be absent, but it must never be assigned `undefined`. Only attach the key
  // when the value actually exists.
  if (workspaceId !== undefined) {
    snapshot.workspaceId = workspaceId;
  }

  return snapshot;
}
