import * as Y from "yjs";

import { YjsUpdateModel } from "../../../../infrastructure/db/mongoose/schemas";
import { logger } from "../../../../infrastructure/logging/logger";

import { websocketConfig } from "../../../../config/websocket";

import { Debouncer } from "./debounce";
import type { DocumentPersistence } from "./documentPersistence";

const debouncer = new Debouncer();

class MongoPersistence implements DocumentPersistence {
  public async bindState(documentName: string, document: Y.Doc): Promise<void> {
    try {
      const persisted = await YjsUpdateModel.findOne({
        docName: documentName,
      });

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
        "Failed to load Yjs document.",
      );
    }

    document.on("update", () => {
      debouncer.debounce(
        documentName,
        websocketConfig.persistenceDebounceMs,
        async () => {
          await this.writeState(documentName, document);
        },
      );
    });
  }

  public async writeState(
    documentName: string,
    document: Y.Doc,
  ): Promise<void> {
    try {
      const update = Y.encodeStateAsUpdate(document);

      await YjsUpdateModel.findOneAndUpdate(
        { docName: documentName },
        {
          docName: documentName,
          update: Buffer.from(update),
        },
        {
          upsert: true,
        },
      );

      logger.debug({ documentName }, "Persisted Yjs document.");
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
}

export const persistence = new MongoPersistence();
