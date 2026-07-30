import * as Y from 'yjs';
import { logger } from '../../../../infrastructure/logging/logger';


import { persistence } from "../persistence/mongoPersistence";
import { bindRedisSync } from "../persistence/redisSync";
import { cleanupRedisRoom } from "../persistence/redisSync";

export interface ManagedDocument {
  readonly name: string;
  readonly doc: Y.Doc;
  readonly createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  connectionCount: number;
  loaded: boolean;
  destroyed: boolean;
}


class DocumentManager {
  // In-memory registry of active collaborative documents.
  private readonly documents = new Map<string, ManagedDocument>();

  //   Returns true if the document is already loaded.
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

    logger.info({ documentName }, "Creating collaborative document.");

    const document = new Y.Doc();

    await persistence.bindState(documentName, document);

    bindRedisSync(documentName, document);

    return this.register(documentName, document);
  }

  // Registers a newly created document.
  //   Returns the registered instance.
  public register(documentName: string, document: Y.Doc): ManagedDocument {
    const existing = this.documents.get(documentName);

    if (existing) {
        logger.warn(
        {
          documentName,
        },
        "Collaborative document is already registered."
        );
        return existing;
    }   

    const now = new Date();

    const managed: ManagedDocument = {
      name: documentName,
      doc: document,

      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,

      connectionCount: 0,
      loaded: true,
      destroyed: false,
    };

    this.documents.set(documentName, managed);

    logger.info(
      {
        documentName,
        activeDocuments: this.documents.size,
      },
      "Collaborative document registered.",
    );
    return managed;
  }

  //   Removes a document from memory.
  public unregister(documentName: string): boolean {
    const removed = this.documents.delete(documentName);

    if (removed) {
      logger.info(
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
    logger.info("Collaborative document registry cleared.");
  }

  // Increases the active connection count.
  public acquire(documentName: string): void {
    const managed = this.documents.get(documentName);

   if (!managed || managed.destroyed) {
     return;
   }

    managed.connectionCount++;
    managed.lastAccessedAt = new Date();

    logger.debug(
      {
        documentName,
        connections: managed.connectionCount,
      },
      "Client joined collaborative document.",
    );
  }

  // Decreases the active connection count.
  public release(documentName: string): void {
    const managed = this.documents.get(documentName);

   if (!managed || managed.destroyed) {
     return;
   }

    managed.connectionCount = Math.max(0, managed.connectionCount - 1);
    managed.lastAccessedAt = new Date();

    logger.debug(
      {
        documentName,
        connections: managed.connectionCount,
      },
      "Client left collaborative document.",
    );
  }

  // Completely destroys a collaborative document.
  public async destroy(documentName: string): Promise<boolean> {
    const managed = this.documents.get(documentName);

    if(!managed) {
        return false;
    }

    if (managed.destroyed) {
      return true;
    }

    logger.info(
      {
        documentName,
      },
      "Destroying collaborative document.",
    );

    try {
      // Flush pending MongoDB writes.
      await persistence.writeState(documentName, managed.doc);

      // Remove Redis subscription.
      await cleanupRedisRoom(documentName);

      // Destroy Yjs document.
      managed.destroyed = true;

      // Remove from registry.
      this.unregister(documentName);

      logger.info(
        {
          documentName,
        },
        "Collaborative document destroyed.",
      );

      return true;
    } catch(error) {
        logger.error(
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