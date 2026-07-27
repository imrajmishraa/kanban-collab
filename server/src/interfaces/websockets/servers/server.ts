import http from "http";
import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

import { ENV } from "../../../config/env";
import { logger } from "../../../infrastructure/logging/logger";

import { handleUpgrade } from "./upgrade";
import { websocketConfig } from "../../../config/websocket";

let server: Server | null = null;

let wss: WebSocketServer | null = null;

const connectedClients = new Set<WebSocket>();

function createWebSocketServer(): WebSocketServer {
  const websocketServer = new WebSocketServer({
    noServer: true,

    maxPayload: websocketConfig.maxPayload,

    perMessageDeflate: websocketConfig.perMessageDeflate,
  });

  websocketServer.on("connection", (socket) => {
    connectedClients.add(socket);

    logger.info(
      {
        activeConnections: connectedClients.size,
      },
      "WebSocket client connected",
    );

    socket.on("close", () => {
      connectedClients.delete(socket);

      logger.info(
        {
          activeConnections: connectedClients.size,
        },
        "WebSocket client disconnected",
      );
    });

    socket.on("error", (error) => {
      logger.error(
        {
          error,
        },
        "WebSocket client error",
      );
    });
  });

  websocketServer.on("error", (error) => {
    logger.error(
      {
        error,
      },
      "WebSocket server error",
    );
  });

  return websocketServer;
}

function createHttpServer(): Server {
  const httpServer = http.createServer((_req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/plain",
    });

    res.end("WebSocket Collaboration Server Running\n");
  });

  return httpServer;
}

export async function startWebSocketServer(
  _httpServer?: Server,
): Promise<void> {
  return new Promise((resolve, reject) => {
    server = createHttpServer();

    wss = createWebSocketServer();

    server.on("upgrade", (request, socket, head) => {
      void handleUpgrade(request, socket, head, wss!);
    });

    const startupErrorHandler = (error: Error): void => {
      logger.fatal(
        {
          error,
        },
        "Failed to start WebSocket server",
      );

      reject(error);
    };

    server.once("error", startupErrorHandler);

    server.listen(ENV.WS_PORT, () => {
      server?.off("error", startupErrorHandler);

      logger.info(
        {
          port: ENV.WS_PORT,
        },
        "WebSocket server started",
      );

      resolve();
    });
  });
}

export async function stopWebSocketServer(): Promise<void> {
  if (!server || !wss) {
    return;
  }

  logger.info("Stopping WebSocket server...");

  // Close active clients

  for (const client of connectedClients) {
    client.close(1001, "Server shutting down");
  }

  connectedClients.clear();

  await new Promise<void>((resolve) => {
    wss!.close(() => {
      logger.info("WebSocket connections closed");

      resolve();
    });
  });

  await new Promise<void>((resolve, reject) => {
    server!.close((error) => {
      if (error) {
        logger.error(
          {
            error,
          },
          "Failed to close WebSocket HTTP server",
        );

        reject(error);

        return;
      }

      resolve();
    });
  });

  server = null;
  wss = null;

  logger.info("WebSocket server stopped successfully");
}
