import type { IncomingMessage } from "http";
import { URL } from "url";

import { Types } from "mongoose";

import { logger } from "../../../infrastructure/logging/logger";
import {
  boardIdRequiredError,
  invalidBoardIdError,
} from "../../../shared/errors/board/board";
import { invalidAccessTokenError } from "../../../shared/errors/auth/accessToken";
import { ApiError } from "../../../shared/utils/ApiError";
import { HTTP_STATUS } from "../../../shared/constants/http";
import { WS_AUTH_SUBPROTOCOL } from "../../../shared/constants/websocket";

export interface UpgradeRequestParams {
  pathname: string;
  token: string;
  boardId: string;
}

const WEBSOCKET_PATH = "/ws";

/**
 * Read the access token from the `Sec-WebSocket-Protocol` header (H-2).
 *
 * The client opens the socket with `new WebSocket(url, ["kanban.auth", token])`,
 * so the header arrives as `kanban.auth, <token>`. This keeps the token out of
 * the URL (and therefore out of logs, proxies and browser history).
 */
function getSubprotocolToken(request: IncomingMessage): string | null {
  const raw = request.headers["sec-websocket-protocol"];
  const header = Array.isArray(raw) ? raw.join(",") : raw;

  if (!header) {
    return null;
  }

  const parts = header
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const index = parts.indexOf(WS_AUTH_SUBPROTOCOL);

  if (index === -1) {
    return null;
  }

  const token = parts[index + 1];

  return token && token.length > 0 ? token : null;
}

export function parseUpgradeRequest(
  request: IncomingMessage,
): UpgradeRequestParams {
  if (!request.url) {
    logger.warn("WebSocket upgrade request is missing a URL.");

    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Missing request URL.");
  }

  let url: URL;

  try {
    /**
     * IncomingMessage.url only contains the path.
     * A dummy origin is required to construct a URL instance.
     */
    url = new URL(request.url, "http://localhost");
  } catch (cause) {
    logger.warn({ cause }, "Received malformed WebSocket upgrade URL.");

    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid request URL.");
  }

  if (url.pathname !== WEBSOCKET_PATH) {
    logger.warn({ pathname: url.pathname }, "Invalid WebSocket endpoint.");

    throw new ApiError(HTTP_STATUS.NOT_FOUND, "WebSocket endpoint not found.");
  }

  // Prefer the subprotocol; fall back to the deprecated `?token=` query so
  // older clients (and the integration tests) keep working during migration.
  const token = getSubprotocolToken(request) ?? getRequiredToken(url);
  const boardId = getRequiredBoardId(url);

  return {
    pathname: url.pathname,
    token,
    boardId,
  };
}

/**
 * @deprecated The access token must travel in the `Sec-WebSocket-Protocol`
 * header. This query-string path is kept only as a migration fallback and
 * should be removed once every client and test uses the subprotocol.
 */
function getRequiredToken(url: URL): string {
  const token = url.searchParams.get("token")?.trim();

  if (!token) {
    logger.warn(
      { pathname: url.pathname },
      "Missing access token in WebSocket request.",
    );

    throw invalidAccessTokenError();
  }

  logger.warn(
    { pathname: url.pathname },
    "WebSocket access token supplied via query string (deprecated) — use the kanban.auth subprotocol.",
  );

  return token;
}

function getRequiredBoardId(url: URL): string {
  const boardId = url.searchParams.get("boardId")?.trim();

  if (!boardId) {
    logger.warn(
      { pathname: url.pathname },
      "Missing boardId in WebSocket request.",
    );

    throw boardIdRequiredError();
  }

  if (!Types.ObjectId.isValid(boardId)) {
    logger.warn(
      {
        pathname: url.pathname,
        boardId,
      },
      "Invalid boardId received.",
    );

    throw invalidBoardIdError();
  }

  return boardId;
}
