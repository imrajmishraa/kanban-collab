import { WebSocketServer } from "ws";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { rejectUpgrade } from "./rejectUpgrade";
import { IncomingMessage } from "http";
import { Duplex } from "stream";

export async function handleUpgrade(
  request: IncomingMessage,
  socket: Duplex,
  head: Buffer,
  wss: WebSocketServer,
): Promise<void> {
  try {
    const { userId, boardId } = await authenticate(request);

    await authorize(userId, boardId);

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

        case "Missing access token.":
        case "Missing boardId.":
        case "Invalid or expired access token.":
          rejectUpgrade(socket, 401, "Unauthorized");
          return;
      }
    }

    rejectUpgrade(socket, 500, "Internal Server Error");
  }
}
