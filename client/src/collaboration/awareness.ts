import * as awarenessProtocol from "y-protocols/awareness";
import type { Awareness } from "y-protocols/awareness";
import type * as Y from "yjs";

/** Local user presence carried in awareness state. */
export interface AwarenessUser {
  userId: string;
  name?: string;
  color?: string;
  cursor?: {
    cardId?: string;
    columnId?: string;
    x?: number;
    y?: number;
  };
}

export type AwarenessChangeHandler = (peers: AwarenessUser[]) => void;

/**
 * Create an Awareness instance bound to a Y.Doc and
 * seed the local client state.
 */
export function createAwareness(doc: Y.Doc, user: AwarenessUser): Awareness {
  const awareness = new awarenessProtocol.Awareness(doc);
  setLocalUser(awareness, user);
  return awareness;
}

/**
 * Update (or set) the local user's awareness fields.
 */
export function setLocalUser(awareness: Awareness, user: AwarenessUser): void {
  awareness.setLocalStateField("user", {
    userId: user.userId,
    name: user.name,
    color: user.color,
    cursor: user.cursor,
  });
}

/**
 * Encode an awareness update for the given client IDs.
 * Defaults to the local client only.
 */
export function encodeAwarenessUpdate(
  awareness: Awareness,
  clients?: number[],
): Uint8Array {
  const ids = clients ?? [awareness.doc.clientID];
  return awarenessProtocol.encodeAwarenessUpdate(awareness, ids);
}

/**
 * Encode a full awareness snapshot of every known client.
 * Useful right after the WebSocket opens.
 */
export function encodeFullAwarenessUpdate(awareness: Awareness): Uint8Array {
  const clients = Array.from(awareness.getStates().keys());
  if (clients.length === 0) {
    return awarenessProtocol.encodeAwarenessUpdate(awareness, [
      awareness.doc.clientID,
    ]);
  }
  return awarenessProtocol.encodeAwarenessUpdate(awareness, clients);
}

/**
 * Apply a remote awareness update.
 *
 * `origin` lets callers distinguish remote vs local changes.
 */
export function applyAwarenessUpdate(
  awareness: Awareness,
  payload: Uint8Array,
  origin: unknown = "remote",
): void {
  if (payload.length === 0) return;
  awarenessProtocol.applyAwarenessUpdate(awareness, payload, origin);
}

/**
 * Collect remote peers (everyone except the local client).
 */
export function getRemotePeers(awareness: Awareness): AwarenessUser[] {
  const peers: AwarenessUser[] = [];
  const localId = awareness.doc.clientID;

  awareness.getStates().forEach((state, clientId) => {
    if (clientId === localId) return;
    const user = state?.user as AwarenessUser | undefined;
    if (user?.userId) {
      peers.push(user);
    }
  });

  return peers;
}

/**
 * Remove the local client from awareness (call on disconnect).
 */
export function removeLocalAwareness(awareness: Awareness): void {
  awarenessProtocol.removeAwarenessStates(
    awareness,
    [awareness.doc.clientID],
    "local",
  );
}

/**
 * Subscribe to awareness changes and receive a filtered
 * list of remote peers. Returns an unsubscribe function.
 */
export function subscribeToPeers(
  awareness: Awareness,
  onChange: AwarenessChangeHandler,
): () => void {
  const handler = () => {
    onChange(getRemotePeers(awareness));
  };

  awareness.on("change", handler);
  handler();

  return () => {
    awareness.off("change", handler);
  };
}
