/**
 * boardDoc — the bridge between a Kanban board and its Yjs document (T5 + T9).
 *
 * This is the piece that was missing: `BoardView` previously used Yjs for
 * *presence only* and drove all board state through REST + refetch. Here the
 * Yjs document becomes the live source of truth for the board's columns and
 * cards, so two clients on the same board see each other's adds / edits /
 * moves immediately.
 *
 * Document layout (root shared types):
 *
 *   meta    : Y.Map<unknown>            → { id, workspaceId, name, … }
 *   columns : Y.Map<ColumnRecord>       → columnId → record (cardIds is ordered)
 *   cards   : Y.Map<CardRecord>         → cardId   → record
 *
 * Every local mutation runs inside `doc.transact(fn, ORIGIN_LOCAL)`. Remote
 * updates arrive from the provider already tagged `ORIGIN_REMOTE`, so:
 *   - the provider never echoes a remote update back (see YjsProvider), and
 *   - this module never re-applies a local edit that came back off the wire.
 */

import * as Y from "yjs";

import type {
  BoardCard,
  BoardColumn,
  BoardDetails,
} from "@/types/api/dashboard/board";

import { ORIGIN_LOCAL } from "./origins";

export interface CardRecord {
  id: string;
  columnId: string;
  boardId: string;
  workspaceId: string;
  title: string;
  description: string;
  dueDate?: string | null;
  members: string[];
  labels: string[];
  checklists: BoardCard["checklists"];
  orderIndex: number;
  isArchived: boolean;
}

export interface ColumnRecord {
  id: string;
  boardId: string;
  workspaceId: string;
  name: string;
  orderIndex: number;
  cardIds: string[];
}

export interface BoardDocHandles {
  meta: Y.Map<unknown>;
  columns: Y.Map<ColumnRecord>;
  cards: Y.Map<CardRecord>;
}

/** Resolve the three shared maps from a document. */
export function getBoardDoc(doc: Y.Doc): BoardDocHandles {
  return {
    meta: doc.getMap<unknown>("meta"),
    columns: doc.getMap<ColumnRecord>("columns"),
    cards: doc.getMap<CardRecord>("cards"),
  };
}

/**
 * Generate a 24-char lowercase-hex id (MongoDB ObjectId format) so records
 * created offline still slot into the server's `_id` fields on reconciliation.
 */
export function createId(): string {
  const bytes = new Uint8Array(12);

  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function isBoardSeeded(doc: Y.Doc): boolean {
  const id = getBoardDoc(doc).meta.get("id");
  return typeof id === "string" && id.length > 0;
}

// ── read ────────────────────────────────────────────────────

function toBoardCard(record: CardRecord): BoardCard {
  return {
    id: record.id,
    columnId: record.columnId,
    boardId: record.boardId,
    workspaceId: record.workspaceId,
    title: record.title,
    description: record.description ?? "",
    orderIndex: record.orderIndex,
    dueDate: record.dueDate ?? undefined,
    members: record.members ?? [],
    labels: record.labels ?? [],
    checklists: record.checklists ?? [],
    isArchived: record.isArchived ?? false,
    createdAt: "",
    updatedAt: "",
  };
}

/**
 * Read the CRDT into a `BoardDetails`. Returns `null` before the document has
 * been seeded, so callers can fall back to the REST snapshot.
 */
export function readBoard(doc: Y.Doc): BoardDetails | null {
  const { meta, columns, cards } = getBoardDoc(doc);

  const id = meta.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }

  const orderedColumns: BoardColumn[] = [...columns.values()]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((record) => ({
      id: record.id,
      boardId: record.boardId,
      workspaceId: record.workspaceId,
      name: record.name,
      orderIndex: record.orderIndex,
      cards: (record.cardIds ?? [])
        .map((cardId) => cards.get(cardId))
        .filter((card): card is CardRecord => Boolean(card))
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map(toBoardCard),
      createdAt: "",
      updatedAt: "",
    }));

  return {
    id,
    workspaceId: String(meta.get("workspaceId") ?? ""),
    name: String(meta.get("name") ?? ""),
    description: String(meta.get("description") ?? ""),
    backgroundColor: String(meta.get("backgroundColor") ?? ""),
    coverImageUrl: (meta.get("coverImageUrl") as string) || undefined,
    visibility:
      (meta.get("visibility") as BoardDetails["visibility"]) ?? "private",
    createdAt: String(meta.get("createdAt") ?? ""),
    updatedAt: String(meta.get("updatedAt") ?? ""),
    columns: orderedColumns,
  };
}

// ── seed ────────────────────────────────────────────────────

/**
 * Initialise the CRDT from the REST snapshot. Called once, only when the
 * document is empty — after that the CRDT is authoritative and REST refetches
 * are ignored (otherwise a slow GET could clobber a live edit).
 */
export function seedBoard(doc: Y.Doc, board: BoardDetails): void {
  const { meta, columns, cards } = getBoardDoc(doc);

  doc.transact(() => {
    meta.set("id", board.id);
    meta.set("workspaceId", board.workspaceId);
    meta.set("name", board.name);
    meta.set("description", board.description ?? "");
    meta.set("backgroundColor", board.backgroundColor);
    meta.set("coverImageUrl", board.coverImageUrl ?? "");
    meta.set("visibility", board.visibility);
    meta.set("createdAt", board.createdAt);
    meta.set("updatedAt", board.updatedAt);

    for (const column of board.columns) {
      columns.set(column.id, {
        id: column.id,
        boardId: column.boardId,
        workspaceId: column.workspaceId,
        name: column.name,
        orderIndex: column.orderIndex,
        cardIds: column.cards.map((card) => card.id),
      });

      for (const card of column.cards) {
        cards.set(card.id, {
          id: card.id,
          columnId: card.columnId,
          boardId: card.boardId,
          workspaceId: card.workspaceId,
          title: card.title,
          description: card.description ?? "",
          dueDate: card.dueDate ?? null,
          members: card.members ?? [],
          labels: card.labels ?? [],
          checklists: card.checklists ?? [],
          orderIndex: card.orderIndex,
          isArchived: card.isArchived ?? false,
        });
      }
    }
  }, ORIGIN_LOCAL);
}

// ── observe ─────────────────────────────────────────────────

/** Subscribe to any change in the board document. Returns an unsubscribe fn. */
export function observeBoard(doc: Y.Doc, onChange: () => void): () => void {
  doc.on("update", onChange);
  return () => doc.off("update", onChange);
}

// ── mutations (all local, all origin-tagged) ────────────────

export interface NewCardInput {
  columnId: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  members?: string[];
  labels?: string[];
  orderIndex?: number;
}

export function addCard(
  doc: Y.Doc,
  boardId: string,
  input: NewCardInput,
): string {
  const { columns, cards } = getBoardDoc(doc);
  const column = columns.get(input.columnId);

  const id = createId();
  const orderIndex = input.orderIndex ?? column?.cardIds.length ?? 0;

  doc.transact(() => {
    cards.set(id, {
      id,
      columnId: input.columnId,
      boardId,
      workspaceId: column?.workspaceId ?? "",
      title: input.title.trim(),
      description: input.description ?? "",
      dueDate: input.dueDate ?? null,
      members: input.members ?? [],
      labels: input.labels ?? [],
      checklists: [],
      orderIndex,
      isArchived: false,
    });

    if (column) {
      const cardIds = [...column.cardIds];
      cardIds.splice(orderIndex, 0, id);
      columns.set(column.id, { ...column, cardIds });
    }
  }, ORIGIN_LOCAL);

  return id;
}

export function updateCard(
  doc: Y.Doc,
  cardId: string,
  patch: Partial<Omit<CardRecord, "id">>,
): void {
  const { cards } = getBoardDoc(doc);
  const existing = cards.get(cardId);

  if (!existing) return;

  doc.transact(() => {
    cards.set(cardId, { ...existing, ...patch, id: cardId });
  }, ORIGIN_LOCAL);
}

export function removeCard(doc: Y.Doc, cardId: string): void {
  const { columns, cards } = getBoardDoc(doc);
  const existing = cards.get(cardId);

  if (!existing) return;

  doc.transact(() => {
    cards.delete(cardId);

    const column = columns.get(existing.columnId);
    if (column) {
      columns.set(column.id, {
        ...column,
        cardIds: column.cardIds.filter((id) => id !== cardId),
      });
    }
  }, ORIGIN_LOCAL);
}

/** Move a card to another column at a given index (drag & drop). */
export function moveCard(
  doc: Y.Doc,
  cardId: string,
  targetColumnId: string,
  targetOrderIndex: number,
): void {
  const { columns, cards } = getBoardDoc(doc);
  const card = cards.get(cardId);

  if (!card) return;

  doc.transact(() => {
    const source = columns.get(card.columnId);
    const target = columns.get(targetColumnId);

    if (!target) return;

    if (source) {
      columns.set(source.id, {
        ...source,
        cardIds: source.cardIds.filter((id) => id !== cardId),
      });
    }

    const targetIds =
      source?.id === target.id
        ? (columns.get(target.id)?.cardIds ?? []).filter((id) => id !== cardId)
        : [...target.cardIds];

    const index = Math.max(0, Math.min(targetOrderIndex, targetIds.length));
    targetIds.splice(index, 0, cardId);

    columns.set(target.id, { ...target, cardIds: targetIds });
    cards.set(cardId, { ...card, columnId: target.id, orderIndex: index });
  }, ORIGIN_LOCAL);
}

export function addColumn(doc: Y.Doc, boardId: string, name: string): string {
  const { meta, columns } = getBoardDoc(doc);

  const id = createId();
  const orderIndex = columns.size;

  doc.transact(() => {
    columns.set(id, {
      id,
      boardId,
      workspaceId: String(meta.get("workspaceId") ?? ""),
      name: name.trim(),
      orderIndex,
      cardIds: [],
    });
  }, ORIGIN_LOCAL);

  return id;
}

export function renameColumn(doc: Y.Doc, columnId: string, name: string): void {
  const { columns } = getBoardDoc(doc);
  const existing = columns.get(columnId);

  if (!existing) return;

  doc.transact(() => {
    columns.set(columnId, { ...existing, name: name.trim() });
  }, ORIGIN_LOCAL);
}

export function removeColumn(doc: Y.Doc, columnId: string): void {
  const { columns, cards } = getBoardDoc(doc);
  const existing = columns.get(columnId);

  if (!existing) return;

  doc.transact(() => {
    for (const cardId of existing.cardIds) {
      cards.delete(cardId);
    }
    columns.delete(columnId);
  }, ORIGIN_LOCAL);
}
