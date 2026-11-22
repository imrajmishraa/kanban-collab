import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import {
  PRUNE_GRACE_MS,
  pruneFilters,
} from "../../../src/interfaces/websockets/collaboration/persistence/pruneFilters";

/**
 * What the reconciler may delete.
 *
 * Deleting is the dangerous half of reconciliation. The board gate is the
 * caller's job; this is the other guard — a row written in the last minute may
 * be an HTTP write still on its way into the document, and pruning it deletes
 * the thing that was just created.
 */

const BOARD = new Types.ObjectId("6517f1c2a4b8e9d0f1a2b3c4");
const NOW = Date.UTC(2026, 10, 22, 12, 0, 0);

describe("pruneFilters", () => {
  it("only prunes rows older than the grace window", () => {
    const filters = pruneFilters(BOARD, ["col-1"], ["card-1"], NOW);

    expect(filters.columns.createdAt).toEqual({
      $lt: new Date(NOW - PRUNE_GRACE_MS),
    });
    expect(filters.cards.createdAt).toEqual({
      $lt: new Date(NOW - PRUNE_GRACE_MS),
    });
  });

  it("keeps the column scope and the live ids", () => {
    const filters = pruneFilters(BOARD, ["col-1"], ["card-1"], NOW);

    expect(filters.columns).toMatchObject({
      boardId: BOARD,
      _id: { $nin: ["col-1"] },
    });
    expect(filters.cards).toMatchObject({
      boardId: BOARD,
      columnId: { $in: ["col-1"] },
      _id: { $nin: ["card-1"] },
    });
  });

  it("is a minute behind, not a moment", () => {
    expect(PRUNE_GRACE_MS).toBe(60_000);
  });
});
