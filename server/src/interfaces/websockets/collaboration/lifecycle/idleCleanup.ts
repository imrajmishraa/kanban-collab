import { websocketLogger } from "../../../../infrastructure/logging/childLogger";

import { documentManager } from "../yjs/documentManager";

const DEFAULT_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

export class IdleCleanup {
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  private readonly idleTimeoutMs: number;

  constructor(idleTimeoutMs: number = DEFAULT_IDLE_TIMEOUT_MS) {
    if (!Number.isFinite(idleTimeoutMs) || idleTimeoutMs <= 0) {
      throw new Error("Idle cleanup timeout must be a positive finite number.");
    }

    this.idleTimeoutMs = idleTimeoutMs;
  }

  /**
   * Schedules cleanup for a document that currently
   * has no active clients.
   *
   * If a cleanup timer already exists, it is replaced.
   */
  public schedule(documentName: string): void {
    this.cancel(documentName);

    const document = documentManager.get(documentName);

    if (!document || document.destroyed) {
      return;
    }

    if (document.connectionCount > 0) {
      return;
    }

    const timer = setTimeout(() => {
      void this.cleanup(documentName);
    }, this.idleTimeoutMs);

    this.timers.set(documentName, timer);

    websocketLogger.debug(
      {
        documentName,
        idleTimeoutMs: this.idleTimeoutMs,
      },
      "Scheduled idle collaborative document cleanup.",
    );
  }

  /**
   * Cancels a pending cleanup.
   *
   * Called when a new client joins the document.
   */
  public cancel(documentName: string): void {
    const timer = this.timers.get(documentName);

    if (!timer) {
      return;
    }

    clearTimeout(timer);
    this.timers.delete(documentName);

    websocketLogger.debug(
      {
        documentName,
      },
      "Cancelled idle collaborative document cleanup.",
    );
  }

  /**
   * Checks whether a document currently has a
   * scheduled idle cleanup.
   */
  public isScheduled(documentName: string): boolean {
    return this.timers.has(documentName);
  }

  /**
   * Performs the actual idle cleanup.
   *
   * The document is checked again before destruction
   * because a client may have reconnected while the
   * timer was waiting.
   */
  private async cleanup(documentName: string): Promise<void> {
    this.timers.delete(documentName);

    const document = documentManager.get(documentName);

    if (!document || document.destroyed) {
      return;
    }

    if (document.connectionCount > 0) {
      websocketLogger.debug(
        {
          documentName,
          connections: document.connectionCount,
        },
        "Skipped idle document cleanup because clients reconnected.",
      );

      return;
    }

    websocketLogger.info(
      {
        documentName,
        idleTimeoutMs: this.idleTimeoutMs,
      },
      "Idle collaborative document cleanup started.",
    );

    const destroyed = await documentManager.destroy(documentName);

    if (!destroyed) {
      websocketLogger.error(
        {
          documentName,
        },
        "Failed to destroy idle collaborative document.",
      );

      return;
    }

    websocketLogger.info(
      {
        documentName,
      },
      "Idle collaborative document cleanup completed.",
    );
  }

  /**
   * Cancels every pending cleanup timer.
   *
   * Intended for graceful shutdown and testing.
   */
  public clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.timers.clear();

    websocketLogger.info("Idle collaborative document cleanup timers cleared.");
  }
}

export const idleCleanup = new IdleCleanup();
