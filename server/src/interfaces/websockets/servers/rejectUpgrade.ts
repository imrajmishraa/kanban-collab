import { Duplex } from "stream";


export function rejectUpgrade(
  socket: Duplex,
  statusCode: number,
  reason: string,
): void {
  if (socket.writable) {
    socket.write(
      `HTTP/1.1 ${statusCode} ${reason}\r\n` + "Connection: close\r\n" + "\r\n",
    );
  }

  socket.destroy();
}