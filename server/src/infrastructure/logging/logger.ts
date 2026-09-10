import pino from "pino";
import { ENV } from "../../config/env";

const isDevelopment = ENV.NODE_ENV === "development";

// Choose destination: async file in production, pretty stdout in dev
const destination = isDevelopment
  ? pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
      },
    })
  : pino.destination({ dest: "/var/log/app.log", sync: false });

export const logger = pino(
  {
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
        "req.headers['set-cookie']",
        "*.password",
        "*.passwordHash",
        "*.token",
        "*.accessToken",
        "*.refreshToken",
        "*.secret",
        "*.apiKey",
        "*.creditCard",
        "*.cvv",
      ],
      censor: "[REDACTED]",
    },

    serializers: {
      err: (err) => ({
        ...pino.stdSerializers.err(err),
        code: err.code,
        status: err.status,
      }),
      req: (req) => ({
        method: req.method,
        url: req.url,
        headers: req.headers,
        remoteAddress: req.remoteAddress,
        params: req.params,
        query: req.query,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        headers: res.getHeaders(),
      }),
    },
  },
  destination,
);
