import { randomUUID } from "node:crypto";
import type WebSocket from "ws";

import { websocketLogger } from "../../../../infrastructure/logging/childLogger";

export interface ManagedConnection {
  readonly id: string;
  readonly socket: WebSocket;
  readonly userId: string;
  readonly boardId: string;
  readonly ip: string;

  readonly connectedAt: Date;
  lastSeen: Date;
}

export class ConnectionRegistry {
  // connectionId -> ManagedConnection
  private readonly connections = new Map<string, ManagedConnection>();

  // WebSocket -> connectionId
  private readonly socketIndex = new WeakMap<WebSocket, string>();

  // boardId -> connectionIds
  private readonly boardIndex = new Map<string, Set<string>>();

  // userId -> connectionIds
  private readonly userIndex = new Map<string, Set<string>>();

  /**
   * Registers a new WebSocket connection.
   */
  public register(
    socket: WebSocket,
    userId: string,
    boardId: string,
    ip: string,
  ): ManagedConnection {
    const now = new Date();

    const connection: ManagedConnection = {
      id: randomUUID(),
      socket,
      userId,
      boardId,
      ip,
      connectedAt: now,
      lastSeen: now,
    };

    this.connections.set(connection.id, connection);
    this.socketIndex.set(socket, connection.id);

    this.addIndex(this.boardIndex, boardId, connection.id);

    this.addIndex(this.userIndex, userId, connection.id);

    websocketLogger.debug(
      {
        connectionId: connection.id,
        userId,
        boardId,
        ip,
        activeConnections: this.connections.size,
      },
      "WebSocket connection registered.",
    );

    return connection;
  }

  /**
   * Removes a WebSocket connection and all related indexes.
   */
  public unregister(socket: WebSocket): void {
    const connection = this.getBySocket(socket);

    if (!connection) {
      return;
    }

    this.connections.delete(connection.id);
    this.socketIndex.delete(socket);

    this.removeIndex(this.boardIndex, connection.boardId, connection.id);

    this.removeIndex(this.userIndex, connection.userId, connection.id);

    websocketLogger.debug(
      {
        connectionId: connection.id,
        userId: connection.userId,
        boardId: connection.boardId,
        activeConnections: this.connections.size,
      },
      "WebSocket connection unregistered.",
    );
  }

  /**
   * Returns a connection associated with a WebSocket.
   */
  public getBySocket(socket: WebSocket): ManagedConnection | undefined {
    const connectionId = this.socketIndex.get(socket);

    if (!connectionId) {
      return undefined;
    }

    return this.connections.get(connectionId);
  }

  /**
   * Returns a connection by its ID.
   */
  public get(connectionId: string): ManagedConnection | undefined {
    return this.connections.get(connectionId);
  }

  /**
   * Returns all active WebSocket connections.
   */
  public getConnections(): readonly ManagedConnection[] {
    return [...this.connections.values()];
  }

  /**
   * Returns all active connections belonging to a board.
   */
  public getBoardConnections(boardId: string): readonly ManagedConnection[] {
    return this.getIndexedConnections(this.boardIndex, boardId);
  }

  /**
   * Returns all active connections belonging to a user.
   */
  public getUserConnections(userId: string): readonly ManagedConnection[] {
    return this.getIndexedConnections(this.userIndex, userId);
  }

  /**
   * Updates the last activity timestamp for a connection.
   */
  public updateLastSeen(socket: WebSocket): void {
    const connection = this.getBySocket(socket);

    if (!connection) {
      return;
    }

    connection.lastSeen = new Date();
  }

  /**
   * Returns the number of active WebSocket connections.
   */
  public getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Returns the number of boards with active connections.
   */
  public getBoardCount(): number {
    return this.boardIndex.size;
  }

  /**
   * Returns the number of users with active connections.
   */
  public getUserCount(): number {
    return this.userIndex.size;
  }

  /**
   * Removes every active connection and clears all indexes.
   *
   * Intended for graceful shutdown and testing.
   */
  public clear(): void {
    for (const connection of this.connections.values()) {
      this.socketIndex.delete(connection.socket);
    }

    this.connections.clear();
    this.boardIndex.clear();
    this.userIndex.clear();

    websocketLogger.info("WebSocket connection registry cleared.");
  }

  /**
   * Adds a connection ID to an index.
   */
  private addIndex(
    index: Map<string, Set<string>>,
    key: string,
    connectionId: string,
  ): void {
    let connectionIds = index.get(key);

    if (!connectionIds) {
      connectionIds = new Set<string>();
      index.set(key, connectionIds);
    }

    connectionIds.add(connectionId);
  }

  /**
   * Removes a connection ID from an index.
   */
  private removeIndex(
    index: Map<string, Set<string>>,
    key: string,
    connectionId: string,
  ): void {
    const connectionIds = index.get(key);

    if (!connectionIds) {
      return;
    }

    connectionIds.delete(connectionId);

    if (connectionIds.size === 0) {
      index.delete(key);
    }
  }

  /**
   * Resolves connection IDs from an index
   * into their active connection objects.
   */
  private getIndexedConnections(
    index: Map<string, Set<string>>,
    key: string,
  ): readonly ManagedConnection[] {
    const connectionIds = index.get(key);

    if (!connectionIds) {
      return [];
    }

    const connections: ManagedConnection[] = [];

    for (const connectionId of connectionIds) {
      const connection = this.connections.get(connectionId);

      if (connection) {
        connections.push(connection);
      }
    }

    return connections;
  }
}

/**
 * Singleton connection registry.
 */
export const connectionRegistry = new ConnectionRegistry();
