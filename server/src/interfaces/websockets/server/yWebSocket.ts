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
import { idleCleanup } from "../collaboration/lifecycle/idleCleanup";

import { documentManager } from "../collaboration/yjs/documentManager";
import { messageHandler } from "../collaboration/yjs/messageHandler";
import { updateBroadcaster } from "../collaboration/yjs/updateBroadcaster";

import { CollaborationMessage } from "../collaboration/yjs/protocol";
import type { CollaborationClient } from "../collaboration/yjs/types";

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

  /*
   * Validate authenticated WebSocket context
   */

  if (!userId || !boardId) {
    yjsLogger.warn(
      {
        url: request.url,
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
  let registered = false;

  try {
    /*
     * Register connection
     */

    connectionRegistry.register(ws, userId, boardId, remoteAddress);

    registered = true;

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

    const document = await documentManager.getOrCreate(documentName);

    /*
     * Attach Yjs update broadcaster.
     *
     * The broadcaster attaches exactly once per Y.Doc.
     */

    updateBroadcaster.attach(document);

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

    yjsLogger.info(
      {
        documentName,
        userId,
        clientId,
        connections: document.connectionCount,
        bytes: initialSync.length,
        remoteAddress,
        url: request.url,
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

      messageHandler.handleMessage(ws, document, message);

      connectionRegistry.updateLastSeen(ws);
    });

    /*
     * Connection close
     */

    ws.on("close", (code, reason) => {
      if (client) {
        documentManager.removeClient(documentName, client.id);
      }

      /*
       * If this was the last client, schedule idle cleanup so the document is
       * eventually freed instead of living in memory forever. When other
       * clients remain, schedule() is a no-op (connectionCount > 0).
       */
      idleCleanup.schedule(documentName);

      if (registered) {
        connectionRegistry.unregister(ws);
        registered = false;
      }

      yjsLogger.info(
        {
          documentName,
          userId,
          clientId,
          code,
          reason: reason.toString(),
          connections: document.connectionCount,
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
        url: request.url,
      },
      "Failed to initialize Yjs collaboration connection.",
    );

    /*
     * Remove collaboration client if it was registered.
     */

    if (client) {
      documentManager.removeClient(documentName, client.id);
    }

    /*
     * Schedule idle cleanup in case this failed connection left the document
     * with no active clients.
     */
    idleCleanup.schedule(documentName);

    /*
     * Remove global connection registry entry.
     */

    if (registered) {
      connectionRegistry.unregister(ws);
      registered = false;
    }

    /*
     * Close the socket if it is still usable.
     */

    if (ws.readyState === ws.OPEN || ws.readyState === ws.CONNECTING) {
      ws.close(WS_CLOSE_CODE.INTERNAL_ERROR, "Internal Server Error");
    }
  }
}
