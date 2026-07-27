import mongoose from "mongoose";
import http from "http";

import { ENV } from "./config/env";
import { connectDB } from "./infrastructure/db/mongoose/dbConnect";
import { logger } from "./infrastructure/logging/logger";
import { app } from "./interfaces/http/app";

import {
  startWebSocketServer,
  stopWebSocketServer,
} from "./interfaces/websockets/servers/server";

let httpServer: ReturnType<typeof http.createServer>;

let isShuttingDown = false;

mongoose.connection.on("disconnected", () => {
  if (isShuttingDown) {
    logger.info("MongoDB disconnected gracefully.");
  } else {
    logger.warn("MongoDB disconnected unexpectedly.");
  }
});

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;

  isShuttingDown = true;

  logger.info({ signal }, "Graceful shutdown started");

  const timeout = setTimeout(() => {
    logger.fatal("Forced shutdown after timeout");

    process.exit(1);
  }, 10000);

  try {
    await stopWebSocketServer();

    if (httpServer) {
      await new Promise<void>((resolve) => {
        httpServer.close(() => {
          resolve();
        });
      });
    }

    await mongoose.disconnect();

    clearTimeout(timeout);

    logger.info("Shutdown completed");

    process.exit(0);
  } catch (error) {
    logger.fatal({ error }, "Shutdown failed");

    process.exit(1);
  }
}

async function startServer(): Promise<void> {
  try {
    await connectDB();

    httpServer = http.createServer(app);

    await startWebSocketServer(httpServer);

    httpServer.listen(ENV.PORT, () => {
      logger.info(
        {
          port: ENV.PORT,
          environment: ENV.NODE_ENV,
        },
        "Server started",
      );
    });
  } catch (error) {
    logger.fatal({ error }, "Server startup failed");

    process.exit(1);
  }
}

process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("SIGTERM", () => void shutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "Uncaught exception");

  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled rejection");

  process.exit(1);
});

void startServer();
