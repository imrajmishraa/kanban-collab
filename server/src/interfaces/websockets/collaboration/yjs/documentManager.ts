import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";

import { yjsLogger } from "../../../../infrastructure/logging/childLogger";

import { persistence } from "../persistence/mongoPersistence";
import { bindRedisSync, cleanupRedisRoom } from "../persistence/redisSync";
import { boardReconciler } from "../persistence/boardReconciler";

import { isDocumentUsable } from "./types";
import type { CollaborationClient, ManagedDocument } from "./types";

export class DocumentManager {
  /**
   * Active in-memory collaborative documents.
   */
  private readonly documents = new Map<string, ManagedDocument>();

  /**
   * Tracks documents that are currently being created.
   *
   * This prevents two simultaneous connections from creating
   * two different Y.Doc instances for the same document.
   */
  private readonly pendingDocuments = new Map<
    string,
    Promise<ManagedDocument>
  >();

  /**
   * Teardowns in flight, keyed by document name.
   *
   * `getOrCreate` waits on this before building a replacement: creating a second
   * Y.Doc for the same board while the first is still flushing to Mongo would
   * seed the new one from stale state and then let both write.
   */
  private readonly pendingDestroys = new Map<string, Promise<boolean>>();

  /**
   * Returns true if the document is already loaded.
   */
  public has(documentName: string): boolean {
    return this.documents.has(documentName);
  }

  /**
   * Returns a managed document if present.
   */
  public get(documentName: string): ManagedDocument | undefined {
    return this.documents.get(documentName);
  }

  /**
   * Returns an existing collaborative document or creates
   * a new one if it does not exist.
   *
   * Concurrent calls for the same document share the same
   * creation promise.
   */
  public async getOrCreate(documentName: string): Promise<ManagedDocument> {
    const existing = this.documents.get(documentName);

    if (existing && isDocumentUsable(existing.phase)) {
      this.touch(documentName);

      return existing;
    }

    /* Mid-teardown: wait for the flush and unsubscribe to finish, otherwise the
       replacement would be built from state that is still being written. */
    const teardown = this.pendingDestroys.get(documentName);

    if (teardown) {
      await teardown;

      const rebuilt = this.documents.get(documentName);

      if (rebuilt && isDocumentUsable(rebuilt.phase)) {
        this.touch(documentName);

        return rebuilt;
      }
    }

    const pending = this.pendingDocuments.get(documentName);

    if (pending) {
      return pending;
    }

    const creationPromise = this.createDocument(documentName);

    this.pendingDocuments.set(documentName, creationPromise);

    try {
      return await creationPromise;
    } finally {
      this.pendingDocuments.delete(documentName);
    }
  }

  /**
   * Creates and registers a collaborative document.
   *
   * This method should only be called through getOrCreate().
   */
  private async createDocument(documentName: string): Promise<ManagedDocument> {
    /*
     * Another request may have registered the document
     * between getOrCreate() and this method executing.
     */
    const existing = this.documents.get(documentName);

    if (existing && isDocumentUsable(existing.phase)) {
      this.touch(documentName);

      return existing;
    }

    yjsLogger.info(
      {
        documentName,
      },
      "Creating collaborative document.",
    );

    const document = new Y.Doc();
    const awareness = new Awareness(document);

    try {
      /*
       * Load persisted Yjs state before registering the
       * document as active.
       */
      await persistence.bindState(documentName, document);

      /*
       * Attach Redis synchronization only after the
       * document has successfully loaded.
       */
      bindRedisSync(documentName, document);

      /*
       * Project CRDT changes back into MongoDB (T6).
       */
      boardReconciler.attach(documentName, document);

      return this.register(documentName, document, awareness);
    } catch (error) {
      /*
       * If initialization fails, do not leave an unusable
       * Y.Doc / Awareness instance behind.
       */
      awareness.destroy();
      document.destroy();

      yjsLogger.error(
        {
          err: error,
          documentName,
        },
        "Failed to create collaborative document.",
      );

      throw error;
    }
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

    if (existing && isDocumentUsable(existing.phase)) {
      yjsLogger.warn(
        {
          documentName,
        },
        "Collaborative document is already registered.",
      );

      /*
       * The caller created a duplicate document.
       * Clean it up because the existing document is authoritative.
       */
      awareness.destroy();
      document.destroy();

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
      phase: "active",

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

  /**
   * Removes a document from memory.
   */
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

  /**
   * Updates the last access timestamp.
   */
  public touch(documentName: string): void {
    const managed = this.documents.get(documentName);

    if (!managed || !isDocumentUsable(managed.phase)) {
      return;
    }

    const now = new Date();

    managed.lastAccessedAt = now;
    managed.updatedAt = now;
  }

  /**
   * Returns every active document.
   */
  public list(): readonly ManagedDocument[] {
    return [...this.documents.values()];
  }

  /**
   * Returns the number of active collaborative documents.
   */
  public count(): number {
    return this.documents.size;
  }

  /**
   * Clears the registry.
   *
   * Intended for shutdown/testing.
   *
   * This deliberately does not await persistence or Redis
   * cleanup because clear() is synchronous.
   */
  public clear(): void {
    this.documents.clear();
    this.pendingDocuments.clear();

    yjsLogger.info("Collaborative document registry cleared.");
  }

  /**
   * Adds a client to a collaborative document.
   */
  public addClient(documentName: string, client: CollaborationClient): boolean {
    const managed = this.documents.get(documentName);

    if (!managed || !isDocumentUsable(managed.phase)) {
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

    if (!managed || !isDocumentUsable(managed.phase)) {
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

    if (!managed || !isDocumentUsable(managed.phase)) {
      return undefined;
    }

    return managed.clients.get(clientId);
  }

  /**
   * Returns all connected clients.
   */
  public getClients(documentName: string): readonly CollaborationClient[] {
    const managed = this.documents.get(documentName);

    if (!managed || !isDocumentUsable(managed.phase)) {
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

    if (!managed || !isDocumentUsable(managed.phase)) {
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

    if (managed.phase === "destroyed") {
      return true;
    }

    /* A second caller joins the teardown already running instead of starting a
       competing one — the idle sweep and the last client leaving can both land
       here. */
    const running = this.pendingDestroys.get(documentName);

    if (running) {
      return running;
    }

    /* Mark first, then await: from this line on nothing new can attach, even
       though the flush below takes several awaits to finish. */
    managed.phase = "destroying";

    const teardown = this.runDestroy(documentName, managed);

    this.pendingDestroys.set(documentName, teardown);

    try {
      return await teardown;
    } finally {
      this.pendingDestroys.delete(documentName);
    }
  }

  /**
   * The actual teardown, split out so `destroy` can register the promise before
   * awaiting it.
   */
  private async runDestroy(
    documentName: string,
    managed: ManagedDocument,
  ): Promise<boolean> {
    yjsLogger.info(
      {
        documentName,
        connections: managed.connectionCount,
      },
      "Destroying collaborative document.",
    );

    try {
      /*
       * Flush pending MongoDB writes.
       */
      await persistence.writeState(documentName, managed.doc);

      /*
       * Final CRDT → MongoDB projection before the document is released.
       */
      await boardReconciler.flush(documentName, managed.doc);

      /*
       * Remove Redis subscription.
       */
      await cleanupRedisRoom(documentName);

      /*
       * Remove connected clients.
       */
      managed.clients.clear();
      managed.connectionCount = 0;

      /*
       * Destroy awareness state.
       */
      managed.awareness.destroy();

      /*
       * Destroy Yjs document.
       */
      managed.doc.destroy();

      /*
       * Mark as destroyed.
       */
      managed.phase = "destroyed";

      /*
       * Remove from registry.
       */
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

      /* Nothing was released, so let the idle sweep try again rather than
         leaving the document stranded in `destroying` for the life of the
         process. */
      managed.phase = "active";

      return false;
    }
  }
}

export const documentManager = new DocumentManager();
