import type { IncomingMessage } from "http";

import { verifyAccessToken } from "../../../infrastructure/security/token";
import { expiredAccessTokenError, missingAccessTokenError } from "../../../shared/errors/auth/accessToken";
import { boardIdRequiredError } from "../../../shared/errors/board/board";
import { InvalidWebSocketRequestError } from "../../../shared/errors/websocket/websocket";

export interface AuthenticatedSocketContext {
  userId: string;
  boardId: string;
}

export async function authenticate(
  request: IncomingMessage,
): Promise<AuthenticatedSocketContext> {
  let url: URL;

  try {
    url = new URL(request.url ?? "", "http://localhost");
  } catch {
    throw InvalidWebSocketRequestError();
  }

  const token = url.searchParams.get("token");
  const boardId = url.searchParams.get("boardId");

  if (!token) {
    throw missingAccessTokenError();
  }

  if (!boardId) {
    throw boardIdRequiredError();
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    throw expiredAccessTokenError();
  }

  return {
    userId: payload.userId,
    boardId,
  };
}
