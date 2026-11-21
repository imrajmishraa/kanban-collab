import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The board cache, and the one property that keeps it correct: the key the
 * reader writes under is the key the invalidator deletes.
 *
 * The bug this guards against was not a wrong TTL or a missed `del` in one
 * handler — it was that the key was written out by hand in three places
 * (`` `board:${id}` ``), so nothing tied them together and card writes simply
 * never invalidated at all. A card created over HTTP then vanished from the
 * board for up to a minute.
 */

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  setEx: vi.fn(),
  del: vi.fn(),
  logWarn: vi.fn(),
}));

vi.mock("../../../src/infrastructure/cache/cacheClient", () => ({
  getCacheClient: async () => ({
    get: mocks.get,
    setEx: mocks.setEx,
    del: mocks.del,
  }),
}));

vi.mock("../../../src/infrastructure/logging/childLogger", () => ({
  redisLogger: { warn: mocks.logWarn },
}));

import {
  BOARD_CACHE_TTL_SECONDS,
  boardCacheKey,
  invalidateBoardCache,
  readBoardCache,
  writeBoardCache,
} from "../../../src/infrastructure/cache/boardCache";

const BOARD_ID = "6517f1c2a4b8e9d0f1a2b3c4";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("boardCacheKey", () => {
  it("namespaces the board id", () => {
    expect(boardCacheKey(BOARD_ID)).toBe(`board:${BOARD_ID}`);
  });
});

describe("the write and the invalidate agree on the key", () => {
  it("writes and deletes the same key", async () => {
    await writeBoardCache(BOARD_ID, '{"ok":true}');
    await invalidateBoardCache(BOARD_ID);

    expect(mocks.setEx).toHaveBeenCalledWith(
      `board:${BOARD_ID}`,
      BOARD_CACHE_TTL_SECONDS,
      '{"ok":true}',
    );
    expect(mocks.del).toHaveBeenCalledWith(`board:${BOARD_ID}`);
    expect(mocks.setEx.mock.calls[0]![0]).toBe(mocks.del.mock.calls[0]![0]);
  });

  it("reads the same key it writes", async () => {
    mocks.get.mockResolvedValue('{"ok":true}');

    await expect(readBoardCache(BOARD_ID)).resolves.toBe('{"ok":true}');
    expect(mocks.get).toHaveBeenCalledWith(`board:${BOARD_ID}`);
  });
});

describe("a cache that is away never breaks the request", () => {
  it("reads as a miss instead of throwing", async () => {
    mocks.get.mockRejectedValue(new Error("redis is down"));

    await expect(readBoardCache(BOARD_ID)).resolves.toBeNull();
    expect(mocks.logWarn).toHaveBeenCalled();
  });

  it("swallows a failed write", async () => {
    mocks.setEx.mockRejectedValue(new Error("redis is down"));

    await expect(writeBoardCache(BOARD_ID, "{}")).resolves.toBeUndefined();
    expect(mocks.logWarn).toHaveBeenCalled();
  });

  it("swallows a failed invalidate, because the write already happened", async () => {
    mocks.del.mockRejectedValue(new Error("redis is down"));

    await expect(invalidateBoardCache(BOARD_ID)).resolves.toBeUndefined();
    expect(mocks.logWarn).toHaveBeenCalled();
  });
});
