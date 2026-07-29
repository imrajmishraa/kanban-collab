import { randomUUID } from "node:crypto";

import type WebSocket from "ws";

export interface ManagedConnection {
  id: string;
  socket: WebSocket;
  userId: string;
  boardId: string;
  ip: string;
  connectedAt: Date;
  lastSeen: Date;
}

export class ConnectionRegistry {
  // connectionId -> ManagedConnection
  private readonly connections = new Map<
    string,
    ManagedConnection
  >();

  // socket -> connectionId
  private readonly socketIndex = new WeakMap<
    WebSocket,
    string
  >();

  // boardId -> connectionIds
  private readonly boardIndex = new Map<
    string,
    Set<string>
  >();

  // userId -> connectionIds
  private readonly userIndex = new Map<
    string,
    Set<string>
  >();

  //  Registers a new connection.
  public register(
    socket: WebSocket,
    userId: string,
    boardId: string,
    ip: string,
  ): ManagedConnection {
    const connection: ManagedConnection = {
      id: randomUUID(),
      socket,
      userId,
      boardId,
      ip,
      connectedAt: new Date(),
      lastSeen: new Date(),
    };

    this.connections.set(connection.id, connection);
    this.socketIndex.set(socket, connection.id);
    this.addIndex(this.boardIndex, boardId, connection.id);
    this.addIndex(this.userIndex, userId, connection.id);

    return connection;
  }

  // Removes a connection.
  public unregister(socket: WebSocket): void {
    const connection = this.getBySocket(socket);

    if (!connection) {
      return;
    }

    this.connections.delete(connection.id);

    this.removeIndex(
      this.boardIndex,
      connection.boardId,
      connection.id,
    );

    this.removeIndex(
      this.userIndex,
      connection.userId,
      connection.id,
    );
  }

  //  Returns a connection by socket.
  public getBySocket(
    socket: WebSocket,
  ): ManagedConnection | undefined {
    const id = this.socketIndex.get(socket);

    if (!id) {
      return undefined;
    }

    return this.connections.get(id);
  }

  // Returns a connection by id.
  public get(
    connectionId: string,
  ): ManagedConnection | undefined {
    return this.connections.get(connectionId);
  }

  // Returns every active connection.
  public getConnections(): readonly ManagedConnection[] {
    return [...this.connections.values()];
  }

  //  Returns all connections in a board.
  public getBoardConnections(
    boardId: string,
  ): readonly ManagedConnection[] {
    const ids = this.boardIndex.get(boardId);

    if (!ids) {
      return [];
    }

    return [...ids]
      .map((id) => this.connections.get(id))
      .filter(
        (
          connection,
        ): connection is ManagedConnection =>
          connection !== undefined,
      );
  }

  // Returns every connection belonging to a user.
  public getUserConnections(
    userId: string,
  ): readonly ManagedConnection[] {
    const ids = this.userIndex.get(userId);

    if (!ids) {
      return [];
    }

    return [...ids]
      .map((id) => this.connections.get(id))
      .filter(
        (
          connection,
        ): connection is ManagedConnection =>
          connection !== undefined,
      );
  }

  // Updates last activity timestamp.
  public updateLastSeen(
    socket: WebSocket,
  ): void {
    const connection = this.getBySocket(socket);

    if (!connection) {
      return;
    }

    connection.lastSeen = new Date();
  }

  // Returns number of active connections.
  public getConnectionCount(): number {
    return this.connections.size;
  }

  //  Returns number of active boards.
  public getBoardCount(): number {
    return this.boardIndex.size;
  }

  // Returns number of connected users.
  public getUserCount(): number {
    return this.userIndex.size;
  }

  // Removes every connection.
  public clear(): void {
    this.connections.clear();
    this.boardIndex.clear();
    this.userIndex.clear();
  }

  private addIndex(
    index: Map<string, Set<string>>,
    key: string,
    connectionId: string,
  ): void {
    let set = index.get(key);

    if (!set) {
      set = new Set();

      index.set(key, set);
    }

    set.add(connectionId);
  }

  private removeIndex(
    index: Map<string, Set<string>>,
    key: string,
    connectionId: string,
  ): void {
    const set = index.get(key);

    if (!set) {
      return;
    }

    set.delete(connectionId);

    if (set.size === 0) {
      index.delete(key);
    }
  }
}

// Singleton registry.
export const connectionRegistry = new ConnectionRegistry();
