import { ENV } from "../../config/env";

export const websocketConfig = Object.freeze({
  persistenceDebounceMs: 5000,
  redisChannelPrefix: "room:",
  heartbeat: {
    intervalMs: 30000,
    timeoutMs: 10000,
  },
  maxPayload: ENV.WS_MAX_PAYLOAD,
  perMessageDeflate: false,
} as const);
