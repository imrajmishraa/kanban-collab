export interface CollaborationClient {
  id: string;
  socket: WebSocket;
  userId: string;
  boardId: string;
}

export interface CollaborationStats {
  activeConnections: number;
  activeUsers: number;
  activeBoards: number;
  activeDocuments: number;
}

export interface CollaborationMessageMetrics {
  received: number;
  sent: number;
  syncMessages: number;
  awarenessMessages: number;
  invalidMessages: number;
}
