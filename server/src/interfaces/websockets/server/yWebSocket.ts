import { WebSocketServer } from "ws";

import { setupWSConnection } from "y-websocket/bin/utils";

import { logger } from "../../../infrastructure/logging/logger";

import { WS_CLOSE_CODE } from "../../../shared/constants/websocket";
import type { AuthenticatedRequest } from "../../../shared/types/request";

import { connectionRegistry } from "../collaboration/lifecycle/connectionRegistry";
import {
  initializeHeartbeat,
  markAlive,
  type HeartbeatConnection,
} from "../collaboration/heartbeat/heartbeat";

export function registerYWebSocket(wss: WebSocketServer): void {
  wss.on("connection", (ws, request) => {
    const req = request as AuthenticatedRequest;

    const { userId, boardId } = req;

    if (!userId || !boardId) {
      logger.warn(
        "Missing authenticated WebSocket context. Closing connection.",
      );

      ws.close(
        WS_CLOSE_CODE.INTERNAL_ERROR,
        "Authentication context missing",
      );

      return;
    }

    const ip = request.socket.remoteAddress ?? "unknown";

    connectionRegistry.register(
      ws,
      userId,
      boardId,
      ip,
    );

    const socket = ws as HeartbeatConnection;

    initializeHeartbeat(socket);

    socket.on("pong", () => {
      markAlive(socket);
      connectionRegistry.updateLastSeen(socket);
    });

    try {
      setupWSConnection(ws, request);

      logger.info(
        {
          userId,
          boardId,
          remoteAddress: ip,
          url: request.url,
        },
        "Yjs WebSocket connection established.",
      );
    } catch (error) {
      logger.error(
        {
          err: error,
          userId,
          boardId,
          remoteAddress: ip,
          url: request.url,
        },
        "Failed to initialize Yjs WebSocket connection.",
      );

      connectionRegistry.unregister(ws);

      ws.close(
        WS_CLOSE_CODE.INTERNAL_ERROR,
        "Internal Server Error",
      );

      return;
    }

    ws.on("close", (code, reason) => {
      connectionRegistry.unregister(ws);

      logger.info(
        {
          userId,
          boardId,
          remoteAddress: ip,
          code,
          reason: reason.toString(),
        },
        "Yjs WebSocket connection closed.",
      );
    });

    ws.on("error", (error) => {
      logger.error(
        {
          err: error,
          userId,
          boardId,
          remoteAddress: ip,
        },
        "Yjs WebSocket connection error.",
      );
    });
  });
}
