import { clearInterval, setInterval } from "node:timers";

import { logger } from "../../../../infrastructure/logging/logger";
import { websocketConfig } from "../../../../config/websocket";

import { connectionRegistry } from "../lifecycle/connectionRegistry";

import {
  isAlive,
  markWaiting,
  type HeartbeatConnection,
} from "./heartbeat";

export class HeartbeatManager {
  private interval?: NodeJS.Timeout;

  /**
   * Starts the heartbeat scheduler.
   * Safe to call multiple times.
   */
  public start(): void {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(() => {
      this.monitor();
    }, websocketConfig.heartbeat.intervalMs);

    logger.info(
      {
        intervalMs: websocketConfig.heartbeat.intervalMs,
      },
      "Heartbeat manager started.",
    );
  }

  /**
   * Stops heartbeat monitoring.
   */
  public stop(): void {
    if (!this.interval) {
      return;
    }

    clearInterval(this.interval);

    this.interval = undefined;

    logger.info("Heartbeat manager stopped.");
  }

  /**
   * Executes one heartbeat cycle.
   */
  private monitor(): void {
    for (const connection of connectionRegistry.getConnections()) {
      const socket = connection.socket as HeartbeatConnection;

      if (!isAlive(socket)) {
        logger.warn(
          {
            userId: connection.userId,
            boardId: connection.boardId,
            ip: connection.ip,
          },
          "Heartbeat timeout. Closing stale WebSocket connection.",
        );

        socket.terminate();

        connectionRegistry.unregister(socket);

        continue;
      }

      markWaiting(socket);

      try {
        socket.ping();
      } catch (error) {
        logger.error(
          {
            err: error,
            userId: connection.userId,
            boardId: connection.boardId,
            ip: connection.ip,
          },
          "Failed to send heartbeat ping.",
        );

        socket.terminate();

        connectionRegistry.unregister(socket);
      }
    }
  }

  /**
   * Returns the number of active connections.
   */
  public getConnectionCount(): number {
    return connectionRegistry.getConnectionCount();
  }
}

/**
 * Singleton heartbeat manager.
 */
export const heartbeatManager = new HeartbeatManager();
