import { clearInterval, setInterval } from "node:timers";

import { websocketLogger } from "../../../../infrastructure/logging/childLogger";
import { websocketConfig } from "../../../../config/websocket";

import { connectionRegistry } from "../lifecycle/connectionRegistry";

import { isAlive, markWaiting, type HeartbeatConnection } from "./heartbeat";

export class HeartbeatManager {
  private interval?: NodeJS.Timeout;

  /**
   * Starts the heartbeat scheduler.
   * Safe to call multiple times.
   */
  public start(): void {
    if (this.interval) {
      websocketLogger.warn("Heartbeat manager is already running.");
      return;
    }

    this.interval = setInterval(() => {
      this.monitor();
    }, websocketConfig.heartbeat.intervalMs);

    websocketLogger.info(
      {
        intervalMs: websocketConfig.heartbeat.intervalMs,
      },
      "WebSocket heartbeat manager started.",
    );
  }

  /**
   * Stops heartbeat monitoring.
   */
  public stop(): void {
    if (!this.interval) {
      websocketLogger.warn("Heartbeat manager is not running.");
      return;
    }

    clearInterval(this.interval);
    this.interval = undefined;

    websocketLogger.info("WebSocket heartbeat manager stopped.");
  }

  /**
   * Executes one heartbeat cycle.
   */
  private monitor(): void {
    const connections = connectionRegistry.getConnections();

    let healthyConnections = 0;
    let staleConnections = 0;
    let failedPings = 0;

    for (const connection of connections) {
      const socket = connection.socket as HeartbeatConnection;

      if (!isAlive(socket)) {
        staleConnections++;

        websocketLogger.warn(
          {
            userId: connection.userId,
            boardId: connection.boardId,
            ip: connection.ip,
          },
          "WebSocket heartbeat timeout. Closing stale connection.",
        );

        socket.terminate();
        connectionRegistry.unregister(socket);

        continue;
      }

      healthyConnections++;

      markWaiting(socket);

      try {
        socket.ping();
      } catch (error) {
        failedPings++;

        websocketLogger.error(
          {
            err: error,
            userId: connection.userId,
            boardId: connection.boardId,
            ip: connection.ip,
          },
          "Failed to send WebSocket heartbeat ping.",
        );

        socket.terminate();
        connectionRegistry.unregister(socket);
      }
    }

    const activeConnections = connectionRegistry.getConnectionCount();

    websocketLogger.info(
      {
        activeConnections,
        healthyConnections,
        staleConnections,
        failedPings,
        intervalMs: websocketConfig.heartbeat.intervalMs,
      },
      "WebSocket heartbeat health check completed.",
    );
  }

  /**
   * Returns the number of active connections.
   */
  public getConnectionCount(): number {
    return connectionRegistry.getConnectionCount();
  }

  /**
   * Returns whether heartbeat monitoring is currently running.
   */
  public isRunning(): boolean {
    return this.interval !== undefined;
  }

  /**
   * Returns the current WebSocket health snapshot.
   */
  public getHealth(): {
    healthy: boolean;
    activeConnections: number;
  } {
    return {
      healthy: Boolean(this.interval),
      activeConnections: connectionRegistry.getConnectionCount(),
    };
  }
}

/**
 * Singleton heartbeat manager.
 */
export const heartbeatManager = new HeartbeatManager();
