import type { WebSocket } from "ws";

import { yjsLogger } from "../../../../infrastructure/logging/childLogger";

import { awarenessProtocol } from "./awarenessProtocol";
import { CollaborationMessage } from "./protocol";
import { syncProtocol } from "./syncProtocol";
import type { ManagedDocument } from "./types";
import { collaborationMessageDecoder } from "./collaborationMessageDecoder";

export class MessageHandler {
  /**
   * Entry point for every incoming WebSocket
   * collaboration message.
   *
   * Responsibilities:
   *
   * 1. Decode the top-level collaboration message.
   * 2. Identify the protocol.
   * 3. Delegate the payload to the appropriate
   *    protocol handler.
   *
   * This class does not implement Yjs synchronization
   * or awareness semantics itself.
   */
  public handleMessage(
    socket: WebSocket,
    document: ManagedDocument,
    message: Buffer,
  ): void {
    if (message.length === 0) {
      yjsLogger.warn(
        {
          documentName: document.name,
        },
        "Received empty collaboration message.",
      );

      return;
    }

    try {
      const decoded = collaborationMessageDecoder.decode(message);

      const payloadBytes = decoded.payload?.length ?? 0;

      yjsLogger.debug(
        {
          documentName: document.name,
          messageType: decoded.type,
          bytes: message.length,
          payloadBytes,
        },
        "Received collaboration message.",
      );

      switch (decoded.type) {
        case CollaborationMessage.Sync:
          this.handleSync(socket, document, decoded.payload);
          break;

        case CollaborationMessage.Awareness:
          this.handleAwareness(socket, document, decoded.payload);
          break;

        default:
          this.handleUnknown(document, decoded.type);
      }
    } catch (error) {
      yjsLogger.error(
        {
          err: error,
          documentName: document.name,
          bytes: message.length,
        },
        "Failed to process collaboration message.",
      );
    }
  }

  /**
   * Delegates a synchronization payload to the
   * Yjs synchronization protocol.
   */
  private handleSync(
    socket: WebSocket,
    document: ManagedDocument,
    payload?: Uint8Array,
  ): void {
    if (!payload || payload.length === 0) {
      yjsLogger.warn(
        {
          documentName: document.name,
        },
        "Received synchronization message without payload.",
      );

      return;
    }

    syncProtocol.handle(socket, document.doc, payload);
  }

  /**
   * Delegates an awareness payload to the
   * Yjs awareness protocol.
   */
  private handleAwareness(
    socket: WebSocket,
    document: ManagedDocument,
    payload?: Uint8Array,
  ): void {
    if (!payload || payload.length === 0) {
      yjsLogger.warn(
        {
          documentName: document.name,
        },
        "Received awareness message without payload.",
      );

      return;
    }

    awarenessProtocol.handle(socket, document, payload);
  }

  /**
   * Handles unsupported top-level collaboration
   * message types.
   */
  private handleUnknown(document: ManagedDocument, messageType: number): void {
    yjsLogger.warn(
      {
        documentName: document.name,
        messageType,
      },
      "Received unknown collaboration message type.",
    );
  }
}

export const messageHandler = new MessageHandler();
