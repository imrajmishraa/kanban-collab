// server/src/shared/constants/websocket.ts

/**
 * WebSocket close codes.
 *
 * - 1000–1015  : defined by RFC 6455 and extensions (IETF)
 * - 4000–4999  : reserved for application use (never sent by libraries)
 *
 * Reference: https://www.rfc-editor.org/rfc/rfc6455#section-7.4.1
 */
export const WS_CLOSE_CODE = {
  // ══════════════════════════════════════════════════════════════════════════
  // RFC 6455 — Standard codes
  // ══════════════════════════════════════════════════════════════════════════

  /** Normal closure — endpoint finished its job. */
  NORMAL_CLOSURE: 1000,

  /** Endpoint is going away — server restart, deploy, shutdown. */
  GOING_AWAY: 1001,

  /** Protocol error — peer violated the framing spec. */
  PROTOCOL_ERROR: 1002,

  /** Received a type of data it cannot accept (e.g. binary where text expected). */
  UNSUPPORTED_DATA: 1003,

  /**
   * No status code was actually present in the close frame.
   * Reserved — must NOT be sent over the wire; it's set locally by
   * `ws` / browser when no code was received.
   */
  NO_STATUS_RECEIVED: 1005,

  /**
   * Connection closed abnormally (no close frame was received).
   * Reserved — must NOT be sent over the wire.
   */
  ABNORMAL_CLOSURE: 1006,

  /** Data within a message was not consistent with its type (bad UTF-8 etc). */
  INVALID_PAYLOAD: 1007,

  /** Policy violation — generic application-level rejection. */
  POLICY_VIOLATION: 1008,

  /** Message too big to process. */
  MESSAGE_TOO_BIG: 1009,

  /** Client expected an extension the server didn't negotiate. */
  MANDATORY_EXTENSION: 1010,

  /** Server encountered an unexpected condition. */
  INTERNAL_ERROR: 1011,

  /** Server is restarting — client should reconnect after a delay. */
  SERVICE_RESTART: 1012,

  /** Server is overloaded — client should try again later. */
  TRY_AGAIN_LATER: 1013,

  /** Server acting as gateway received an invalid response from upstream. */
  BAD_GATEWAY: 1014,

  /** TLS handshake failed (typically only seen by browsers). */
  TLS_HANDSHAKE_FAILED: 1015,

  // ══════════════════════════════════════════════════════════════════════════
  // Application-specific (4000–4999)
  // Aligned with ERROR_MESSAGE entries where possible.
  // ══════════════════════════════════════════════════════════════════════════

  /** Missing or invalid credentials during the upgrade handshake. */
  UNAUTHORIZED: 4001,

  /** Authenticated but not allowed to join this board / channel. */
  FORBIDDEN: 4003,

  /** Session tied to this socket has expired or been revoked. */
  SESSION_EXPIRED: 4004,

  /** Missed heartbeat threshold — connection considered dead. */
  HEARTBEAT_TIMEOUT: 4005,

  /** Client exceeded the per-socket message rate limit. */
  RATE_LIMITED: 4008,

  /** Frame exceeded WS_MAX_PAYLOAD. */
  MESSAGE_TOO_LARGE: 4009,

  /** Message failed schema / shape validation. */
  INVALID_MESSAGE: 4010,

  /** Requested Yjs document (board) was not found. */
  DOC_NOT_FOUND: 4011,

  /** MessageHandler could not route the incoming frame. */
  UNROUTABLE_MESSAGE: 4012,

  /** Yjs sync update failed to apply. */
  SYNC_FAILED: 4013,

  /** Awareness payload was malformed or out of date. */
  AWARENESS_INVALID: 4014,

  /** Server reached the max concurrent connections for this user. */
  CONNECTION_LIMIT_REACHED: 4029,

  /** Server is shutting down gracefully — client should reconnect elsewhere. */
  SERVER_SHUTDOWN: 4050,
} as const;

export type WsCloseCode = (typeof WS_CLOSE_CODE)[keyof typeof WS_CLOSE_CODE];

/**
 * Reserved codes that must NEVER be sent over the wire.
 * Passing these to `socket.close(code)` throws in `ws` and is silently
 * rewritten to 1000 by browsers.
 */
export const WS_RESERVED_CLOSE_CODES = [
  WS_CLOSE_CODE.NO_STATUS_RECEIVED,
  WS_CLOSE_CODE.ABNORMAL_CLOSURE,
  WS_CLOSE_CODE.TLS_HANDSHAKE_FAILED,
] as const;

/**
 * Human-readable reason strings — passed as the second arg to `socket.close()`.
 * Browsers surface these as `event.reason` in the client `close` handler.
 */
export const WS_CLOSE_REASON: Record<WsCloseCode, string> = {
  [WS_CLOSE_CODE.NORMAL_CLOSURE]: "Normal closure",
  [WS_CLOSE_CODE.GOING_AWAY]: "Server going away",
  [WS_CLOSE_CODE.PROTOCOL_ERROR]: "Protocol error",
  [WS_CLOSE_CODE.UNSUPPORTED_DATA]: "Unsupported data",
  [WS_CLOSE_CODE.NO_STATUS_RECEIVED]: "No status received",
  [WS_CLOSE_CODE.ABNORMAL_CLOSURE]: "Abnormal closure",
  [WS_CLOSE_CODE.INVALID_PAYLOAD]: "Invalid payload",
  [WS_CLOSE_CODE.POLICY_VIOLATION]: "Policy violation",
  [WS_CLOSE_CODE.MESSAGE_TOO_BIG]: "Message too big",
  [WS_CLOSE_CODE.MANDATORY_EXTENSION]: "Mandatory extension missing",
  [WS_CLOSE_CODE.INTERNAL_ERROR]: "Internal server error",
  [WS_CLOSE_CODE.SERVICE_RESTART]: "Service restarting",
  [WS_CLOSE_CODE.TRY_AGAIN_LATER]: "Try again later",
  [WS_CLOSE_CODE.BAD_GATEWAY]: "Bad gateway",
  [WS_CLOSE_CODE.TLS_HANDSHAKE_FAILED]: "TLS handshake failed",

  [WS_CLOSE_CODE.UNAUTHORIZED]: "Unauthorized",
  [WS_CLOSE_CODE.FORBIDDEN]: "Forbidden",
  [WS_CLOSE_CODE.SESSION_EXPIRED]: "Session expired — reconnect required",
  [WS_CLOSE_CODE.HEARTBEAT_TIMEOUT]: "Heartbeat timeout",
  [WS_CLOSE_CODE.RATE_LIMITED]: "Rate limited",
  [WS_CLOSE_CODE.MESSAGE_TOO_LARGE]: "Message exceeds size limit",
  [WS_CLOSE_CODE.INVALID_MESSAGE]: "Invalid message",
  [WS_CLOSE_CODE.DOC_NOT_FOUND]: "Collaboration document not found",
  [WS_CLOSE_CODE.UNROUTABLE_MESSAGE]: "Unroutable message",
  [WS_CLOSE_CODE.SYNC_FAILED]: "Sync failed",
  [WS_CLOSE_CODE.AWARENESS_INVALID]: "Invalid awareness update",
  [WS_CLOSE_CODE.CONNECTION_LIMIT_REACHED]: "Connection limit reached",
  [WS_CLOSE_CODE.SERVER_SHUTDOWN]: "Server shutting down",
};
