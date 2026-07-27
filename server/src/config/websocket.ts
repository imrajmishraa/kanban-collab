import { ENV } from "./env";

export const websocketConfig = Object.freeze({
  persistenceDebounceMs: 5_000,

  redisChannelPrefix: "room:",

  heartbeat: {
    intervalMs: 30_000,
    timeoutMs: 10_000,
  },

  maxPayload: ENV.WS_MAX_PAYLOAD,

  perMessageDeflate: false,
} as const);
