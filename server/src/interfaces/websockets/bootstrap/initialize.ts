import { logger } from "../../../infrastructure/logging/logger";

import { heartbeatManager } from "../collaboration/heartbeat/heartbeatManager";
import { configurePersistence } from "../collaboration/persistence";
import { setupRedis } from "../collaboration/persistence/redisSync";

let initialized = false;

/**
 * Initializes all collaboration services.
 *
 * Safe to call multiple times.
 *
 * H-4: also connects the Redis pub/sub clients so collaboration is shared
 * across multiple server instances. `setupRedis` degrades gracefully to
 * local-only collaboration if Redis is unreachable (it logs a warning rather
 * than aborting boot), which is why this is awaited rather than fatal.
 */
export async function initializeCollaboration(): Promise<void> {
  if (initialized) {
    logger.debug("Collaboration infrastructure already initialized.");

    return;
  }

  logger.info("Initializing collaboration infrastructure...");

  configurePersistence();
  heartbeatManager.start();
  await setupRedis();

  initialized = true;

  logger.info("Collaboration infrastructure initialized successfully.");
}
