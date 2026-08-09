import * as yAwarenessProtocol from "y-protocols/awareness";
import type { WebSocket } from "ws";

import { yjsLogger } from "../../../../infrastructure/logging/childLogger";

import type { ManagedDocument } from "./types";

export class AwarenessProtocol {
  /**
   * Handles an incoming Yjs awareness update.
   *
   * The top-level collaboration message type has already
   * been removed by MessageHandler.
   *
   * This class is responsible for:
   *
   * 1. Validating the awareness payload.
   * 2. Applying the update to the document awareness state.
   * 3. Using the WebSocket as the update origin.
   *
   * Awareness is ephemeral and must not be persisted.
   */
  public handle(
    socket: WebSocket,
    document: ManagedDocument,
    message: Uint8Array,
  ): void {
    if (message.length === 0) {
      yjsLogger.warn(
        {
          documentName: document.name,
        },
        "Received empty awareness update.",
      );

      return;
    }

    try {
      yjsLogger.debug(
        {
          documentName: document.name,
          bytes: message.length,
        },
        "Processing Yjs awareness update.",
      );

      yAwarenessProtocol.applyAwarenessUpdate(
        document.awareness,
        message,
        socket,
      );

      yjsLogger.debug(
        {
          documentName: document.name,
          bytes: message.length,
        },
        "Applied Yjs awareness update.",
      );
    } catch (error) {
      yjsLogger.error(
        {
          err: error,
          documentName: document.name,
          bytes: message.length,
        },
        "Failed to process Yjs awareness update.",
      );

      throw error;
    }
  }
}

export const awarenessProtocol = new AwarenessProtocol();
