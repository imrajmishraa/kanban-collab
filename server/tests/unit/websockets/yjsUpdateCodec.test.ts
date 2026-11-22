import { describe, expect, it } from "vitest";
import * as Y from "yjs";

import { canDecodeYjsUpdate } from "../../../src/interfaces/websockets/collaboration/persistence/yjsUpdateCodec";

/**
 * The check that stops one bad row from bricking a board.
 *
 * `Unexpected end of array` from `Y.applyUpdate` used to reach `bindState`, which
 * rethrows — so a board whose stored update was truncated failed to open on every
 * reconnect, and the client retried forever.
 */

/** ASCII → bytes, without reaching for `Buffer` (no Node types in this project). */
function bytes(text: string): Uint8Array {
  return new Uint8Array([...text].map((character) => character.charCodeAt(0)));
}

function realUpdate(): Uint8Array {
  const doc = new Y.Doc();

  doc.getMap("meta").set("id", "board-1");

  return Y.encodeStateAsUpdate(doc);
}

describe("canDecodeYjsUpdate", () => {
  it("accepts an update Yjs wrote", () => {
    expect(canDecodeYjsUpdate(realUpdate())).toBe(true);
  });

  it("rejects a truncated update — the actual failure in the logs", () => {
    const full = realUpdate();
    const cut = full.slice(0, Math.max(1, full.length - 3));

    expect(canDecodeYjsUpdate(cut)).toBe(false);
  });

  it("rejects an empty buffer", () => {
    expect(canDecodeYjsUpdate(new Uint8Array())).toBe(false);
  });

  it("rejects something that was never an update", () => {
    /* e.g. a JSON dump or a base64 string that reached the Buffer column.
       Plain `Uint8Array`, not `Buffer`: this file is checked by an editor
       project that has no Node types (see `tsconfig.json`, which excludes
       `tests/**`), and the function under test takes bytes either way. */
    expect(canDecodeYjsUpdate(bytes('{"type":"Buffer","data":[]}'))).toBe(
      false,
    );
    expect(canDecodeYjsUpdate(bytes("bm90IGEgeWpzIHVwZGF0ZQ=="))).toBe(false);
  });
});
