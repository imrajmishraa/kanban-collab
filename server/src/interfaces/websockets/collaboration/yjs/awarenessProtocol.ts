import * as yAwarenessProtocol from "y-protocols/awareness";
import type { Awareness } from "y-protocols/awareness";
import type { WebSocket } from "ws";

import { yjsLogger } from "../../../../infrastructure/logging/childLogger";

import { collaborationMessageEncoder } from "./collaborationMessageEncoder";
import { CollaborationMessage } from "./protocol";
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

/**
 * Relays Yjs awareness (presence/cursors) between clients (H-5).
 *
 * The previous code applied inbound awareness updates to the shared
 * `Awareness` instance but never sent them to anyone else, so peers never saw
 * each other's presence. This attaches one `awareness` "update" listener per
 * document and forwards every change to the other connected clients.
 *
 * It also tracks which awareness clientIDs arrived from which socket so a
 * departing socket's presence can be removed on close (no ghost cursors).
 */
class AwarenessBroadcaster {
  private readonly attached = new WeakSet<Awareness>();
  private readonly socketStates = new WeakMap<WebSocket, Set<number>>();

  public attach(document: ManagedDocument): void {
    const { awareness } = document;

    if (this.attached.has(awareness)) {
      return;
    }

    this.attached.add(awareness);

    awareness.on(
      "update",
      (
        changes: { added: number[]; updated: number[]; removed: number[] },
        origin: unknown,
      ) => {
        const changed = [
          ...changes.added,
          ...changes.updated,
          ...changes.removed,
        ];

        if (changed.length === 0) {
          return;
        }

        // Remember which clientIDs belong to the originating socket.
        if (origin && typeof origin === "object" && "send" in origin) {
          const socket = origin as WebSocket;
          let ids = this.socketStates.get(socket);
          if (!ids) {
            ids = new Set<number>();
            this.socketStates.set(socket, ids);
          }
          for (const id of changes.added) ids.add(id);
          for (const id of changes.updated) ids.add(id);
          for (const id of changes.removed) ids.delete(id);
        }

        const payload = yAwarenessProtocol.encodeAwarenessUpdate(
          awareness,
          changed,
        );
        const message = collaborationMessageEncoder.encode(
          CollaborationMessage.Awareness,
          payload,
        );

        for (const client of document.clients.values()) {
          if (origin === client.socket) continue;
          if (client.socket.readyState !== client.socket.OPEN) continue;
          try {
            client.socket.send(message);
          } catch (error) {
            yjsLogger.warn(
              { err: error, documentName: document.name, clientId: client.id },
              "Failed to broadcast awareness update.",
            );
          }
        }
      },
    );
  }

  /** Send the current presence of everyone already here to a new client. */
  public sendCurrentTo(document: ManagedDocument, socket: WebSocket): void {
    const { awareness } = document;

    // Exclude the server's own (empty) local state: it is not a real peer, and
    // sending it would surface a phantom collaborator in every client.
    const ids = [...awareness.getStates().keys()].filter(
      (id) => id !== awareness.clientID,
    );

    if (ids.length === 0 || socket.readyState !== socket.OPEN) {
      return;
    }

    try {
      const payload = yAwarenessProtocol.encodeAwarenessUpdate(awareness, ids);
      socket.send(
        collaborationMessageEncoder.encode(
          CollaborationMessage.Awareness,
          payload,
        ),
      );
    } catch (error) {
      yjsLogger.warn(
        { err: error, documentName: document.name },
        "Failed to send current awareness to new client.",
      );
    }
  }

  /** Remove a departing socket's presence and notify the remaining clients. */
  public removeSocket(document: ManagedDocument, socket: WebSocket): void {
    const ids = this.socketStates.get(socket);

    if (!ids) {
      return;
    }

    this.socketStates.delete(socket);

    if (ids.size === 0) {
      return;
    }

    yAwarenessProtocol.removeAwarenessStates(
      document.awareness,
      [...ids],
      socket,
    );
  }
}

export const awarenessBroadcaster = new AwarenessBroadcaster();
