import pino from "pino";
import { ENV } from "../../config/env";


export const logger = pino({
  level: ENV.LOG_LEVEL || "info",
  transport:
    ENV.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});
