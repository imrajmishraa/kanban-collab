import type { IncomingMessage } from "http";
import type { Duplex } from "stream";

import type { WebSocketServer } from "ws";

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
  /**
   * `handleUpgrade` is invoked as `void handleUpgrade(...)` from the HTTP
   * server's "upgrade" listener, so any rejection that escapes this function
   * becomes an `unhandledRejection`, which `main.ts` converts into a full
   * process shutdown. Parsing therefore happens *inside* the try: an invalid
   * upgrade (missing URL, wrong path, missing/invalid token or boardId) is an
   * `ApiError` and is now handled by the catch below instead of crashing the
   * server. The two locals exist so the catch can still log what was parsed.
   */
  let pathname: string | undefined;
  let boardId: string | undefined;

  try {
    const parsed = parseUpgradeRequest(request);
    pathname = parsed.pathname;
    boardId = parsed.boardId;

    const { userId } = await authenticate(request);

    await authorize(userId, parsed.boardId);

    const upgradedRequest = request as AuthenticatedRequest;

    upgradedRequest.pathname = parsed.pathname;
    upgradedRequest.userId = userId;
    upgradedRequest.boardId = parsed.boardId;

    websocketAuthLogger.info(
      {
        userId,
        boardId: parsed.boardId,
        pathname: parsed.pathname,
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
