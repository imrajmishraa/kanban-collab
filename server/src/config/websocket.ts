import { ENV } from "./env";

export const websocketConfig = Object.freeze({
  persistenceDebounceMs: 5_000,

  idleCleanupMs: 5 * 60 * 1_000,

  shutdownTimeoutMs: 10_000,

  redisChannelPrefix: "room:",

  heartbeat: {
    intervalMs: 30_000,
    timeoutMs: 10_000,
  },

  maxPayload: ENV.WS_MAX_PAYLOAD,

  perMessageDeflate: false,
} as const);
