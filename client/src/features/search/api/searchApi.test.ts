import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The card-search contract, which the palette and the server disagreed about.
 *
 * The palette sent `query`; the server only ever read `q`, so it answered 400 to
 * every request and the "Cards" scope was permanently empty. The server answers
 * `{ cards }`, not `{ results, total }` either. Both halves are pinned here,
 * because a renamed parameter is a silent failure, not a compile error.
 */

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/client", () => ({
  apiClient: { get },
}));

import { searchApi } from "./searchApi";

const BOARD_ID = "6517f1c2a4b8e9d0f1a2b3c4";

const response = {
  data: {
    statusCode: 200,
    success: true,
    message: "Card search results",
    data: { cards: [{ id: "c1", title: "Checkout", columnId: "col-1" }] },
  },
};

describe("searchApi.searchCards", () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue(response);
  });

  it("sends the query as `q`, which is what the server reads", async () => {
    await searchApi.searchCards({ boardId: BOARD_ID, q: "checkout" });

    expect(get).toHaveBeenCalledWith("/cards/search", {
      params: { boardId: BOARD_ID, q: "checkout" },
    });
  });

  it("passes a limit through when one is asked for", async () => {
    await searchApi.searchCards({ boardId: BOARD_ID, q: "x", limit: 5 });

    expect(get).toHaveBeenCalledWith("/cards/search", {
      params: { boardId: BOARD_ID, q: "x", limit: 5 },
    });
  });

  it("returns the server's `cards`, which is the field it actually sends", async () => {
    const result = await searchApi.searchCards({ boardId: BOARD_ID, q: "x" });

    expect(result.cards).toHaveLength(1);
    expect(result.cards[0]?.title).toBe("Checkout");
  });
});
