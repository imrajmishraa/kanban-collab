import type { CollabCardRecord, CollabColumnRecord } from "./boardSchema";

/**
 * Mongo row → the record the live document holds.
 *
 * Kept in one place so an HTTP write and the reconciler cannot disagree about
 * what a card looks like inside the CRDT — the two writing different shapes is
 * how a board ends up with fields that survive one path and vanish on the other.
 */

/** The subset of a Mongoose card (or a lean row) this needs. */
export interface CardLike {
  _id: { toString(): string };
  columnId: { toString(): string };
  boardId: { toString(): string };
  workspaceId: { toString(): string };
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  members?: Array<{ toString(): string }>;
  labels?: string[];
  checklists?: Array<{ title: string; isCompleted: boolean }>;
  orderIndex?: number;
  isArchived?: boolean;
}

export interface ColumnLike {
  _id: { toString(): string };
  boardId: { toString(): string };
  workspaceId: { toString(): string };
  name: string;
  orderIndex?: number;
}

export function toCardRecord(card: CardLike): CollabCardRecord {
  return {
    id: card._id.toString(),
    columnId: card.columnId.toString(),
    boardId: card.boardId.toString(),
    workspaceId: card.workspaceId.toString(),
    title: card.title,
    description: card.description ?? "",
    dueDate: card.dueDate ? card.dueDate.toISOString() : null,
    members: (card.members ?? []).map((member) => member.toString()),
    labels: card.labels ?? [],
    checklists: card.checklists ?? [],
    orderIndex: card.orderIndex ?? 0,
    isArchived: card.isArchived ?? false,
  };
}

export function toColumnRecord(
  column: ColumnLike,
  cardIds: string[] = [],
): CollabColumnRecord {
  return {
    id: column._id.toString(),
    boardId: column.boardId.toString(),
    workspaceId: column.workspaceId.toString(),
    name: column.name,
    orderIndex: column.orderIndex ?? 0,
    cardIds,
  };
}
