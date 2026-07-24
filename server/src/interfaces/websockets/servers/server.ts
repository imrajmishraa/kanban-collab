import http from "http";
import { WebSocketServer } from "ws";
import { ENV } from "../../../config/env";
import { logger } from "../../../infrastructure/logging/logger";
import { handleUpgrade } from "./upgrade";

const server = http.createServer((_req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain",
  });

  res.end("WebSocket Collaboration Server Running\n");
});

const wss = new WebSocketServer({
  noServer: true,
});

// Runtime server errors.
server.on("error", (error) => {
  logger.error(error, "WebSocket server encountered an error.");
});

// Handle HTTP → WebSocket upgrades.
server.on("upgrade", (request, socket, head) => {
  void handleUpgrade(request, socket, head, wss);
});

//  Starts the WebSocket server.
export function startWebSocketServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const onStartupError = (error: Error): void => {
      logger.fatal(error, "Failed to start WebSocket server.");

      reject(error);
    };

    server.once("error", onStartupError);

    server.listen(ENV.WS_PORT, () => {
      server.off("error", onStartupError);

      logger.info(
        {
          port: ENV.WS_PORT,
        },
        `WebSocket server listening on port ${ENV.WS_PORT}`,
      );

      resolve();
    });
  });
}

// Gracefully shuts down the WebSocket server.
export function stopWebSocketServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.info("Stopping WebSocket server...");

    wss.close();

    server.close((error) => {
      if (error) {
        logger.error(error, "Failed to stop WebSocket server.");

        reject(error);

        return;
      }

      logger.info("WebSocket server stopped.");

      resolve();
    });
  });
}
