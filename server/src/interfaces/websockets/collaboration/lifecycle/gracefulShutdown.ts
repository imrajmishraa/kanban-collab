import type { WebSocketServer } from "ws";

import { websocketConfig } from "../../../../config/websocket";
import { websocketLogger } from "../../../../infrastructure/logging/childLogger";

import { documentManager } from "../yjs/documentManager";
import { connectionRegistry } from "./connectionRegistry";
import { idleCleanup } from "./idleCleanup";

export class GracefulShutdown {
  private shuttingDown = false;

  /**
   * Gracefully shuts down the collaboration layer.
   *
   * Shutdown order:
   *
   * 1. Prevent duplicate shutdown execution.
   * 2. Stop idle cleanup timers.
   * 3. Stop accepting new WebSocket connections.
   * 4. Close active WebSocket connections.
   * 5. Persist and destroy active Yjs documents.
   * 6. Clear the connection registry.
   */
  public async shutdown(wss?: WebSocketServer): Promise<void> {
    if (this.shuttingDown) {
      websocketLogger.warn("WebSocket graceful shutdown already in progress.");

      return;
    }

    this.shuttingDown = true;

    websocketLogger.info(
      {
        connections: connectionRegistry.getConnectionCount(),
        documents: documentManager.count(),
      },
      "Starting graceful WebSocket shutdown.",
    );

    try {
      // Stop all pending idle document cleanup timers.
      idleCleanup.clear();

      // Close all currently connected clients FIRST so no further updates
      // arrive while we persist below. This must happen before awaiting
      // `wss.close()`: that callback only fires once the server has stopped
      // AND every client has disconnected, so awaiting it first can deadlock.
      this.closeActiveConnections();

      // Persist and destroy all active Yjs documents. This is the
      // data-safety-critical step, so it runs before the (potentially slow)
      // WebSocket server close.
      await this.destroyDocuments();

      // Stop accepting new WebSocket connections (bounded by the configured
      // shutdown timeout so a stuck client cannot block process exit).
      if (wss) {
        await this.closeWebSocketServer(wss);
      }

      // Remove all remaining connection references.
      connectionRegistry.clear();

      websocketLogger.info("Graceful WebSocket shutdown completed.");
    } catch (error) {
      websocketLogger.error(
        {
          err: error,
        },
        "WebSocket graceful shutdown failed.",
      );

      throw error;
    }
  }

  /**
   * Stops the WebSocket server from accepting
   * new connections.
   */
  private async closeWebSocketServer(wss: WebSocketServer): Promise<void> {
    const timeoutMs = websocketConfig.shutdownTimeoutMs;

    await new Promise<void>((resolve, reject) => {
      let settled = false;

      const timer = setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;

        websocketLogger.warn(
          { timeoutMs },
          "Timed out waiting for the WebSocket server to close.",
        );

        resolve();
      }, timeoutMs);

      wss.close((error?: Error) => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timer);

        if (error) {
          reject(error);
          return;
        }

        websocketLogger.info(
          "WebSocket server stopped accepting new connections.",
        );

        resolve();
      });
    });
  }

  /**
   * Closes all active WebSocket connections.
   */
  private closeActiveConnections(): void {
    const connections = connectionRegistry.getConnections();

    if (connections.length === 0) {
      return;
    }

    websocketLogger.info(
      {
        connections: connections.length,
      },
      "Closing active WebSocket connections.",
    );

    for (const connection of connections) {
      try {
        if (connection.socket.readyState === connection.socket.OPEN) {
          connection.socket.close(1001, "Server shutting down");
        }
      } catch (error) {
        websocketLogger.warn(
          {
            err: error,
            connectionId: connection.id,
          },
          "Failed to gracefully close WebSocket connection.",
        );

        try {
          connection.socket.terminate();
        } catch {
          // Socket is already unavailable.
        }
      }
    }
  }

  /**
   * Persists and destroys all active Yjs documents.
   */
  private async destroyDocuments(): Promise<void> {
    const documents = documentManager.list();

    if (documents.length === 0) {
      return;
    }

    websocketLogger.info(
      {
        documents: documents.length,
      },
      "Persisting and destroying active collaborative documents.",
    );

    const results = await Promise.allSettled(
      documents.map((document) => documentManager.destroy(document.name)),
    );

    let failed = 0;

    for (const result of results) {
      if (result.status === "rejected" || result.value === false) {
        failed++;
      }
    }

    if (failed > 0) {
      websocketLogger.error(
        {
          failed,
          total: documents.length,
        },
        "Some collaborative documents failed to shut down cleanly.",
      );

      return;
    }

    websocketLogger.info(
      {
        documents: documents.length,
      },
      "All collaborative documents shut down cleanly.",
    );
  }

  /**
   * Returns whether shutdown has started.
   */
  public isShuttingDown(): boolean {
    return this.shuttingDown;
  }

  /**
   * Returns the configured shutdown timeout.
   */
  public getShutdownTimeout(): number {
    return websocketConfig.shutdownTimeoutMs;
  }
}

export const gracefulShutdown = new GracefulShutdown();
