import http from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";

import type { WebSocketServer } from "ws";

import { ensureInfrastructure } from "../bootstrap/infrastructure";
import { lifecycleLogger } from "../infrastructure/logging/childLogger";
import { app } from "../interfaces/http/app";
import { attachWebSocketServer } from "../interfaces/websockets/server/server";
import { handleUpgrade } from "../interfaces/websockets/server/upgrade";

/**
 * Vercel Functions entry point.
 *
 * Vercel serves a Node function by importing this module and using its default
 * export, so the HTTP server is created at module load and reused for the life
 * of the instance. There is no `listen()` — the platform owns the socket.
 *
 * Differences from `src/main.ts`:
 *
 *   - No boot phase. Infrastructure connects lazily on the first request and
 *     is memoized by `ensureInfrastructure()`.
 *   - No cron scheduler. `node-cron` needs a process that outlives a request,
 *     which serverless does not provide; jobs are invoked over HTTP instead
 *     (see `routes/internal/cron.route.ts`).
 *   - No signal handlers. The platform controls instance lifetime.
 */
const server = http.createServer((req, res) => {
  void handleRequest(req, res);
});

let webSocketServer: Promise<WebSocketServer> | null = null;

function getWebSocketServer(): Promise<WebSocketServer> {
  webSocketServer ??= ensureInfrastructure().then(() =>
    attachWebSocketServer(server),
  );

  return webSocketServer;
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    await ensureInfrastructure();

    app(req, res);
  } catch (error) {
    lifecycleLogger.fatal(
      { err: error },
      "Infrastructure initialization failed — refusing request.",
    );

    if (!res.headersSent) {
      res.writeHead(503, {
        "content-type": "application/json",
        "retry-after": "5",
      });
    }

    res.end(JSON.stringify({ success: false, error: "Service unavailable" }));
  }
}

/**
 * WebSocket upgrades go through the same lazy path: the first upgrade waits
 * for infrastructure, then the shared `handleUpgrade` authenticates and
 * authorizes exactly as it does in the long-lived process.
 */
server.on("upgrade", (request, socket, head) => {
  void getWebSocketServer()
    .then((wss) => handleUpgrade(request, socket, head, wss))
    .catch((error: unknown) => {
      lifecycleLogger.error(
        { err: error },
        "WebSocket upgrade failed during initialization.",
      );

      socket.destroy();
    });
});

export default server;
