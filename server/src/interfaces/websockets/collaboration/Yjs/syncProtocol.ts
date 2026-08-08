import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import * as ySyncProtocol from "y-protocols/sync";
import * as Y from "yjs";
import type { WebSocket } from "ws";

import { yjsLogger } from "../../../../infrastructure/logging/childLogger";

import { CollaborationMessage } from "./protocol";
import { updateDecoder } from "./updateDecoder";

export class SyncProtocol {
  /**
   * Handles an incoming Yjs synchronization message.
   *
   * Top-level collaboration message:
   *
   *   0 -> Sync
   *
   * Sync protocol message:
   *
   *   0 -> Sync Step 1
   *   1 -> Sync Step 2
   *   2 -> Update
   *
   * The actual synchronization semantics are delegated
   * to the official Yjs synchronization protocol.
   */
  public handle(socket: WebSocket, document: Y.Doc, message: Uint8Array): void {
    try {
      const decoded = updateDecoder.decode(message);

      if (decoded.type !== CollaborationMessage.Sync) {
        throw new Error(
          `Invalid synchronization message type: ${decoded.type}`,
        );
      }

      if (!decoded.payload || decoded.payload.length === 0) {
        throw new Error("Synchronization message contains no payload.");
      }

      yjsLogger.debug(
        {
          bytes: message.length,
        },
        "Handling Yjs synchronization message.",
      );

      /**
       * updateDecoder removes the top-level collaboration
       * message type. The remaining bytes contain the
       * actual Yjs sync protocol message.
       */
      const decoder = decoding.createDecoder(decoded.payload);

      const encoder = encoding.createEncoder();

      /**
       * Re-add the top-level collaboration message type
       * before writing a protocol response.
       */
      encoding.writeVarUint(encoder, CollaborationMessage.Sync);

      /**
       * Delegate Sync Step 1, Sync Step 2, and Update
       * handling to y-protocols/sync.
       */
      ySyncProtocol.readSyncMessage(decoder, encoder, document, socket);

      /**
       * If only the top-level message type exists,
       * no response was generated.
       */
      if (encoding.length(encoder) <= 1) {
        return;
      }

      const response = encoding.toUint8Array(encoder);

      socket.send(response);

      yjsLogger.debug(
        {
          bytes: response.length,
        },
        "Sent Yjs synchronization response.",
      );
    } catch (error) {
      yjsLogger.error(
        {
          err: error,
          bytes: message.length,
        },
        "Failed to handle Yjs synchronization message.",
      );

      throw error;
    }
  }
}

export const syncProtocol = new SyncProtocol();
