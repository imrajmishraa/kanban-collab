// Path / subprotocol


/**
 * The single WS upgrade path. `handleUpgrade` must reject any upgrade
 * whose pathname !== WS_PATH — otherwise a stray client can hold an
 * unauthenticated socket open by hitting any URL.
 */
export const WS_PATH = "/ws" as const;

/**
 * Board-scoped upgrade path: `/ws/boards/:boardId`.
 * Keep this prefix in one place so parseRequest.ts and any future
 * router agree on the shape.
 */
export const WS_PATH_PREFIX = "/ws/boards/" as const;

/**
 * Subprotocol name used to smuggle the access token through the handshake.
 *
 * Browsers cannot set custom headers on `new WebSocket(...)`, so the only
 * ways to carry a bearer token are: cookie, query string, or subprotocol.
 * We standardize on subprotocol (it's the only one that doesn't leak the
 * token into server logs / browser history like `?token=` does).
 *
 * Wire format on the client:
 *   new WebSocket(url, [WS_AUTH_SUBPROTOCOL, token])
 * Server reads `Sec-WebSocket-Protocol: kanban.auth, <token>`.
 */
export const WS_AUTH_SUBPROTOCOL = "kanban.auth" as const;


// Close codes

/**
 * WebSocket close codes.
 *
 * - 1000–1015 : defined by RFC 6455 (IETF)
 * - 4000–4999 : reserved for application use (never sent by libraries)
 *
 * Reference: https://www.rfc-editor.org/rfc/rfc6455#section-7.4.1
 */
export const WS_CLOSE_CODE = {
  // ── RFC 6455 — standard codes ────────────────────────────────────────────
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
  PROTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  NO_STATUS_RECEIVED: 1005,
  ABNORMAL_CLOSURE: 1006,
  INVALID_PAYLOAD: 1007,
  POLICY_VIOLATION: 1008,
  MESSAGE_TOO_BIG: 1009,
  MANDATORY_EXTENSION: 1010,
  INTERNAL_ERROR: 1011,
  SERVICE_RESTART: 1012,
  TRY_AGAIN_LATER: 1013,
  BAD_GATEWAY: 1014,
  TLS_HANDSHAKE_FAILED: 1015,

  // ── Application-specific (4000–4999) ─────────────────────────────────────
  UNAUTHORIZED: 4001,
  FORBIDDEN: 4003,
  SESSION_EXPIRED: 4004,
  HEARTBEAT_TIMEOUT: 4005,
  RATE_LIMITED: 4008,
  MESSAGE_TOO_LARGE: 4009,
  INVALID_MESSAGE: 4010,
  DOC_NOT_FOUND: 4011,
  UNROUTABLE_MESSAGE: 4012,
  SYNC_FAILED: 4013,
  AWARENESS_INVALID: 4014,
  CONNECTION_LIMIT_REACHED: 4029,
  SERVER_SHUTDOWN: 4050,
} as const;

export type WsCloseCode = (typeof WS_CLOSE_CODE)[keyof typeof WS_CLOSE_CODE];

/**
 * RFC 6455 codes that MUST NOT be sent over the wire.
 *
 * `ws` throws if you pass these to `socket.close(code)`, and browsers
 * silently rewrite them to 1000. They only ever appear on the *inbound*
 * side (when the peer closed without a code, or the connection died).
 */
export const WS_RESERVED_CLOSE_CODES = [
  WS_CLOSE_CODE.NO_STATUS_RECEIVED,
  WS_CLOSE_CODE.ABNORMAL_CLOSURE,
  WS_CLOSE_CODE.TLS_HANDSHAKE_FAILED,
] as const;

export type WsReservedCloseCode = (typeof WS_RESERVED_CLOSE_CODES)[number];

/** Runtime guard — use before `socket.close(code)`. */
export function isReservedCloseCode(code: number): code is WsReservedCloseCode {
  return (WS_RESERVED_CLOSE_CODES as readonly number[]).includes(code);
}

/**
 * Human-readable reason strings — pass as the second arg to `socket.close()`.
 * Browsers surface these as `CloseEvent.reason` on the client.
 *
 * Typed as `Record<WsCloseCode, string>` so adding a code without a reason
 * is a compile error.
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

/** Safe lookup — never returns undefined for unknown numeric codes. */
export function closeReason(code: number): string {
  return WS_CLOSE_REASON[code as WsCloseCode] ?? "Unknown close reason";
}
