import type { WebSocket } from "ws";
import * as Y from "yjs";
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
  cursor?: {
    cardId?: string;
  };
}

export interface ManagedDocument {
  readonly name: string;
  readonly doc: Y.Doc;
  readonly awareness: Awareness;

  readonly createdAt: Date;

  updatedAt: Date;
  lastAccessedAt: Date;

  connectionCount: number;
  loaded: boolean;
  destroyed: boolean;

  clients: Map<string, CollaborationClient>;
}
