import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { websocketLogger } from "../../../../infrastructure/logging/childLogger";
import { heartbeatManager } from "../../../websockets/collaboration/heartbeat/heartbeatManager";
import { HTTP_STATUS } from "../../../../shared/constants/http";

const websocketHealth = asyncHandler(async (_req, res) => {
  const heartbeatRunning = heartbeatManager.isRunning();
  const activeConnections = heartbeatManager.getConnectionCount();

  const status = heartbeatRunning ? "UP" : "DOWN";

  websocketLogger.info(
    {
      status,
      heartbeatRunning,
      activeConnections,
    },
    "WebSocket health check completed.",
  );

  return res
    .status(heartbeatRunning ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE)
    .json(
      new ApiResponse(
        heartbeatRunning ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE,
        heartbeatRunning
          ? "WebSocket health check passed"
          : "WebSocket health check failed",
        {
          status,
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

export { websocketHealth };
