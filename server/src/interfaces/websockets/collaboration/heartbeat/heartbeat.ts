import type WebSocket from "ws";

export const HEARTBEAT = Object.freeze({
  ALIVE: true,
  DEAD: false,
} as const);

export interface HeartbeatConnection extends WebSocket {
  isAlive: boolean;
  lastPingAt?: number;
  lastPongAt?: number;
}

// Marks a connection as alive after receiving a pong.
export function markAlive(
  socket: HeartbeatConnection,
): void {
  socket.isAlive = HEARTBEAT.ALIVE;
  socket.lastPongAt = Date.now();
}

// Marks a connection as awaiting a pong response.
export function markWaiting(
  socket: HeartbeatConnection,
): void {
  socket.isAlive = HEARTBEAT.DEAD;
  socket.lastPingAt = Date.now();
}

// Returns true if the connection responded to the last ping.
export function isAlive(
  socket: HeartbeatConnection,
): boolean {
  return socket.isAlive === HEARTBEAT.ALIVE;
}

/**
 * Calculates the latest heartbeat round-trip time.
 *
 * Returns:
 *  - latency in milliseconds
 *  - null if insufficient data exists
 */
export function getLatency(
  socket: HeartbeatConnection,
): number | null {
  if (
    socket.lastPingAt === undefined ||
    socket.lastPongAt === undefined
  ) {
    return null;
  }

  return socket.lastPongAt - socket.lastPingAt;
}

//  Returns the last successful heartbeat timestamp.
export function getLastSeen(
  socket: HeartbeatConnection,
): Date | null {
  if (socket.lastPongAt === undefined) {
    return null;
  }

  return new Date(socket.lastPongAt);
}

// Initializes heartbeat metadata for a newly connected socket.
export function initializeHeartbeat(
  socket: HeartbeatConnection,
): void {
  socket.isAlive = HEARTBEAT.ALIVE;

  const now = Date.now();

  socket.lastPingAt = now;
  socket.lastPongAt = now;
}
