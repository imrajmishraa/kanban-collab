import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import * as ySyncProtocol from "y-protocols/sync";
import * as Y from "yjs";
import type { WebSocket } from "ws";

import { yjsLogger } from "../../../../infrastructure/logging/childLogger";

import { CollaborationMessage } from "./protocol";
import { collaborationMessageEncoder } from "./collaborationMessageEncoder";

export class SyncProtocol {
  /**
   * Process the Yjs sync payload.
   *
   * The application-level CollaborationMessage.Sync
   * has already been decoded by MessageHandler.
   *
   * This method therefore receives only the inner
   * y-protocols/sync payload.
   */
  public handle(socket: WebSocket, document: Y.Doc, payload: Uint8Array): void {
    if (payload.length === 0) {
      yjsLogger.warn("Received empty Yjs synchronization payload.");

      return;
    }

    try {
      const decoder = decoding.createDecoder(payload);
      const encoder = encoding.createEncoder();

      /*
       * IMPORTANT:
       *
       * The socket is the transaction origin.
       *
       * When a client sends an update:
       *
       *     Client A
       *        ↓
       *     readSyncMessage()
       *        ↓
       *     Y.Doc
       *
       * Yjs associates `socket` with the transaction.
       *
       * updateBroadcaster uses this origin to avoid
       * sending the update back to Client A.
       */
      ySyncProtocol.readSyncMessage(
        decoder,
        encoder,
        document,
        socket,
        (error: Error) => {
          yjsLogger.error(
            {
              err: error,
              bytes: payload.length,
            },
            "Yjs synchronization error.",
          );
        },
      );

      /*
       * Yjs may or may not have generated a response.
       *
       * For example:
       *
       * Sync Step 1
       *      ↓
       * Sync Step 2 response
       *
       * But an Update message normally produces
       * no direct response.
       */
      if (encoding.length(encoder) === 0) {
        return;
      }

      const syncPayload = encoding.toUint8Array(encoder);

      /*
       * Wrap the Yjs protocol message in our
       * application-level protocol.
       *
       *     [CollaborationMessage.Sync]
       *     [Yjs sync payload]
       */
      const response = collaborationMessageEncoder.encode(
        CollaborationMessage.Sync,
        syncPayload,
      );

      if (socket.readyState !== socket.OPEN) {
        yjsLogger.warn(
          {
            readyState: socket.readyState,
          },
          "Cannot send Yjs synchronization response because socket is not open.",
        );

        return;
      }

      socket.send(response);

      yjsLogger.debug(
        {
          payloadBytes: syncPayload.length,
          bytes: response.length,
        },
        "Sent Yjs synchronization response.",
      );
    } catch (error) {
      yjsLogger.error(
        {
          err: error,
          bytes: payload.length,
        },
        "Failed to process Yjs synchronization message.",
      );

      throw error;
    }
  }
}

export const syncProtocol = new SyncProtocol();
