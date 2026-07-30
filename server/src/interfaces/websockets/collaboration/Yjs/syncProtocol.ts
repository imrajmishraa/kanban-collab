import * as Y from "yjs";
import type { WebSocket } from "ws";

import { logger } from "../../../../infrastructure/logging/logger";

export class SyncProtocol {
  // Handles every synchronization message.
  // Actual protocol parsing will be implemented later.
  public handle(socket: WebSocket, document: Y.Doc, message: Uint8Array): void {
    logger.debug(
      {
        bytes: message.length,
      },
      "Handling Yjs synchronization message.",
    );

    // TODO:
    // Decode sync protocol message.
    //
    // Sync Step 1
    // Sync Step 2
    // Update
  }
}

export const syncProtocol = new SyncProtocol();