import { describe, expect, it } from "vitest";

import { neighbourColumnId } from "./columnNeighbour";

/**
 * The keyboard half of moving a card.
 *
 * Dragging never fires on a touch device and has no keyboard equivalent, so the
 * board is unusable there. This is the rule the arrow keys use.
 */

const columns = [{ id: "todo" }, { id: "doing" }, { id: "done" }];

describe("neighbourColumnId", () => {
  it("steps right and left", () => {
    expect(neighbourColumnId(columns, "todo", "right")).toBe("doing");
    expect(neighbourColumnId(columns, "done", "left")).toBe("doing");
  });

  it("stops at the edge instead of wrapping", () => {
    /* A card that jumps from Done to To do on a stray arrow is worse than
       nothing happening. */
    expect(neighbourColumnId(columns, "todo", "left")).toBeNull();
    expect(neighbourColumnId(columns, "done", "right")).toBeNull();
  });

  it("returns null for a column that is not on the board", () => {
    expect(neighbourColumnId(columns, "missing", "right")).toBeNull();
  });

  it("handles a single-column board", () => {
    expect(neighbourColumnId([{ id: "only" }], "only", "right")).toBeNull();
    expect(neighbourColumnId([{ id: "only" }], "only", "left")).toBeNull();
  });
});
