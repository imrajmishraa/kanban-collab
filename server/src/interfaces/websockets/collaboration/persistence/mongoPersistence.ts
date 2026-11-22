import * as Y from "yjs";

import { logger } from "../../../../infrastructure/logging/logger";
import { websocketConfig } from "../../../../config/websocket";
import { YjsUpdateModel } from "../../../../infrastructure/db/mongoose/schemas";

import { Debouncer } from "./debounce";
import type { DocumentPersistence } from "./documentPersistence";

/**
 * Retry policy for a failed write.
 *
 * A Yjs document lives in memory until something persists it. When the write
 * fails, the old code logged and returned — and because the debouncer entry had
 * already been removed when the timer fired, nothing marked the document as
 * unsaved. The state stayed only in memory and was lost if the process died
 * before the next edit. Retrying with backoff keeps that window small.
 */
const MAX_PERSIST_ATTEMPTS = 4;
const RETRY_BASE_DELAY_MS = 500;

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

      /* Rethrow. Carrying on binds persistence to a document that never got its
         stored state, and the first client update then writes over it — the
         board is replaced by whatever one person happened to do next. Failing
         the connection is recoverable; losing the board is not. */
      throw error;
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
          void this.persistWithRetry(documentName, document);
        },
      );
    });
  }

  // Persists the latest Yjs document state. Returns false when the write
  // failed, so the caller can decide whether to retry.
  public async writeState(
    documentName: string,
    document: Y.Doc,
  ): Promise<boolean> {
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

      return true;
    } catch (error) {
      logger.error(
        {
          err: error,
          documentName,
        },
        "Failed to persist Yjs document.",
      );

      return false;
    }
  }

  /**
   * Persist, retrying with exponential backoff until it succeeds or the
   * attempt budget runs out.
   *
   * The retry is scheduled through the debouncer under its own key, so a burst
   * of edits still coalesces (the debounced task is replaced, not queued) and a
   * pending retry never cancels the document's own debounce.
   */
  private async persistWithRetry(
    documentName: string,
    document: Y.Doc,
    attempt = 1,
  ): Promise<void> {
    const persisted = await this.writeState(documentName, document);

    if (persisted) return;

    if (attempt >= MAX_PERSIST_ATTEMPTS) {
      logger.error(
        { documentName, attempts: attempt },
        "Giving up on persisting Yjs document; state is only in memory.",
      );

      return;
    }

    const delay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);

    logger.warn(
      { documentName, attempt, delay },
      "Yjs persistence failed; scheduling a retry.",
    );

    this.debouncer.debounce(`${documentName}::retry`, delay, async () => {
      await this.persistWithRetry(documentName, document, attempt + 1);
    });
  }

  /**
   * Cancel the pending debounce and persist immediately.
   *
   * Called when the last client leaves a board (T6: reconcile on close) so the
   * latest state is durable without waiting for the debounce window.
   */
  public async flush(documentName: string, document: Y.Doc): Promise<void> {
    this.debouncer.cancel(documentName);
    this.debouncer.cancel(`${documentName}::retry`);

    const persisted = await this.writeState(documentName, document);

    if (!persisted) {
      logger.warn(
        { documentName },
        "Final flush failed; the document's latest state is only in memory.",
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
