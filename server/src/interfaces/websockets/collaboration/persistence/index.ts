import * as Y from "yjs";
import {
  setPersistence,
  type Persistence,
  type WSSharedDoc,
} from "y-websocket/bin/utils";

import { persistenceLogger as log } from "../../../../infrastructure/logging/childLogger";
import { YjsUpdateModel } from "../../../../infrastructure/db/mongoose/schemas";

export class MongoPersistence implements Persistence {
  readonly provider = "mongodb";

  async bindState(docName: string, ydoc: WSSharedDoc): Promise<void> {
    const row = await YjsUpdateModel.findOne({ docName }).lean();

    if (row?.update) {
      Y.applyUpdate(ydoc, row.update);
      log.info({ docName, bytes: row.update.length }, "Yjs state loaded.");
    } else {
      log.info({ docName }, "No persisted Yjs state — starting fresh.");
    }
  }

  async writeState(docName: string, ydoc: WSSharedDoc): Promise<void> {
    const update = Y.encodeStateAsUpdate(ydoc);

    await YjsUpdateModel.updateOne(
      { docName },
      { $set: { update: Buffer.from(update) } },
      { upsert: true },
    );
  }

  close(): void {
    log.info("MongoPersistence closed.");
  }
}

export const persistence = new MongoPersistence();

let configured = false;

export function configurePersistence(): void {
  if (configured) return;

  setPersistence(persistence);
  configured = true;

  log.info("Yjs persistence configured.");
}
