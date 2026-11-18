import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";

import * as encoding from "lib0/encoding";
import * as ySyncProtocol from "y-protocols/sync";
import type { WebSocket, WebSocketServer } from "ws";

import { yjsLogger } from "../../../infrastructure/logging/childLogger";

import { WS_CLOSE_CODE } from "../../../shared/constants/websocket";
import type { AuthenticatedRequest } from "../../../shared/types/request";

import {
  initializeHeartbeat,
  markAlive,
  type HeartbeatConnection,
} from "../collaboration/heartbeat/heartbeat";

import { connectionRegistry } from "../collaboration/lifecycle/connectionRegistry";
import {
  NEW_CONNECTION,
  transitionConnectionPhase,
  type ConnectionPhase,
} from "../collaboration/lifecycle/connectionPhase";
import { idleCleanup } from "../collaboration/lifecycle/idleCleanup";

import { documentManager } from "../collaboration/yjs/documentManager";
import { messageHandler } from "../collaboration/yjs/messageHandler";
import { updateBroadcaster } from "../collaboration/yjs/updateBroadcaster";
import { awarenessBroadcaster } from "../collaboration/yjs/awarenessProtocol";

import { CollaborationMessage } from "../collaboration/yjs/protocol";
import type {
  CollaborationClient,
  ManagedDocument,
} from "../collaboration/yjs/types";

export function registerYWebSocket(wss: WebSocketServer): void {
  wss.on("connection", (ws, request) => {
    void handleConnection(ws, request);
  });
}

async function handleConnection(
  ws: WebSocket,
  request: IncomingMessage,
): Promise<void> {
  const req = request as AuthenticatedRequest;

  const { userId, boardId } = req;

  // H-3: guests are read-only. `canWrite` is set by the upgrade handler from
  // the caller's workspace role; only an explicit `false` makes it read-only.
  const canWrite =
    (request as IncomingMessage & { canWrite?: boolean }).canWrite !== false;

  /*
   * Validate authenticated WebSocket context
   */

  if (!userId || !boardId) {
    yjsLogger.warn(
      {
        boardId,
      },
      "Missing authenticated WebSocket context. Closing connection.",
    );

    ws.close(WS_CLOSE_CODE.INTERNAL_ERROR, "Authentication context missing");

    return;
  }

  const remoteAddress = request.socket.remoteAddress ?? "unknown";

  const clientId = randomUUID();

  /*
   * The board currently acts as the Yjs document name.
   */
  const documentName = boardId;

  let client: CollaborationClient | undefined;
  let document: ManagedDocument | undefined;

  /**
   * Where this connection is in its lifecycle. One value replaces the
   * `client`/`registered` pair of flags, and the teardown below is driven by
   * what the transition says still needs undoing — the same sequence from both
   * the close handler and the catch block, which had already drifted apart once.
   */
  let phase: ConnectionPhase = NEW_CONNECTION;

  const closeConnection = (): void => {
    const transition = transitionConnectionPhase(phase, { type: "CLOSED" });

    phase = transition.phase;

    for (const effect of transition.effects) {
      switch (effect) {
        case "detach-client":
          if (client) {
            documentManager.removeClient(documentName, client.id);
          }
          break;

        case "clear-awareness":
          /* H-5: no ghost cursors for a socket that is already gone. */
          if (document) {
            awarenessBroadcaster.removeSocket(document, ws);
          }
          break;

        case "schedule-idle-cleanup":
          /* Only the last client leaving frees the document; schedule() is a
             no-op while other clients remain. */
          idleCleanup.schedule(documentName);
          break;

        case "unregister":
          connectionRegistry.unregister(ws);
          break;
      }
    }
  };

  try {
    /*
     * Register connection
     */

    connectionRegistry.register(ws, userId, boardId, remoteAddress);

    phase = transitionConnectionPhase(phase, { type: "REGISTERED" }).phase;

    /*
     * Initialize heartbeat
     */

    const heartbeatSocket = ws as HeartbeatConnection;

    initializeHeartbeat(heartbeatSocket);

    heartbeatSocket.on("pong", () => {
      markAlive(heartbeatSocket);

      connectionRegistry.updateLastSeen(heartbeatSocket);
    });

    /*
     * Load or create collaborative document
     */

    document = await documentManager.getOrCreate(documentName);

    /* Assigned once, then used by the handlers below. Kept as a local so those
       closures see a non-optional value — `document` itself is optional only so
       the catch block can tell whether loading got this far. */
    const activeDocument = document;

    /*
     * Attach Yjs update broadcaster.
     *
     * The broadcaster attaches exactly once per Y.Doc.
     */

    updateBroadcaster.attach(activeDocument);

    /*
     * Attach the awareness (presence) broadcaster — once per document.
     */
    awarenessBroadcaster.attach(activeDocument);

    /*
     * Register collaboration client
     */

    client = {
      id: clientId,
      socket: ws,
      userId,
    };

    const added = documentManager.addClient(documentName, client);

    if (!added) {
      throw new Error("Failed to register collaboration client.");
    }

    /*
     * A client is now active: cancel any pending idle cleanup so the
     * document is not destroyed underneath this new connection.
     */
    idleCleanup.cancel(documentName);

    /*
     * H-5: seed the new client with the current presence of everyone already
     * connected, so it sees existing collaborators immediately.
     */
    awarenessBroadcaster.sendCurrentTo(document, ws);

    /*
     * ---------------------------------------------------------
     * Send initial Yjs synchronization
     *
     * Application protocol:
     *
     *   CollaborationMessage.Sync
     *
     * Yjs protocol:
     *
     *   Sync Step 1
     * ---------------------------------------------------------
     */

    const encoder = encoding.createEncoder();

    encoding.writeVarUint(encoder, CollaborationMessage.Sync);

    ySyncProtocol.writeSyncStep1(encoder, document.doc);

    const initialSync = encoding.toUint8Array(encoder);

    if (ws.readyState === ws.OPEN) {
      ws.send(initialSync);
    }

    /* Registered, attached and synced: the connection is live. */
    phase = transitionConnectionPhase(phase, { type: "READY" }).phase;

    yjsLogger.info(
      {
        documentName,
        userId,
        clientId,
        connections: document.connectionCount,
        bytes: initialSync.length,
        remoteAddress,
      },
      "Yjs collaboration connection established.",
    );

    /*
     * Incoming WebSocket messages
     */

    ws.on("message", (data, isBinary) => {
      if (!isBinary) {
        yjsLogger.warn(
          {
            documentName,
            userId,
            clientId,
          },
          "Rejected non-binary collaboration message.",
        );

        return;
      }

      if (!client) {
        yjsLogger.warn(
          {
            documentName,
            userId,
            clientId,
          },
          "Received collaboration message without client.",
        );

        return;
      }

      let message: Buffer;

      /*
       * ws RawData can be:
       *
       *   Buffer
       *   ArrayBuffer
       *   Buffer[]
       *
       * Normalize everything to Buffer.
       */

      if (Buffer.isBuffer(data)) {
        message = data;
      } else if (data instanceof ArrayBuffer) {
        message = Buffer.from(new Uint8Array(data));
      } else {
        message = Buffer.concat(data);
      }

      if (message.length === 0) {
        yjsLogger.warn(
          {
            documentName,
            userId,
            clientId,
          },
          "Received empty collaboration message.",
        );

        return;
      }

      /*
       * Delegate protocol processing.
       */

      messageHandler.handleMessage(ws, activeDocument, message, { canWrite });

      connectionRegistry.updateLastSeen(ws);
    });

    /*
     * Connection close
     */

    ws.on("close", (code, reason) => {
      closeConnection();

      yjsLogger.info(
        {
          documentName,
          userId,
          clientId,
          code,
          reason: reason.toString(),
          connections: activeDocument.connectionCount,
          remoteAddress,
        },
        "Yjs collaboration connection closed.",
      );

      /*
       * The document itself is intentionally not destroyed.
       *
       * Idle document lifecycle is responsible for eventually
       * releasing inactive documents.
       */
    });

    /*
     * Socket error
     */

    ws.on("error", (error) => {
      yjsLogger.error(
        {
          err: error,
          documentName,
          userId,
          clientId,
          remoteAddress,
        },
        "Yjs collaboration WebSocket error.",
      );
    });
  } catch (error) {
    /*
     * Connection initialization failure
     */

    yjsLogger.error(
      {
        err: error,
        documentName,
        userId,
        boardId,
        clientId,
        remoteAddress,
      },
      "Failed to initialize Yjs collaboration connection.",
    );

    /*
     * Undo whatever this connection managed to set up.
     *
     * Same call as the close handler, so the two paths cannot drift again: the
     * phase decides whether the registry entry, the document client, the
     * awareness entry or all of them still need releasing.
     */
    closeConnection();

    /*
     * Close the socket if it is still usable.
     */

    if (ws.readyState === ws.OPEN || ws.readyState === ws.CONNECTING) {
      ws.close(WS_CLOSE_CODE.INTERNAL_ERROR, "Internal Server Error");
    }
  }
}
