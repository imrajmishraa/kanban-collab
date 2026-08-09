import { clearInterval, setInterval } from "node:timers";

import { websocketConfig } from "../../../../config/websocket";
import { websocketLogger } from "../../../../infrastructure/logging/childLogger";

import { connectionRegistry } from "../lifecycle/connectionRegistry";

import { isAlive, markWaiting, type HeartbeatConnection } from "./heartbeat";

export class HeartbeatManager {
  private interval: NodeJS.Timeout | undefined;

  /**
   * Starts the heartbeat scheduler.
   *
   * Safe to call multiple times.
   */
  public start(): void {
    if (this.interval !== undefined) {
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
   *
   * Safe to call multiple times.
   */
  public stop(): void {
    if (this.interval === undefined) {
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

      /*
       * If the previous ping did not receive a pong,
       * consider the connection stale.
       */
      if (!isAlive(socket)) {
        staleConnections++;

        websocketLogger.warn(
          {
            connectionId: connection.id,
            userId: connection.userId,
            boardId: connection.boardId,
            ip: connection.ip,
          },
          "WebSocket heartbeat timeout. Closing stale connection.",
        );

        try {
          socket.terminate();
        } finally {
          connectionRegistry.unregister(socket);
        }

        continue;
      }

      healthyConnections++;

      /*
       * Mark the connection as waiting for the next pong
       * before sending the ping.
       */
      markWaiting(socket);

      try {
        socket.ping();
      } catch (error) {
        failedPings++;

        websocketLogger.error(
          {
            err: error,
            connectionId: connection.id,
            userId: connection.userId,
            boardId: connection.boardId,
            ip: connection.ip,
          },
          "Failed to send WebSocket heartbeat ping.",
        );

        try {
          socket.terminate();
        } finally {
          connectionRegistry.unregister(socket);
        }
      }
    }

    websocketLogger.debug(
      {
        activeConnections: connectionRegistry.getConnectionCount(),
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
      healthy: this.isRunning(),
      activeConnections: connectionRegistry.getConnectionCount(),
    };
  }
}

/**
 * Singleton heartbeat manager.
 */
export const heartbeatManager = new HeartbeatManager();
