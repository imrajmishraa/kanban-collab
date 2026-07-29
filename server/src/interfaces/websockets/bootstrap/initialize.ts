import { logger } from "../../../infrastructure/logging/logger";

import { heartbeatManager } from "../collaboration/heartbeat/heartbeatManager";
import { configurePersistence } from "../collaboration/persistence";

let initialized = false;

/**
 * Initializes all collaboration services.
 *
 * Safe to call multiple times.
 */
export function initializeCollaboration(): void {
  if (initialized) {
    logger.debug(
      "Collaboration infrastructure already initialized.",
    );

    return;
  }

  logger.info(
    "Initializing collaboration infrastructure...",
  );

  configurePersistence();
  heartbeatManager.start();
  initialized = true;

  logger.info(
    "Collaboration infrastructure initialized successfully.",
  );
}
