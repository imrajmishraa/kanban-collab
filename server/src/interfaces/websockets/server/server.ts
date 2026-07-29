import type { Server } from "http";

import { WebSocketServer } from "ws";

import { websocketConfig } from "../../../config/websocket";
import { logger } from "../../../infrastructure/logging/logger";

import { initializeCollaboration } from "../bootstrap/initialize";

import { handleUpgrade } from "./upgrade";
import { registerYWebSocket } from "./yWebSocket";

let wss: WebSocketServer | null = null;

/**
 * Creates the application's WebSocket server.
 *
 * The WebSocket server runs in "noServer" mode and
 * shares the same HTTP server used by Express.
 */
function createWebSocketServer(): WebSocketServer {
  const server = new WebSocketServer({
    noServer: true,

    maxPayload: websocketConfig.maxPayload,

    perMessageDeflate: websocketConfig.perMessageDeflate,
  });

  server.on("error", (error) => {
    logger.error(
      {
        err: error,
      },
      "WebSocket server error.",
    );
  });

  registerYWebSocket(server);

  return server;
}

/**
 * Initializes the WebSocket layer.
 *
 * Does NOT create or start an HTTP server.
 * It attaches itself to the existing Express server.
 */
export async function startWebSocketServer(httpServer: Server): Promise<void> {
  if (wss) {
    logger.warn("WebSocket server already initialized.");

    return;
  }

  logger.info("Initializing WebSocket infrastructure...");

  initializeCollaboration();

  wss = createWebSocketServer();

  httpServer.on("upgrade", (request, socket, head) => {
    if (!wss) {
      socket.destroy();

      return;
    }

    void handleUpgrade(request, socket, head, wss);
  });

  logger.info("WebSocket infrastructure initialized.");
}

/**
 * Gracefully shuts down the WebSocket layer.
 */
export async function stopWebSocketServer(): Promise<void> {
  if (!wss) {
    return;
  }

  logger.info("Stopping WebSocket infrastructure...");

  const websocketServer = wss;

  await new Promise<void>((resolve, reject) => {
    websocketServer.close((error?: Error) => {
      if (error) {
        reject(error);

        return;
      }

      resolve();
    });
  });

  wss = null;

  logger.info("WebSocket infrastructure stopped.");
}
