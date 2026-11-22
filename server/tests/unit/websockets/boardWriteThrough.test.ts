import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Y from "yjs";

/**
 * HTTP writes reaching the live document.
 *
 * The reconciler projects the document onto Mongo and prunes what it does not
 * know about, so a card created over HTTP while the board was open was a row
 * waiting to be deleted. This is the other half of that fix, exercised against a
 * real `Y.Doc` — no database, no sockets.
 */

const mocks = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock(
  "../../../src/interfaces/websockets/collaboration/yjs/documentManager",
  () => ({ documentManager: { get: mocks.get } }),
);

import {
  applyToBoardDoc,
  moveCardRecord,
  removeCardRecord,
  upsertCardRecord,
} from "../../../src/interfaces/websockets/collaboration/yjs/boardWriteThrough";
import type { CollabCardRecord } from "../../../src/interfaces/websockets/collaboration/yjs/boardSchema";

const BOARD_ID = "board-1";

function seededDoc(): Y.Doc {
  const doc = new Y.Doc();

  doc.transact(() => {
    doc.getMap("meta").set("id", BOARD_ID);
    doc.getMap("columns").set("col-1", {
      id: "col-1",
      boardId: BOARD_ID,
      workspaceId: "ws-1",
      name: "To do",
      orderIndex: 0,
      cardIds: [],
    });
  });

  return doc;
}

function card(overrides: Partial<CollabCardRecord> = {}): CollabCardRecord {
  return {
    id: "card-1",
    columnId: "col-1",
    boardId: BOARD_ID,
    workspaceId: "ws-1",
    title: "Write the spec",
    description: "",
    dueDate: null,
    members: [],
    labels: [],
    checklists: [],
    orderIndex: 0,
    isArchived: false,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("applyToBoardDoc", () => {
  it("does nothing when no document is live", () => {
    mocks.get.mockReturnValue(undefined);

    expect(applyToBoardDoc(BOARD_ID, () => undefined)).toBe(false);
  });

  it("does nothing when the document has not been seeded", () => {
    /* Mongo is the truth there — the client seeds from it when it opens. */
    mocks.get.mockReturnValue({ doc: new Y.Doc() });

    expect(applyToBoardDoc(BOARD_ID, () => undefined)).toBe(false);
  });

  it("applies the change to a live, seeded document", () => {
    const doc = seededDoc();
    mocks.get.mockReturnValue({ doc });

    expect(applyToBoardDoc(BOARD_ID, (d) => upsertCardRecord(d, card()))).toBe(
      true,
    );
    expect(doc.getMap<CollabCardRecord>("cards").get("card-1")).toMatchObject({
      title: "Write the spec",
      columnId: "col-1",
    });
  });

  it("stamps the transaction with the http origin", () => {
    /* The broadcaster skips only the originating socket, and no socket matches
       this string — so every connected client receives the update. */
    const doc = seededDoc();
    mocks.get.mockReturnValue({ doc });

    const origins: unknown[] = [];
    doc.on("update", (_update: Uint8Array, origin: unknown) => {
      origins.push(origin);
    });

    applyToBoardDoc(BOARD_ID, (d) => upsertCardRecord(d, card()));

    expect(origins).toContain("http");
  });
});

describe("record mutations", () => {
  it("adds the card id to its column", () => {
    const doc = seededDoc();

    upsertCardRecord(doc, card());

    const column = doc.getMap<{ cardIds: string[] }>("columns").get("col-1");
    expect(column?.cardIds).toEqual(["card-1"]);
  });

  it("removes the card from the map and from every column", () => {
    const doc = seededDoc();
    upsertCardRecord(doc, card());

    removeCardRecord(doc, "card-1");

    expect(doc.getMap("cards").has("card-1")).toBe(false);
    expect(
      doc.getMap<{ cardIds: string[] }>("columns").get("col-1")?.cardIds,
    ).toEqual([]);
  });

  it("moves a card between columns without leaving a duplicate behind", () => {
    const doc = seededDoc();
    upsertCardRecord(doc, card());

    doc.transact(() => {
      doc.getMap("columns").set("col-2", {
        id: "col-2",
        boardId: BOARD_ID,
        workspaceId: "ws-1",
        name: "Done",
        orderIndex: 1,
        cardIds: [],
      });
    });

    moveCardRecord(doc, "card-1", "col-2", 0);

    const columns = doc.getMap<{ cardIds: string[] }>("columns");

    expect(columns.get("col-1")?.cardIds).toEqual([]);
    expect(columns.get("col-2")?.cardIds).toEqual(["card-1"]);
    expect(doc.getMap<CollabCardRecord>("cards").get("card-1")?.columnId).toBe(
      "col-2",
    );
  });
});
