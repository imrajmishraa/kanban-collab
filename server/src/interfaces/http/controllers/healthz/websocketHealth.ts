import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { HTTP_STATUS } from "../../../../shared/constants/http";
import { websocketLogger } from "../../../../infrastructure/logging/childLogger";
import { heartbeatManager } from "../../../websockets/collaboration/heartbeat/heartbeatManager";

/**
 * GET /healthz/websocket
 *
 * WebSocket-specific readiness probe. Returns 200 when the heartbeat
 * monitor is running, 503 otherwise.
 *
 * Kept separate from the main `/readyz` so that WebSocket failures don't
 * take the HTTP server out of rotation. A load balancer can probe this
 * only on the WS-capable pods.
 */
export const websocketHealth = asyncHandler(async (_req, res) => {
  const heartbeatRunning = heartbeatManager.isRunning();
  const activeConnections = heartbeatManager.getConnectionCount();

  const isHealthy = heartbeatRunning;
  const statusCode = isHealthy
    ? HTTP_STATUS.OK
    : HTTP_STATUS.SERVICE_UNAVAILABLE;

  // Debug, not info — probes fire every few seconds
  websocketLogger.debug(
    { heartbeatRunning, activeConnections, status: isHealthy ? "UP" : "DOWN" },
    "WebSocket health check.",
  );

  return res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      isHealthy
        ? "WebSocket health check passed."
        : "WebSocket health check failed.",
      {
        status: isHealthy ? "UP" : "DOWN",
        heartbeat: {
          running: heartbeatRunning,
        },
        connections: {
          active: activeConnections,
        },
        timestamp: new Date().toISOString(),
      },
    ),
  );
});
