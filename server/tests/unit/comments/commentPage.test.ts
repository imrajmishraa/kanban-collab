import { describe, expect, it } from "vitest";

import {
  readCachedPage,
  shapeCommentPage,
} from "../../../src/application/comments/commentPage";

/**
 * The first page of comments, and the row that proves there is a second.
 *
 * The query fetches `limit + 1`; the extra row exists only to answer "is there
 * more". The cache stored the sliced page, so a hit lost that answer and the
 * second page became unreachable until the entry expired.
 */

const row = (id: string) => ({ _id: id });

describe("shapeCommentPage", () => {
  it("keeps the page and the answer, and drops the extra row", () => {
    const page = shapeCommentPage([row("c"), row("b"), row("a")], 2);

    expect(page.items).toHaveLength(2);
    expect(page.hasMore).toBe(true);
  });

  it("says there is no more when the extra row is absent", () => {
    const page = shapeCommentPage([row("b"), row("a")], 2);

    expect(page.items).toHaveLength(2);
    expect(page.hasMore).toBe(false);
  });
});

describe("readCachedPage", () => {
  it("reads back what shapeCommentPage wrote", () => {
    const written = JSON.stringify(shapeCommentPage([row("c"), row("b")], 1));

    expect(readCachedPage(written)).toEqual({
      items: [row("c")],
      hasMore: true,
    });
  });

  it("discards a value in the old array shape", () => {
    /* It cannot say whether another page exists, which is the bug. */
    expect(readCachedPage(JSON.stringify([row("a")]))).toBeNull();
  });

  it("discards junk and empty values", () => {
    expect(readCachedPage(null)).toBeNull();
    expect(readCachedPage("")).toBeNull();
    expect(readCachedPage("{not json")).toBeNull();
    expect(
      readCachedPage(JSON.stringify({ items: [], hasMore: "yes" })),
    ).toBeNull();
  });
});
