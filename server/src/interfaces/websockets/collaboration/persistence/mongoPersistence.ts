import * as Y from 'yjs';

import { logger } from '../../../../infrastructure/logging/logger';
import { websocketConfig } from '../../../../config/websocket';
import { YjsUpdateModel } from '../../../../infrastructure/db/mongoose/schemas';

import { Debouncer } from './debounce';
import type { DocumentPersistence } from './documentPersistence';

export class MongoPersistence implements DocumentPersistence {
  private readonly debouncer = new Debouncer();

  private readonly boundDocuments = new WeakSet<Y.Doc>();

  public async bindState(documentName: string, document: Y.Doc): Promise<void> {
    try {
      const persisted = await YjsUpdateModel.findOne({
        docName: documentName,
      }).lean();

      if (persisted?.update) {
        Y.applyUpdate(document, persisted.update);

        logger.info({ documentName }, "Loaded Yjs document from MongoDB.");
      } else {
        logger.info({ documentName }, "Created new Yjs document.");
      }
    } catch (error) {
      logger.error(
        {
          err: error,
          documentName,
        },
        "Failed to load Yjs document from MongoDB.",
      );
    }

    //  Prevent duplicate persistence listeners.
    if (this.boundDocuments.has(document)) {
      return;
    }

    this.boundDocuments.add(document);

    document.on("update", (_update, _origin) => {
      this.debouncer.debounce(
        documentName,
        websocketConfig.persistenceDebounceMs,
        async () => {
          void this.writeState(documentName, document);
        },
      );
    });
  }

  // Persists the latest Yjs document state
  public async writeState(
    documentName: string,
    document: Y.Doc,
  ): Promise<void> {
    try {
      const update = Y.encodeStateAsUpdate(document);

      await YjsUpdateModel.findOneAndUpdate(
        {
          docName: documentName,
        },
        {
          docName: documentName,
          update: Buffer.from(update),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      logger.debug(
        {
          documentName,
          bytes: update.length,
        },
        "Persisted Yjs document.",
      );
    } catch (error) {
      logger.error(
        {
          err: error,
          documentName,
        },
        "Failed to persist Yjs document.",
      );
    }
  }

  public async shutdown(): Promise<void> {
    try {
      await this.debouncer.flushAll();

      logger.info(
        {
          pendingWrites: 0,
        },
        "MongoDB document persistence shut down.",
      );
    } catch (error) {
      logger.error(
        {
          err: error,
        },
        "Failed to flush pending document persistence.",
      );
    }
  }
}

export const persistence = new MongoPersistence();

