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
   * Handles an incoming Yjs synchronization payload.
   *
   * The top-level collaboration message type has already
   * been decoded by MessageHandler.
   *
   * This class is responsible only for the Yjs sync protocol:
   *
   * - Sync Step 1
   * - Sync Step 2
   * - Update
   *
   * Client routing and document lifecycle remain outside
   * this protocol implementation.
   */
  public handle(socket: WebSocket, document: Y.Doc, payload: Uint8Array): void {
    if (payload.length === 0) {
      yjsLogger.warn(
        {
          bytes: payload.length,
        },
        "Received empty Yjs synchronization payload.",
      );

      return;
    }

    try {
      yjsLogger.debug(
        {
          bytes: payload.length,
        },
        "Processing Yjs synchronization payload.",
      );

      /*
       * Decode the Yjs synchronization payload.
       */
      const decoder = decoding.createDecoder(payload);

      /*
       * y-protocols/sync writes any required response
       * into this encoder.
       */
      const encoder = encoding.createEncoder();

      /*
       * Delegate synchronization semantics to the
       * official Yjs synchronization protocol.
       *
       * This handles:
       *
       *   Sync Step 1
       *   Sync Step 2
       *   Update
       */
      ySyncProtocol.readSyncMessage(decoder, encoder, document, socket);

      /*
       * No response means there is nothing to send
       * back to this client.
       */
      if (encoding.length(encoder) === 0) {
        yjsLogger.debug(
          {
            bytes: payload.length,
          },
          "Yjs synchronization produced no response.",
        );

        return;
      }

      const syncResponse = encoding.toUint8Array(encoder);

      /*
       * Wrap the Yjs synchronization response inside
       * the application's top-level collaboration protocol.
       *
       * [CollaborationMessage.Sync][Yjs sync payload]
       */
      const response = collaborationMessageEncoder.encode(
        CollaborationMessage.Sync,
        syncResponse,
      );

      /*
       * Never attempt to send through a closed socket.
       */
      if (socket.readyState !== socket.OPEN) {
        yjsLogger.warn(
          {
            readyState: socket.readyState,
          },
          "Cannot send Yjs synchronization response because WebSocket is not open.",
        );

        return;
      }

      socket.send(response);

      yjsLogger.debug(
        {
          payloadBytes: syncResponse.length,
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
        "Failed to process Yjs synchronization payload.",
      );

      throw error;
    }
  }
}

export const syncProtocol = new SyncProtocol();
