import * as decoding from "lib0/decoding";
import * as ySyncProtocol from "y-protocols/sync";
import type { WebSocket } from "ws";

import { yjsLogger } from "../../../../infrastructure/logging/childLogger";

import { awarenessProtocol } from "./awarenessProtocol";
import { CollaborationMessage } from "./protocol";
import { syncProtocol } from "./syncProtocol";
import type { ManagedDocument } from "./types";
import { collaborationMessageDecoder } from "./collaborationMessageDecoder";

export interface MessageHandlerOptions {
  /**
   * Whether this connection may mutate the document (H-3). Guests are
   * read-only: their sync *updates* are dropped, while the sync handshake
   * (step 1/step 2) and awareness still flow so they can see the board live.
   */
  canWrite?: boolean;
}

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
    options: MessageHandlerOptions = {},
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
          this.handleSync(
            socket,
            document,
            decoded.payload,
            options.canWrite ?? true,
          );
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
    payload: Uint8Array | undefined,
    canWrite: boolean,
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

    // H-3: a read-only (guest) connection may run the sync handshake but must
    // not apply document updates. Peek the inner y-protocols/sync message type;
    // messageYjsUpdate is the only one that mutates the document.
    if (!canWrite && isDocumentUpdate(payload)) {
      yjsLogger.warn(
        { documentName: document.name },
        "Dropped sync update from a read-only (guest) connection.",
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

/**
 * True when the y-protocols/sync payload is a document update (as opposed to
 * a sync step 1/2 handshake message). Falls back to `false` on malformed
 * input so the normal decoder handles (and rejects) it.
 */
function isDocumentUpdate(payload: Uint8Array): boolean {
  try {
    const decoder = decoding.createDecoder(payload);
    return decoding.readVarUint(decoder) === ySyncProtocol.messageYjsUpdate;
  } catch {
    return false;
  }
}

export const messageHandler = new MessageHandler();
