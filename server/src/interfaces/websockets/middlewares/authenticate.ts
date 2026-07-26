import type { IncomingMessage } from "http";

import { verifyAccessToken } from "../../../infrastructure/security/token";

export interface AuthenticatedSocketContext {
  userId: string;
  boardId: string;
}

export async function authenticate(
  request: IncomingMessage,
): Promise<AuthenticatedSocketContext> {
  const url = new URL(request.url ?? "", "http://localhost");

  const token = url.searchParams.get("token");
  const boardId = url.searchParams.get("boardId");

  if (!token) {
    throw new Error("Missing access token.");
  }

  if (!boardId) {
    throw new Error("Missing boardId.");
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    throw new Error("Invalid or expired access token.");
  }

  return {
    userId: payload.userId,
    boardId,
  };
}
