import type * as Y from "yjs";

import { documentManager } from "./documentManager";
import {
  isBoardSeeded,
  type CollabCardRecord,
  type CollabColumnRecord,
} from "./boardSchema";

/**
 * Writing an HTTP change into the live board document.
 *
 * The reconciler projects the document onto Mongo, and prunes rows the document
 * does not know. HTTP writes only ever went to Mongo — so a card created while
 * somebody had the board open was, from the reconciler's point of view, a row
 * that should not exist, and the next debounced reconcile removed it.
 *
 * This is the other half: apply the same change to the document, if there is a
 * live one to apply it to. `origin: "http"` matters — the broadcaster skips only
 * the socket that originated an update, and no socket matches this string, so
 * every connected client receives it.
 */

export const ORIGIN_HTTP = "http";

/**
 * Apply `mutate` to the board's document, when it is live and seeded.
 *
 * Returns false when it did not: nobody is connected, or the document has not
 * been seeded yet (the client seeds it from Mongo when it opens the board, so a
 * Mongo-only write is correct there — it *is* what the seed will read).
 */
export function applyToBoardDoc(
  boardId: string,
  mutate: (doc: Y.Doc) => void,
): boolean {
  const managed = documentManager.get(boardId);

  if (!managed || !isBoardSeeded(managed.doc)) {
    return false;
  }

  managed.doc.transact(() => {
    mutate(managed.doc);
  }, ORIGIN_HTTP);

  return true;
}

/** The columns map, or `undefined` when the document has not been seeded. */
function columns(doc: Y.Doc): Y.Map<CollabColumnRecord> | undefined {
  return doc.getMap<CollabColumnRecord>("columns");
}

function cards(doc: Y.Doc): Y.Map<CollabCardRecord> | undefined {
  return doc.getMap<CollabCardRecord>("cards");
}

/** Insert or replace a card record. */
export function upsertCardRecord(doc: Y.Doc, record: CollabCardRecord): void {
  const map = cards(doc);

  if (!map) return;

  map.set(record.id, record);

  const columnMap = columns(doc);
  const column = columnMap?.get(record.columnId);

  if (!column) return;

  const ids = column.cardIds ?? [];

  if (!ids.includes(record.id)) {
    columnMap?.set(column.id, { ...column, cardIds: [...ids, record.id] });
  }
}

/** Remove a card record and its id from every column. */
export function removeCardRecord(doc: Y.Doc, cardId: string): void {
  const map = cards(doc);
  const columnMap = columns(doc);

  if (!map) return;

  map.delete(cardId);

  if (!columnMap) return;

  for (const column of columnMap.values()) {
    if (!(column.cardIds ?? []).includes(cardId)) continue;

    columnMap.set(column.id, {
      ...column,
      cardIds: column.cardIds.filter((id) => id !== cardId),
    });
  }
}

/** Insert or replace a column record, keeping any card ids it already had. */
export function upsertColumnRecord(
  doc: Y.Doc,
  record: CollabColumnRecord,
): void {
  const map = columns(doc);

  if (!map) return;

  const existing = map.get(record.id);

  map.set(record.id, {
    ...record,
    cardIds: record.cardIds ?? existing?.cardIds ?? [],
  });
}

/** Remove a column record and the card records it held. */
export function removeColumnRecord(doc: Y.Doc, columnId: string): void {
  const map = columns(doc);
  const cardMap = cards(doc);

  if (!map) return;

  const column = map.get(columnId);

  for (const cardId of column?.cardIds ?? []) {
    cardMap?.delete(cardId);
  }

  map.delete(columnId);
}

/**
 * Move a card into a column at a position, in one transaction.
 *
 * Every column is rewritten rather than only the two involved: a card that
 * appears in two `cardIds` lists is a state the reconciler cannot make sense of,
 * and one pass is cheaper than reasoning about which duplicate is stale.
 */
export function moveCardRecord(
  doc: Y.Doc,
  cardId: string,
  toColumnId: string,
  toIndex: number,
): void {
  const columnMap = columns(doc);
  const cardMap = cards(doc);

  if (!columnMap) return;

  for (const column of columnMap.values()) {
    const ids = (column.cardIds ?? []).filter((id) => id !== cardId);

    if (column.id === toColumnId) {
      const at = Math.max(0, Math.min(toIndex, ids.length));
      ids.splice(at, 0, cardId);
    }

    columnMap.set(column.id, { ...column, cardIds: ids });
  }

  const card = cardMap?.get(cardId);

  if (card) {
    cardMap?.set(cardId, {
      ...card,
      columnId: toColumnId,
      orderIndex: toIndex,
    });
  }
}
