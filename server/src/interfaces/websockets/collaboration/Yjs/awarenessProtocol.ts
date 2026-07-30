import type { WebSocket } from "ws";

import { logger } from "../../../../infrastructure/logging/logger";

import type { ManagedDocument } from "./documentManager";

export class AwarenessProtocol {
  /**
   * Handles Yjs awareness messages.
   */
  public handle(
    socket: WebSocket,
    document: ManagedDocument,
    message: Buffer,
  ): void {
    try {
      logger.debug(
        {
          documentName: document.name,
          bytes: message.length,
        },
        "Processing awareness message.",
      );

      /**
       * Future flow:
       *
       * Buffer
       *   |
       *   v
       * Decode awareness update
       *   |
       *   v
       * Update awareness state
       *   |
       *   v
       * Broadcast to connected clients
       */
    } catch (error) {
      logger.error(
        {
          err: error,
          documentName: document.name,
        },
        "Failed to process awareness message.",
      );
    }
  }
}

export const awarenessProtocol = new AwarenessProtocol();
