import { WebSocketServer } from "ws";

import { setupWSConnection } from "y-websocket/bin/utils";

import { logger } from "../../../infrastructure/logging/logger";

import { WS_CLOSE_CODE } from "../../../shared/constants/websocket";
import type { AuthenticatedRequest } from "../../../shared/types/request";

export function registerYWebSocket(wss: WebSocketServer): void {
  wss.on("connection", (ws, request) => {
    const req = request as AuthenticatedRequest;

    try {
      setupWSConnection(ws, request);

      logger.info(
        {
          userId: req.userId,
          boardId: req.boardId,
          remoteAddress: request.socket.remoteAddress,
          url: request.url,
        },
        "Yjs WebSocket connection established.",
      );

      ws.on("close", (code, reason) => {
        logger.info(
          {
            userId: req.userId,
            boardId: req.boardId,
            remoteAddress: request.socket.remoteAddress,
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
            userId: req.userId,
            boardId: req.boardId,
          },
          "Yjs WebSocket connection error.",
        );
      });
    } catch (error) {
      logger.error(
        {
          err: error,
          userId: req.userId,
          boardId: req.boardId,
          remoteAddress: request.socket.remoteAddress,
          url: request.url,
        },
        "Failed to initialize Yjs WebSocket connection.",
      );

      ws.close(WS_CLOSE_CODE.INTERNAL_ERROR, "Internal Server Error");
    }
  });
}
