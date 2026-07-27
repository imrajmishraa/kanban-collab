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

export interface UpgradeRequestParams {
  pathname: string;
  token: string;
  boardId: string;
}

const WEBSOCKET_PATH = "/ws";

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

  const token = getRequiredToken(url);
  const boardId = getRequiredBoardId(url);

  return {
    pathname: url.pathname,
    token,
    boardId,
  };
}

function getRequiredToken(url: URL): string {
  const token = url.searchParams.get("token")?.trim();

  if (!token) {
    logger.warn(
      { pathname: url.pathname },
      "Missing access token in WebSocket request.",
    );

    throw invalidAccessTokenError();
  }

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
