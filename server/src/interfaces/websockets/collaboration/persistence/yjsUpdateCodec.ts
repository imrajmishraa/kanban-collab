import * as Y from "yjs";

/**
 * Can this stored blob be applied to a document?
 *
 * A row in `yjsupdates` holds one full state update per board. If that blob is
 * truncated, or was written in some other shape, `Y.applyUpdate` throws
 * `Unexpected end of array` — and because `bindState` rethrows on failure (so a
 * board is never silently replaced by an empty document), the board then fails
 * to open *at all*, on every reconnect.
 *
 * Checking first turns that into a decision the caller can make: quarantine the
 * unreadable row and start from the projection Mongo already holds, which the
 * client seeds from. The CRDT state in that one row is unreadable either way —
 * this is about not letting it brick the board.
 *
 * The check applies the blob to a throwaway document: Yjs has no "validate"
 * entry point, and applying to a scratch doc is the same work the real bind does.
 */
export function canDecodeYjsUpdate(update: Uint8Array): boolean {
  if (update.length === 0) {
    return false;
  }

  try {
    Y.applyUpdate(new Y.Doc(), update);

    return true;
  } catch {
    return false;
  }
}
