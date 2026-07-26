import type { IncomingMessage } from "http";
import type { Duplex } from "stream";

import { WebSocketServer } from "ws";

import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { parseUpgradeRequest } from "../utils/parseRequest";
import { rejectUpgrade } from "./rejectUpgrade";

export async function handleUpgrade(
  request: IncomingMessage,
  socket: Duplex,
  head: Buffer,
  wss: WebSocketServer,
): Promise<void> {
  try {
    const { pathname, token, boardId } = parseUpgradeRequest(request);

    const { userId } = await authenticate(request);

    await authorize(userId, boardId);

    // Optional: attach parsed/authenticated data for downstream handlers
    Object.assign(request, {
      pathname,
      userId,
      boardId,
    });

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "Board not found.":
          rejectUpgrade(socket, 404, "Not Found");
          return;

        case "Forbidden.":
          rejectUpgrade(socket, 403, "Forbidden");
          return;

        case "Missing request URL.":
        case "Invalid request URL.":
        case "Missing 'token' query parameter.":
        case "Missing 'boardId' query parameter.":
          rejectUpgrade(socket, 400, "Bad Request");
          return;

        case "Missing access token.":
        case "Invalid or expired access token.":
          rejectUpgrade(socket, 401, "Unauthorized");
          return;
      }
    }

    rejectUpgrade(socket, 500, "Internal Server Error");
  }
}
