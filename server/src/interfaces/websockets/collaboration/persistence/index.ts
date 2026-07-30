import { setPersistence } from "y-websocket/bin/utils";

import { logger } from "../../../../infrastructure/logging/logger";

import { persistence } from "../persistence/mongoPersistence";
export type { DocumentPersistence } from "./documentPersistence";


let configured = false;

/**
 * Registers the application's Yjs persistence provider.
 * Safe to call multiple times.
 */
export function configurePersistence(): void {
  if (configured) {
    logger.warn("Yjs persistence has already been configured.");

    return;
  }

  setPersistence(persistence);

  configured = true;

  logger.info("Yjs persistence configured successfully.");
}
