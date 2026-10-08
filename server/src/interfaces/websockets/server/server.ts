import type { Server } from "http";

import { WebSocketServer } from "ws";

import { websocketConfig } from "../../../config/websocket";
import { logger } from "../../../infrastructure/logging/logger";

import { initializeCollaboration } from "../bootstrap/initialize";

import { heartbeatManager } from "../collaboration/heartbeat/heartbeatManager";
import { gracefulShutdown } from "../collaboration/lifecycle/gracefulShutdown";
import { persistence } from "../collaboration/persistence/mongoPersistence";

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

    /**
     * Defense in depth: `handleUpgrade` handles its own errors, but this
     * catch guarantees that no rejection can ever escape the "upgrade"
     * listener and reach `main.ts`'s unhandledRejection shutdown path.
     */
    void handleUpgrade(request, socket, head, wss).catch((error: unknown) => {
      logger.error({ err: error }, "Unhandled WebSocket upgrade error.");

      socket.destroy();
    });
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
  wss = null;

  try {
    /*
     * Full graceful shutdown: stop idle timers, close every client, then
     * persist and destroy all active Yjs documents before closing the server.
     * Previously this only closed the WebSocketServer, so up to
     * `persistenceDebounceMs` of unsaved edits were lost on every restart.
     */
    await gracefulShutdown.shutdown(websocketServer);
  } catch (error) {
    logger.error({ err: error }, "WebSocket graceful shutdown failed.");
  }

  /*
   * Stop the heartbeat interval so it cannot keep the event loop alive.
   */
  heartbeatManager.stop();

  /*
   * Flush any debounced Yjs writes that were still pending.
   */
  await persistence.shutdown();

  logger.info("WebSocket infrastructure stopped.");
}
