import * as encoding from "lib0/encoding";
import * as ySyncProtocol from "y-protocols/sync";
import * as Y from "yjs";

import { yjsLogger } from "../../../../infrastructure/logging/childLogger";

import { CollaborationMessage } from "./protocol";
import type { ManagedDocument } from "./types";
import { collaborationMessageEncoder } from "./collaborationMessageEncoder";

export class UpdateBroadcaster {
  private readonly attachedDocuments = new WeakSet<Y.Doc>();

  /**
   * Attach the broadcaster to a Yjs document.
   *
   * A document receives only one update listener.
   */
  public attach(document: ManagedDocument): void {
    const ydoc = document.doc;

    if (this.attachedDocuments.has(ydoc)) {
      return;
    }

    this.attachedDocuments.add(ydoc);

    ydoc.on("update", (update: Uint8Array, origin: unknown) => {
      this.handleUpdate(document, update, origin);
    });

    yjsLogger.debug(
      {
        documentName: document.name,
      },
      "Yjs update broadcaster attached.",
    );
  }

  /**
   * Broadcast a Yjs update to every connected client
   * except the client that originally produced it.
   */
  private handleUpdate(
    document: ManagedDocument,
    update: Uint8Array,
    origin: unknown,
  ): void {
    if (update.length === 0) {
      return;
    }

    /*
     * Convert the raw Yjs update into a Yjs Sync Update
     * message.
     */
    const encoder = encoding.createEncoder();

    ySyncProtocol.writeUpdate(encoder, update);

    const syncPayload = encoding.toUint8Array(encoder);

    /*
     * Wrap the Yjs Sync message in our application-level
     * collaboration protocol.
     *
     * [CollaborationMessage.Sync][Yjs payload]
     */
    const message = collaborationMessageEncoder.encode(
      CollaborationMessage.Sync,
      syncPayload,
    );

    let sent = 0;
    let skipped = 0;

    /*
     * IMPORTANT:
     *
     * document.clients is a Map:
     *
     * Map<string, CollaborationClient>
     *
     * Therefore:
     *
     * for (const [clientId, client] of ...)
     */
    for (const [clientId, client] of document.clients) {
      /*
       * Do not send the update back to the client
       * that originally created it.
       */
      if (origin === client.socket) {
        skipped++;
        continue;
      }

      if (client.socket.readyState !== client.socket.OPEN) {
        skipped++;
        continue;
      }

      try {
        client.socket.send(message);

        sent++;
      } catch (error) {
        skipped++;

        yjsLogger.error(
          {
            err: error,
            documentName: document.name,
            clientId,
          },
          "Failed to broadcast Yjs update.",
        );
      }
    }

    yjsLogger.debug(
      {
        documentName: document.name,
        updateBytes: update.length,
        messageBytes: message.length,
        sent,
        skipped,
      },
      "Broadcasted Yjs update.",
    );
  }
}

export const updateBroadcaster = new UpdateBroadcaster();
