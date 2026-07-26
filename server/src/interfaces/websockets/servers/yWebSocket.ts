import type { IncomingMessage } from "http";

import { WebSocketServer } from "ws";

// @ts-ignore
import { setupWSConnection } from "y-websocket/bin/utils";

import { logger } from "../../../infrastructure/logging/logger";

export function registerYWebSocket(wss: WebSocketServer): void {
  wss.on("connection", (ws, request: IncomingMessage) => {
    try {
      setupWSConnection(ws, request);

      logger.info(
        {
          remoteAddress: request.socket.remoteAddress,
          url: request.url,
        },
        "Yjs WebSocket connection established.",
      );

      ws.on("close", () => {
        logger.info(
          {
            remoteAddress: request.socket.remoteAddress,
          },
          "Yjs WebSocket connection closed.",
        );
      });

      ws.on("error", (error) => {
        logger.error(error, "Yjs WebSocket connection error.");
      });
    } catch (error) {
      logger.error(error, "Failed to initialize Yjs WebSocket connection.");

      ws.close();
    }
  });
}
