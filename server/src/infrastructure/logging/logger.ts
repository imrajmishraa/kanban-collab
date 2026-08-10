import pino from "pino";

import { ENV } from "../../config/env";

const isDevelopment = ENV.NODE_ENV === "development";

export const logger = pino({
  level: ENV.LOG_LEVEL,

  base: {
    service: "kanban-collaboration-server",
    environment: ENV.NODE_ENV,
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "authorization",
      "cookie",
      "password",
      "passwordHash",
      "accessToken",
      "refreshToken",
      "token",
    ],
    censor: "[REDACTED]",
  },

  serializers: {
    err: pino.stdSerializers.err,
  },

  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          singleLine: false,
        },
      }
    : undefined,
});
