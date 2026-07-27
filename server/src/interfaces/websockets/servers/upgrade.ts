import type { IncomingMessage } from "http";
import type { Duplex } from "stream";

import { WebSocketServer } from "ws";

import { logger } from "../../../infrastructure/logging/logger";

import { HTTP_STATUS } from "../../../shared/constants/http";
import { ApiError } from "../../../shared/utils/ApiError";

import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { parseUpgradeRequest } from "../utils/parseRequest";
import { rejectUpgrade } from "./rejectUpgrade";

interface AuthenticatedRequest extends IncomingMessage {
  pathname?: string;
  userId?: string;
  boardId?: string;
}

export async function handleUpgrade(
  request: IncomingMessage,
  socket: Duplex,
  head: Buffer,
  wss: WebSocketServer,
): Promise<void> {
  try {
    const { pathname, boardId } = parseUpgradeRequest(request);

    const { userId } = await authenticate(request);

    await authorize(userId, boardId);

    const upgradedRequest = request as AuthenticatedRequest;

    upgradedRequest.pathname = pathname;
    upgradedRequest.userId = userId;
    upgradedRequest.boardId = boardId;

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, upgradedRequest);
    });
  } catch (error) {
    if (error instanceof ApiError) {
      rejectUpgrade(socket, error.statusCode);
      return;
    }

    logger.error(
      {
        err: error,
        url: request.url,
      },
      "Unexpected error during WebSocket upgrade.",
    );

    rejectUpgrade(socket, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
