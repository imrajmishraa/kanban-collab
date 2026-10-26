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
  role?: string;
  canWrite?: boolean;
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
   * `ApiError` and is handled by the catch below instead of crashing the
   * server. The two locals exist so the catch can still log what was parsed.
   *
   * H-2: the raw request URL is never logged (it may carry a deprecated
   * `?token=`). Only the pathname and board id are logged.
   */
  let pathname: string | undefined;
  let boardId: string | undefined;

  try {
    const parsed = parseUpgradeRequest(request);
    pathname = parsed.pathname;
    boardId = parsed.boardId;

    const { userId } = await authenticate(parsed.token);

    // H-3: enforce visibility + role, and carry `canWrite` onto the connection
    // so guests are made read-only downstream.
    const auth = await authorize(userId, parsed.boardId);

    // `authorize` always returns a role in production. The optional access keeps
    // upgrade robust when authorization is mocked (integration tests) or
    // returns nothing, defaulting to write-capable.
    const role = auth?.role;
    const canWrite = auth?.canWrite ?? true;

    const upgradedRequest = request as AuthenticatedRequest;

    upgradedRequest.pathname = parsed.pathname;
    upgradedRequest.userId = userId;
    upgradedRequest.boardId = parsed.boardId;
    upgradedRequest.role = role;
    upgradedRequest.canWrite = canWrite;

    websocketAuthLogger.info(
      {
        userId,
        boardId: parsed.boardId,
        pathname: parsed.pathname,
        role,
        canWrite,
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
        pathname,
        boardId,
      },
      "Unexpected WebSocket upgrade failure",
    );
    rejectUpgrade(socket, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
