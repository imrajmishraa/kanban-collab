import type { Types } from "mongoose";

/**
 * What the reconciler is allowed to delete.
 *
 * Deleting is the dangerous half of reconciliation, and it had two ways to be
 * wrong. It could wipe a board whose document had not been seeded (closed by the
 * `liveColumnIds.length > 0` gate), and it could delete a row written in the
 * last few seconds by a path the document had not heard about yet — an HTTP
 * write still in flight, a client that has not applied its own update.
 *
 * The grace window is the second half: nothing younger than a minute is pruned,
 * so a write that is about to reach the document is never raced by a delete.
 */
export const PRUNE_GRACE_MS = 60_000;

export interface PruneFilters {
  columns: Record<string, unknown>;
  cards: Record<string, unknown>;
}

export function pruneFilters(
  boardId: Types.ObjectId,
  liveColumnIds: readonly unknown[],
  liveCardIds: readonly unknown[],
  now: number = Date.now(),
): PruneFilters {
  const olderThan = new Date(now - PRUNE_GRACE_MS);

  return {
    columns: {
      boardId,
      _id: { $nin: liveColumnIds },
      createdAt: { $lt: olderThan },
    },
    cards: {
      boardId,
      columnId: { $in: liveColumnIds },
      _id: { $nin: liveCardIds },
      createdAt: { $lt: olderThan },
    },
  };
}
