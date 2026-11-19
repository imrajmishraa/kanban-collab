import type { WebSocket } from "ws";
import type * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";

export interface CollaborationClient {
  id: string;
  userId: string;
  socket: WebSocket;
}

export interface DecodedMessage {
  type: number;
  payload?: Uint8Array;
}

export interface AwarenessState {
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

export type DocumentPhase = "active" | "destroying" | "destroyed";

/** True only while the document can accept clients and traffic. */
export function isDocumentUsable(phase: DocumentPhase): boolean {
  return phase === "active";
}

export interface ManagedDocument {
  readonly name: string;
  readonly doc: Y.Doc;
  readonly awareness: Awareness;

  readonly createdAt: Date;

  updatedAt: Date;
  lastAccessedAt: Date;

  connectionCount: number;

  /**
   * Where this document is in its life.
   *
   * `active`     — usable: clients attach, updates broadcast, persistence runs
   * `destroying` — teardown started; nothing new may attach, but the flush to
   *                Mongo and the Redis unsubscribe are still in flight
   * `destroyed`  — torn down and unregistered
   *
   * A single phase replaces the `loaded`/`destroyed` pair, because "not
   * destroyed" was true during teardown too: a connection arriving mid-destroy
   * attached to a document that was about to have its awareness and Y.Doc
   * destroyed underneath it.
   */
  phase: DocumentPhase;

  clients: Map<string, CollaborationClient>;
}
