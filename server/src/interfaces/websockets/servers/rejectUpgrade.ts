import type { Duplex } from "stream";

import { STATUS_CODES } from "http";

export function rejectUpgrade(socket: Duplex, statusCode: number): void {
  const reason = STATUS_CODES[statusCode] ?? "Unknown Error";

  try {
    if (socket.writable && !socket.destroyed) {
      socket.write(
        [
          `HTTP/1.1 ${statusCode} ${reason}`,
          "Connection: close",
          "Content-Length: 0",
          "",
          "",
        ].join("\r\n"),
      );
    }
  } finally {
    if (!socket.destroyed) {
      socket.destroy();
    }
  }
}
