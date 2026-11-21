import { redisLogger } from "../logging/childLogger";
import { getCacheClient } from "./cacheClient";

/**
 * The board-details payload, and the one thing that keeps it honest.
 *
 * `GET /boards/:id` caches the whole board — board, columns **and** cards — for
 * a minute. Only the board's own update path ever dropped that key, so every
 * other writer left a payload behind that disagreed with the database: create a
 * card, refresh, and it is missing until the TTL runs out. The reconciler had
 * the same effect from the other side, quietly re-staling the board after every
 * live edit.
 *
 * The key and the TTL live here so the reader and the invalidator cannot drift
 * apart — a mismatched key is a cache that never invalidates, and it fails
 * silently.
 */
export const BOARD_CACHE_TTL_SECONDS = 60;

export function boardCacheKey(boardId: string): string {
  return `board:${boardId}`;
}

/**
 * Drop the cached board payload after any write that changes it.
 *
 * Never throws. The write it follows has already been committed, and a cache
 * that cannot be reached must not turn that into a 500 — the cost of a failed
 * invalidation is one stale read, not a lost write.
 */
export async function invalidateBoardCache(boardId: string): Promise<void> {
  try {
    const cache = await getCacheClient();

    await cache.del(boardCacheKey(boardId));
  } catch (error) {
    redisLogger.warn({ err: error, boardId }, "Board cache invalidate failed");
  }
}

/**
 * Read the cached payload, or `null` when there is none (or Redis is away).
 *
 * The `null` is deliberate and covers both cases: a caller cannot act
 * differently on "no cache" and "cache unreachable", and a read that fails must
 * fall through to the database rather than fail the request.
 */
export async function readBoardCache(boardId: string): Promise<string | null> {
  try {
    const cache = await getCacheClient();

    return await cache.get(boardCacheKey(boardId));
  } catch (error) {
    redisLogger.warn({ err: error, boardId }, "Board cache read failed");

    return null;
  }
}

/** Store the payload under the same key `invalidateBoardCache` deletes. */
export async function writeBoardCache(
  boardId: string,
  payload: string,
): Promise<void> {
  try {
    const cache = await getCacheClient();

    await cache.setEx(boardCacheKey(boardId), BOARD_CACHE_TTL_SECONDS, payload);
  } catch (error) {
    redisLogger.warn({ err: error, boardId }, "Board cache write failed");
  }
}
