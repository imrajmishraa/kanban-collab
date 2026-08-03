import type { IncomingMessage } from "http";
import type { Duplex } from "stream";

import { WebSocketServer } from "ws";

import { websocketAuthLogger } from "../../../infrastructure/logging/childLogger";

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
  const { pathname, boardId } = parseUpgradeRequest(request);
  try {
    const { userId } = await authenticate(request);

    await authorize(userId, boardId);

    const upgradedRequest = request as AuthenticatedRequest;

    upgradedRequest.pathname = pathname;
    upgradedRequest.userId = userId;
    upgradedRequest.boardId = boardId;

    websocketAuthLogger.info(
      {
        userId,
        boardId,
        pathname,
      },
      "WebSocket upgrade authorized",
    );
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, upgradedRequest);
    });
  } catch (error) {
    if (error instanceof ApiError) {
      websocketAuthLogger.warn(
        {
          statusCode: error.statusCode,
          url: request.url,
          boardId,
          message: error.message,
        },
        "WebSocket upgrade rejected",
      );

      rejectUpgrade(socket, error.statusCode);
      return;
    }

    websocketAuthLogger.error(
      {
        err: error,
        url: request.url,
        pathname,
        boardId,
      },
      "Unexpected WebSocket upgrade failure",
    );
    rejectUpgrade(socket, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
