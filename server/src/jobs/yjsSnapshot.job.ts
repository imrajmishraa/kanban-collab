import { yjsSnapshotJobLogger as log } from "../infrastructure/logging/childLogger";
import { documentManager } from "../interfaces/websockets/collaboration/yjs/documentManager";
import { persistence } from "../interfaces/websockets/collaboration/persistence/mongoPersistence";
import { boardReconciler } from "../interfaces/websockets/collaboration/persistence/boardReconciler";

/**
 * Cron job: safety-net snapshot for active Yjs documents.
 *
 * The in-memory debounce (`YJS_SNAPSHOT_DEBOUNCE_MS`) already writes whenever
 * a document goes idle. This cron catches the edge cases:
 *   - Server crashed before the debounce fired
 *   - A document never went idle (continuous editing) — periodic flush
 *
 * Runs every 5 minutes. Safe to run when no documents are active.
 */
export async function yjsSnapshotJob(): Promise<void> {
  const startedAt = Date.now();

  try {
    const activeDocuments = documentManager.list();

    let snapshotted = 0;

    for (const managed of activeDocuments) {
      // Reuses the same upsert the debounced writer uses, so a snapshot and a
      // debounce write can never disagree about the persisted shape.
      await persistence.writeState(managed.name, managed.doc);

      // Also project the CRDT into the relational collections (T6).
      await boardReconciler.flush(managed.name, managed.doc);

      snapshotted += 1;
    }

    log.debug(
      {
        active: activeDocuments.length,
        snapshotted,
        durationMs: Date.now() - startedAt,
      },
      "Yjs snapshot job tick.",
    );
  } catch (error) {
    log.error(
      { err: error, durationMs: Date.now() - startedAt },
      "Yjs snapshot job failed.",
    );
    throw error;
  }
}
