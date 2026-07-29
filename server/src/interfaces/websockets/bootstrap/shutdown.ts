import { logger } from "../../../infrastructure/logging/logger";

import { heartbeatManager } from "../collaboration/heartbeat/heartbeatManager";
import { connectionRegistry } from "../collaboration/lifecycle/connectionRegistry";
import { shutdownRedis } from "../collaboration/persistence/redisSync";

let shuttingDown = false;

/**
 * Gracefully shuts down all collaboration infrastructure.
 *
 * Safe to call multiple times.
 */
export async function shutdownCollaboration(): Promise<void> {
  if (shuttingDown) {
    logger.debug("Collaboration shutdown already in progress.");

    return;
  }

  shuttingDown = true;

  logger.info("Shutting down collaboration infrastructure...");

  try {
    /*
     * Stop heartbeat so no more ping/pong events occur.
     */
    heartbeatManager.stop();

    /*
     * Close every active WebSocket connection.
     */
    for (const connection of connectionRegistry.getConnections()) {
      try {
        connection.socket.close(1001, "Server shutting down");
      } catch (error) {
        logger.warn(
          {
            err: error,
            userId: connection.userId,
            boardId: connection.boardId,
          },
          "Failed to close WebSocket connection.",
        );
      }
    }

    /*
     * Disconnect Redis Pub/Sub.
     */
    await shutdownRedis();

    /*
     * Future additions:
     *
     * await documentManager.flushAll();
     * await awarenessManager.shutdown();
     * await collaborationMetrics.shutdown();
     * await idleCleanup.stop();
     */

    logger.info("Collaboration infrastructure shut down successfully.");
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      "Error while shutting down collaboration infrastructure.",
    );
  }
}
