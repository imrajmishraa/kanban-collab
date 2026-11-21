import { describe, expect, it } from "vitest";

import { searchCardsQuerySchema } from "../../../src/interfaces/http/validators/kanban/search.validator";

/**
 * `GET /cards/search` had no schema at all.
 *
 * The two 500s this pins: `?q=a&q=b` arrived as an array and went straight into
 * `$text.$search`, and a duplicated `boardId` was cast `as string` and handed to
 * `findById`. Neither could be reached through the palette, which is exactly why
 * nobody noticed.
 */

const BOARD_ID = "6517f1c2a4b8e9d0f1a2b3c4";

describe("searchCardsQuerySchema", () => {
  it("accepts the palette's request and defaults the limit", () => {
    const result = searchCardsQuerySchema.safeParse({
      boardId: BOARD_ID,
      q: "checkout",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      boardId: BOARD_ID,
      q: "checkout",
      limit: 20,
    });
  });

  it("rejects a repeated q instead of passing an array to $text", () => {
    const result = searchCardsQuerySchema.safeParse({
      boardId: BOARD_ID,
      q: ["a", "b"],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a repeated boardId instead of casting it to a string", () => {
    const result = searchCardsQuerySchema.safeParse({
      boardId: [BOARD_ID, BOARD_ID],
      q: "checkout",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing or blank query", () => {
    expect(
      searchCardsQuerySchema.safeParse({ boardId: BOARD_ID }).success,
    ).toBe(false);
    expect(
      searchCardsQuerySchema.safeParse({ boardId: BOARD_ID, q: "   " }).success,
    ).toBe(false);
  });

  it("rejects a board id that is not an ObjectId", () => {
    expect(
      searchCardsQuerySchema.safeParse({ boardId: "board-1", q: "x" }).success,
    ).toBe(false);
  });

  it("caps the query length", () => {
    expect(
      searchCardsQuerySchema.safeParse({
        boardId: BOARD_ID,
        q: "a".repeat(101),
      }).success,
    ).toBe(false);
  });

  it("coerces the limit and refuses one above the cap", () => {
    const ok = searchCardsQuerySchema.safeParse({
      boardId: BOARD_ID,
      q: "x",
      limit: "5",
    });
    expect(ok.success).toBe(true);
    expect(ok.data?.limit).toBe(5);

    expect(
      searchCardsQuerySchema.safeParse({
        boardId: BOARD_ID,
        q: "x",
        limit: "51",
      }).success,
    ).toBe(false);
    expect(
      searchCardsQuerySchema.safeParse({
        boardId: BOARD_ID,
        q: "x",
        limit: "0",
      }).success,
    ).toBe(false);
  });

  it("trims the query", () => {
    const result = searchCardsQuerySchema.safeParse({
      boardId: BOARD_ID,
      q: "  checkout  ",
    });

    expect(result.data?.q).toBe("checkout");
  });
});
