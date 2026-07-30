import type { WebSocket } from "ws";

export interface CollaborationClient {
  id: string;
  socket: WebSocket;
}

export interface AwarenessState {
  userId: string;
  name?: string;

  cursor?: {
    cardId?: string;
  };
}
