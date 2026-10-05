import { describe, expect, it } from "vitest";

import {
  avatarColor,
  colorFor,
  formatRelative,
  initials,
  isOverdue,
  labelColor,
  reindex,
  reindexColumns,
  uid,
} from "./board.helpers";

import type { BoardCard, BoardColumn } from "@/types/api/dashboard/board";

const makeCard = (id: string, orderIndex: number) =>
  ({ id, orderIndex }) as unknown as BoardCard;

const makeColumn = (id: string, orderIndex: number) =>
  ({ id, orderIndex }) as unknown as BoardColumn;

describe("initials", () => {
  it("uses first + last initial for multi-word names", () => {
    expect(initials("Raj Mishra")).toBe("RM");
    expect(initials("Ada Lovelace King")).toBe("AK");
  });

  it("uses the first two letters for a single word", () => {
    expect(initials("Raj")).toBe("RA");
  });

  it("falls back to ? for a blank name", () => {
    expect(initials("   ")).toBe("?");
  });
});

describe("isOverdue", () => {
  it("is false for an undefined due date", () => {
    expect(isOverdue(undefined)).toBe(false);
  });

  it("is true for a past date", () => {
    expect(isOverdue(new Date(Date.now() - 60_000).toISOString())).toBe(true);
  });

  it("is false for a future date", () => {
    expect(isOverdue(new Date(Date.now() + 60_000).toISOString())).toBe(false);
  });
});

describe("colors", () => {
  it("colorFor is deterministic for the same seed", () => {
    expect(colorFor("board-1")).toBe(colorFor("board-1"));
  });

  it("avatarColor and labelColor return palette colors", () => {
    expect(avatarColor("user-1")).toMatch(/^#[0-9a-f]{6}$/i);
    expect(labelColor("bug")).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("uid", () => {
  it("prefixes the generated id", () => {
    expect(uid("card")).toMatch(/^card_/);
  });

  it("is unique across calls", () => {
    expect(uid("card")).not.toBe(uid("card"));
  });
});

describe("reindex", () => {
  it("rewrites orderIndex to a dense sequence", () => {
    const result = reindex([
      makeCard("a", 5),
      makeCard("b", 9),
      makeCard("c", 2),
    ]);

    expect(result.map((card) => card.orderIndex)).toEqual([0, 1, 2]);
    expect(result.map((card) => card.id)).toEqual(["a", "b", "c"]);
  });

  it("does not mutate the input", () => {
    const input = [makeCard("a", 7)];
    reindex(input);
    expect(input[0]?.orderIndex).toBe(7);
  });
});

describe("reindexColumns", () => {
  it("rewrites orderIndex to a dense sequence", () => {
    const result = reindexColumns([makeColumn("x", 4), makeColumn("y", 8)]);
    expect(result.map((column) => column.orderIndex)).toEqual([0, 1]);
  });
});

describe("formatRelative", () => {
  it("renders hours for a few hours ago", () => {
    expect(
      formatRelative(new Date(Date.now() - 3 * 3_600_000).toISOString()),
    ).toBe("3h ago");
  });

  it("renders 'just now' for the present", () => {
    expect(formatRelative(new Date().toISOString())).toBe("just now");
  });
});
