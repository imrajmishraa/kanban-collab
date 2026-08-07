import http from "http";
import mongoose from "mongoose";

import { ENV } from "./config/env";
import { connectDB } from "./infrastructure/db/mongoose/dbConnect";
import { logger } from "./infrastructure/logging/logger";
import { app } from "./interfaces/http/app";

import {
  startWebSocketServer,
  stopWebSocketServer,
} from "./interfaces/websockets/server/server";
import { startCronJobs } from "./infrastructure/scheduler/cron";

let httpServer: http.Server | null = null;

let shuttingDown = false;

/**
 * Starts the complete backend.
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info("Starting Kanban Collaboration Server...");

    /*
     * Database
     */
    await connectDB();

    /*
     * Cron job setup
     */
    startCronJobs();

    /*
     * HTTP Server
     */
    httpServer = http.createServer(app);

    /*
     * WebSocket Server
     */
    await startWebSocketServer(httpServer);

    /*
     * Start listening
     */
    await new Promise<void>((resolve, reject) => {
      httpServer!.once("error", reject);

      httpServer!.listen(ENV.PORT, () => {
        httpServer!.off("error", reject);

        logger.info(
          {
            port: ENV.PORT,
            environment: ENV.NODE_ENV,
          },
          "HTTP & WebSocket server started successfully.",
        );

        resolve();
      });
    });
  } catch (error) {
    logger.fatal(
      {
        err: error,
      },
      "Application bootstrap failed.",
    );

    process.exit(1);
  }
}

/**
 * Gracefully shuts down the application.
 */
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  logger.info(
    {
      signal,
    },
    "Graceful shutdown initiated.",
  );

  try {
    /*
     * Stop WebSocket server and collaboration infrastructure.
     */
    await stopWebSocketServer();

    /*
     * Stop HTTP server.
     */
    if (httpServer) {
      await new Promise<void>((resolve, reject) => {
        httpServer!.close((err?: Error) => {
          if (err) {
            reject(err);

            return;
          }

          resolve();
        });
      });

      logger.info("HTTP server stopped.");
    }

    /*
     * Disconnect MongoDB.
     */
    await mongoose.disconnect();

    logger.info("MongoDB disconnected.");

    logger.info("Shutdown completed successfully.");

    process.exit(0);
  } catch (error) {
    logger.fatal(
      {
        err: error,
      },
      "Shutdown failed.",
    );

    process.exit(1);
  }
}

/*
|--------------------------------------------------------------------------
| MongoDB Events
|--------------------------------------------------------------------------
*/

mongoose.connection.on("connected", () => {
  logger.info("MongoDB connected.");
});

mongoose.connection.on("disconnected", () => {
  if (shuttingDown) {
    logger.info("MongoDB disconnected gracefully.");
  } else {
    logger.warn("MongoDB disconnected unexpectedly.");
  }
});

mongoose.connection.on("error", (error) => {
  logger.error(
    {
      err: error,
    },
    "MongoDB connection error.",
  );
});

/*
|--------------------------------------------------------------------------
| Process Events
|--------------------------------------------------------------------------
*/

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("uncaughtException", (error) => {
  logger.fatal(
    {
      err: error,
    },
    "Uncaught exception.",
  );

  void shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  logger.fatal(
    {
      reason,
    },
    "Unhandled promise rejection.",
  );

  void shutdown("unhandledRejection");
});

/*
|--------------------------------------------------------------------------
| Application Entry
|--------------------------------------------------------------------------
*/

void bootstrap();
