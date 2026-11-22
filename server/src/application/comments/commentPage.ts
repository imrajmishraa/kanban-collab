/**
 * The first page of a card's comments, and the one bit of metadata that made
 * caching it wrong.
 *
 * The query fetches `limit + 1` rows: the extra one is not shown, it exists to
 * answer "is there another page". The cache used to store the sliced page, so on
 * a hit the extra row was gone, `hasMore` came back false and `nextCursor` was
 * null — the second page was unreachable until the cache expired. These two
 * functions are the shape that keeps the answer, and the reader that survives a
 * value cached in the old shape.
 */

/** Rows older than this key's version are simply re-read. */
export interface CommentPage<T> {
  items: T[];
  hasMore: boolean;
}

/**
 * Split a `limit + 1` result into the page and the answer.
 *
 * `nextCursor` is derived from the last item of the page, not from the extra
 * row, so it is not part of this shape — the caller has the items.
 */
export function shapeCommentPage<T>(
  rows: readonly T[],
  limit: number,
): CommentPage<T> {
  return {
    items: rows.slice(0, limit),
    hasMore: rows.length > limit,
  };
}

/**
 * Parse a cached value, or `null` when there is nothing usable.
 *
 * A bare array is a value written by the previous version. It is discarded
 * rather than trusted: it cannot say whether another page exists, which is the
 * bug this shape exists to fix.
 */
export function readCachedPage<T>(
  raw: string | null | undefined,
): CommentPage<T> | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !Array.isArray((parsed as { items?: unknown }).items) ||
      typeof (parsed as { hasMore?: unknown }).hasMore !== "boolean"
    ) {
      return null;
    }

    return parsed as CommentPage<T>;
  } catch {
    return null;
  }
}
