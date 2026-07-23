import mongoose from "mongoose";

import { ENV } from "./config/env";
import { connectDB } from "./infrastructure/db/mongoose/dbConnect";
import { logger } from "./infrastructure/logging/logger";
import { app } from "./interfaces/http/app";

let isShuttingDown = false;

mongoose.connection.on("disconnected", () => {
  if (isShuttingDown) {
    logger.info("MongoDB disconnected gracefully.");
  } else {
    logger.warn("MongoDB disconnected unexpectedly.");
  }
});

async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP server
    const server = app.listen(ENV.PORT, () => {
      logger.info(`🚀 Express REST Server running on port ${ENV.PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      if (isShuttingDown) return;

      isShuttingDown = true;
      logger.info(`${signal} received. Shutting down server...`);

      server.close(async (err) => {
        if (err) {
          logger.error({ err }, "Error while closing HTTP server");
          process.exit(1);
        }

        try {
          await mongoose.disconnect();
          logger.info("MongoDB connection closed.");
          logger.info("Server shutdown completed.");
          process.exit(0);
        } catch (err) {
          logger.error({ err }, "Error while disconnecting MongoDB");
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (err) {
    logger.fatal({ err }, "Failed to start server");
    process.exit(1);
  }
}

void startServer();
