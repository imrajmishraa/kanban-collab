import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import * as ySyncProtocol from "y-protocols/sync";
import type * as Y from "yjs";

/** Top-level collaboration message types (must match server). */
export const CollaborationMessage = {
  Sync: 0,
  Awareness: 1,
} as const;

export type CollaborationMessageType =
  (typeof CollaborationMessage)[keyof typeof CollaborationMessage];

export function encodeCollaborationMessage(
  type: CollaborationMessageType,
  payload?: Uint8Array,
): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, type);
  if (payload && payload.length > 0) {
    encoding.writeUint8Array(encoder, payload);
  }
  return encoding.toUint8Array(encoder);
}

/**
 * Decode a top-level collaboration message.
 */
export function decodeCollaborationMessage(data: ArrayBuffer | Uint8Array): {
  type: number;
  payload: Uint8Array;
} {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (bytes.length === 0) {
    throw new Error("Empty collaboration message.");
  }

  const decoder = decoding.createDecoder(bytes);
  const type = decoding.readVarUint(decoder);
  const remaining = decoder.arr.length - decoder.pos;
  const payload =
    remaining > 0
      ? decoder.arr.slice(decoder.pos, decoder.arr.length)
      : new Uint8Array(0);

  return { type, payload };
}

/**
 * Build a Sync Step 1 payload (state vector request).
 */
export function encodeSyncStep1(doc: Y.Doc): Uint8Array {
  const encoder = encoding.createEncoder();
  ySyncProtocol.writeSyncStep1(encoder, doc);
  return encoding.toUint8Array(encoder);
}

/**
 * Build a Sync Update payload from a raw Yjs update.
 */
export function encodeSyncUpdate(update: Uint8Array): Uint8Array {
  const encoder = encoding.createEncoder();
  ySyncProtocol.writeUpdate(encoder, update);
  return encoding.toUint8Array(encoder);
}

/**
 * Apply an incoming y-protocols/sync payload to the document.
 *
 * Returns a response payload when Yjs needs to reply
 * (e.g. Sync Step 2 after receiving Step 1). An empty
 * Uint8Array means no reply is required.
 *
 * `origin` is attached to any transaction so local
 * update listeners can ignore remote changes.
 */
export function applySyncMessage(
  doc: Y.Doc,
  payload: Uint8Array,
  origin: unknown = "remote",
): Uint8Array {
  if (payload.length === 0) {
    return new Uint8Array(0);
  }

  const decoder = decoding.createDecoder(payload);
  const encoder = encoding.createEncoder();

  ySyncProtocol.readSyncMessage(decoder, encoder, doc, origin);

  if (encoding.length(encoder) === 0) {
    return new Uint8Array(0);
  }

  return encoding.toUint8Array(encoder);
}
