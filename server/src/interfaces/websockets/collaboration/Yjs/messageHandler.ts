import type { WebSocket } from "ws";

import { logger } from "../../../../infrastructure/logging/logger";

import type { ManagedDocument } from "./documentManager";
import {
  CollaborationMessage,
  type CollaborationMessageType,
} from "./protocol";

export class MessageHandler {
  // Entry point for every incoming WebSocket message.
  public handleMessage(
    socket: WebSocket,
    document: ManagedDocument,
    message: Buffer,
  ): void {
    try {
      if (message.length === 0) {
        logger.warn(
          {
            documentName: document.name,
          },
          "Received empty collaboration message.",
        );

        return;
      }

      /**
       * Yjs protocol uses the first byte
       * to identify the message type.
       */

      const messageType = message.readUInt8(0) as CollaborationMessageType;

      switch (messageType) {
        case CollaborationMessage.Sync:
          this.handleSync(socket, document, message);
          break;

        case CollaborationMessage.Awareness:
          this.handleAwareness(socket, document, message);
          break;

        default:
          this.handleUnknown(document, messageType);
      }
    } catch (error) {
      logger.error(
        {
          err: error,
          documentName: document.name,
        },
        "Failed to process collaboration message.",
      );
    }
  }

  //  Handles synchronization protocol messages.
  public handleSync(
    socket: WebSocket,
    document: ManagedDocument,
    message: Buffer,
  ): void {
    logger.debug(
      {
        documentName: document.name,
        bytes: message.length,
      },
      "Received synchronization message.",
    );

    // TODO:
    // syncProtocol.handle(...)
  }

  // Handles awareness protocol messages.
  public handleAwareness(
    socket: WebSocket,
    document: ManagedDocument,
    message: Buffer,
  ): void {
    logger.debug(
      {
        documentName: document.name,
        bytes: message.length,
      },
      "Received awareness message.",
    );

    // TODO:
    // awarenessProtocol.handle(...)
  }

  // Handles unsupported protocol messages.
  public handleUnknown(document: ManagedDocument, messageType: number): void {
    logger.warn(
      {
        documentName: document.name,
        messageType,
      },
      "Received unknown collaboration message.",
    );
  }
}

export const messageHandler = new MessageHandler();
