import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";

import { yjsLogger } from "../../../../infrastructure/logging/childLogger";

import { persistence } from "../persistence/mongoPersistence";
import { bindRedisSync, cleanupRedisRoom } from "../persistence/redisSync";

import type { CollaborationClient, ManagedDocument } from "./types";

class DocumentManager {
  // In-memory registry of active collaborative documents.
  private readonly documents = new Map<string, ManagedDocument>();

  // Returns true if the document is already loaded.
  public has(documentName: string): boolean {
    return this.documents.has(documentName);
  }

  // Returns a managed document if present.
  public get(documentName: string): ManagedDocument | undefined {
    return this.documents.get(documentName);
  }

  /**
   * Returns an existing collaborative document or
   * creates a new one if it doesn't exist.
   */
  public async getOrCreate(documentName: string): Promise<ManagedDocument> {
    const existing = this.documents.get(documentName);

    if (existing && !existing.destroyed) {
      this.touch(documentName);

      return existing;
    }

    yjsLogger.info({ documentName }, "Creating collaborative document.");

    const document = new Y.Doc();
    const awareness = new Awareness(document);

    await persistence.bindState(documentName, document);

    bindRedisSync(documentName, document);

    return this.register(documentName, document, awareness);
  }

  /**
   * Registers a newly created document.
   */
  public register(
    documentName: string,
    document: Y.Doc,
    awareness: Awareness,
  ): ManagedDocument {
    const existing = this.documents.get(documentName);

    if (existing && !existing.destroyed) {
      yjsLogger.warn(
        {
          documentName,
        },
        "Collaborative document is already registered.",
      );

      return existing;
    }

    const now = new Date();

    const managed: ManagedDocument = {
      name: documentName,
      doc: document,
      awareness,

      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,

      connectionCount: 0,
      loaded: true,
      destroyed: false,

      clients: new Map(),
    };

    this.documents.set(documentName, managed);

    yjsLogger.info(
      {
        documentName,
        activeDocuments: this.documents.size,
      },
      "Collaborative document registered.",
    );

    return managed;
  }

  // Removes a document from memory.
  public unregister(documentName: string): boolean {
    const removed = this.documents.delete(documentName);

    if (removed) {
      yjsLogger.info(
        {
          documentName,
          activeDocuments: this.documents.size,
        },
        "Collaborative document unregistered.",
      );
    }

    return removed;
  }

  // Updates the last access timestamp.
  public touch(documentName: string): void {
    const managed = this.documents.get(documentName);

    if (!managed || managed.destroyed) {
      return;
    }

    const now = new Date();

    managed.lastAccessedAt = now;
    managed.updatedAt = now;
  }

  // Returns every active document.
  public list(): readonly ManagedDocument[] {
    return [...this.documents.values()];
  }

  // Returns the number of active collaborative documents.
  public count(): number {
    return this.documents.size;
  }

  // Clears the registry.
  // Intended for shutdown/testing.
  public clear(): void {
    this.documents.clear();

    yjsLogger.info("Collaborative document registry cleared.");
  }

  /**
   * Adds a client to a collaborative document.
   */
  public addClient(documentName: string, client: CollaborationClient): boolean {
    const managed = this.documents.get(documentName);

    if (!managed || managed.destroyed) {
      return false;
    }

    managed.clients.set(client.id, client);

    managed.connectionCount = managed.clients.size;
    managed.lastAccessedAt = new Date();
    managed.updatedAt = managed.lastAccessedAt;

    yjsLogger.debug(
      {
        documentName,
        clientId: client.id,
        userId: client.userId,
        connections: managed.connectionCount,
      },
      "Client added to collaborative document.",
    );

    return true;
  }

  /**
   * Removes a client from a collaborative document.
   */
  public removeClient(documentName: string, clientId: string): boolean {
    const managed = this.documents.get(documentName);

    if (!managed || managed.destroyed) {
      return false;
    }

    const removed = managed.clients.delete(clientId);

    if (!removed) {
      return false;
    }

    managed.connectionCount = managed.clients.size;
    managed.lastAccessedAt = new Date();
    managed.updatedAt = managed.lastAccessedAt;

    yjsLogger.debug(
      {
        documentName,
        clientId,
        connections: managed.connectionCount,
      },
      "Client removed from collaborative document.",
    );

    return true;
  }

  /**
   * Returns a connected client by ID.
   */
  public getClient(
    documentName: string,
    clientId: string,
  ): CollaborationClient | undefined {
    const managed = this.documents.get(documentName);

    if (!managed || managed.destroyed) {
      return undefined;
    }

    return managed.clients.get(clientId);
  }

  /**
   * Returns all connected clients.
   */
  public getClients(documentName: string): readonly CollaborationClient[] {
    const managed = this.documents.get(documentName);

    if (!managed || managed.destroyed) {
      return [];
    }

    return [...managed.clients.values()];
  }

  /**
   * Broadcasts a message to all connected clients.
   *
   * The originating client can optionally be excluded.
   */
  public broadcast(
    documentName: string,
    message: Uint8Array,
    excludeClientId?: string,
  ): void {
    const managed = this.documents.get(documentName);

    if (!managed || managed.destroyed) {
      return;
    }

    for (const client of managed.clients.values()) {
      if (client.id === excludeClientId) {
        continue;
      }

      if (client.socket.readyState !== client.socket.OPEN) {
        continue;
      }

      try {
        client.socket.send(message);
      } catch (error) {
        yjsLogger.warn(
          {
            err: error,
            documentName,
            clientId: client.id,
          },
          "Failed to broadcast message to collaboration client.",
        );
      }
    }

    managed.lastAccessedAt = new Date();
    managed.updatedAt = managed.lastAccessedAt;
  }

  /**
   * Completely destroys a collaborative document.
   */
  public async destroy(documentName: string): Promise<boolean> {
    const managed = this.documents.get(documentName);

    if (!managed) {
      return false;
    }

    if (managed.destroyed) {
      return true;
    }

    yjsLogger.info(
      {
        documentName,
        connections: managed.connectionCount,
      },
      "Destroying collaborative document.",
    );

    try {
      // Flush pending MongoDB writes.
      await persistence.writeState(documentName, managed.doc);

      // Remove Redis subscription.
      await cleanupRedisRoom(documentName);

      // Remove connected clients.
      managed.clients.clear();
      managed.connectionCount = 0;

      // Destroy awareness state.
      managed.awareness.destroy();

      // Destroy Yjs document.
      managed.doc.destroy();

      // Mark as destroyed.
      managed.destroyed = true;
      managed.loaded = false;

      // Remove from registry.
      this.unregister(documentName);

      yjsLogger.info(
        {
          documentName,
        },
        "Collaborative document destroyed.",
      );

      return true;
    } catch (error) {
      yjsLogger.error(
        {
          err: error,
          documentName,
        },
        "Failed to destroy collaborative document.",
      );

      return false;
    }
  }
}

export const documentManager = new DocumentManager();
