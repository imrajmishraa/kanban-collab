import { yjsSnapshotJobLogger as log } from "../infrastructure/logging/childLogger";

/**
 * Cron job: safety-net snapshot for active Yjs documents.
 *
 * The in-memory debounce (`YJS_SNAPSHOT_DEBOUNCE_MS`) already writes whenever
 * a document goes idle. This cron catches the edge cases:
 *   - Server crashed before the debounce fired
 *   - A document never went idle (continuous editing) — periodic flush
 *
 * TODO:
 *   1. Get all ManagedDocuments from DocumentManager (active in memory)
 *   2. For each, encode Y.encodeStateAsUpdate(doc) → Buffer
 *   3. Upsert into YjsUpdateModel by docName
 *   4. Log snapshot count + duration
 *
 * Runs every 5 minutes. Safe to run when no documents are active.
 */
export async function yjsSnapshotJob(): Promise<void> {
  const startedAt = Date.now();

  try {
    // ── Stub ────────────────────────────────────────────────────────────────
    // Replace with:
    //   const activeDocs = documentManager.listActive();
    //   for (const doc of activeDocs) { await persistSnapshot(doc); }
    const snapshotted = 0;

    log.debug(
      { snapshotted, durationMs: Date.now() - startedAt },
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
