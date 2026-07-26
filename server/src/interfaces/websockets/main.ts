import "dotenv/config";

import { ENV } from "../../config/env";
import { connectDB } from "../../infrastructure/db/mongoose/dbConnect";
import { logger } from "../../infrastructure/logging/logger";

import { configurePersistence } from "./persistence";
import { setupRedis } from "./persistence/redisSync";
import { startWebSocketServer } from "./servers/server";

async function bootstrap(): Promise<void> {
  logger.info("Starting WebSocket collaboration server...");

  try {
    // Initialize infrastructure
    await connectDB();
    await setupRedis();

    // Configure Yjs persistence
    configurePersistence();

    // Start WebSocket server
    await startWebSocketServer();

    logger.info(
      {
        port: ENV.WS_PORT,
        env: ENV.NODE_ENV,
      },
      "WebSocket collaboration server started successfully",
    );
  } catch (error: unknown) {
    logger.fatal(
      {
        err: error,
      },
      "Unable to bootstrap WebSocket server",
    );

    process.exit(1);
  }
}

void bootstrap();
