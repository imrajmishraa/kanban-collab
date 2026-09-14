import { permanentlyDeleteWorkspace } from "../application/workspaces/permanentlyDeleteWorkspace";
import { WorkspaceModel } from "../infrastructure/db/mongoose/schemas";
import { workspaceCleanupJobLogger as log } from "../infrastructure/logging/childLogger";

/** Max workspaces processed per tick — prevents OOM on large backlogs. */
const BATCH_SIZE = 200;

/** Max concurrent deletions per batch — balances speed vs. DB pressure. */
const CONCURRENCY = 10;

/**
 * Cron job: permanently delete workspaces whose grace period has elapsed.
 *
 * - Runs hourly (see `WORKSPACE_CLEANUP_CRON` in env)
 * - Processes in batches with bounded concurrency
 * - Isolates failures — one bad workspace does NOT abort the whole run
 * - Emits structured metrics (scanned / deleted / failed / durationMs)
 */
export async function workspaceDeletionJob(): Promise<void> {
  const startedAt = Date.now();

  log.info("Workspace deletion job started.");

  let scanned = 0;
  let deleted = 0;
  let failed = 0;

  try {
    // Process in batches until no more rows match.
    // Re-querying each iteration avoids loading everything into memory.
    while (true) {
      const batch = await WorkspaceModel.find({
        status: "deletion_pending",
        deletionScheduledFor: { $lte: new Date() },
      })
        .select("_id") // projection — only need the ID
        .limit(BATCH_SIZE)
        .lean();

      if (batch.length === 0) break;

      scanned += batch.length;

      // Process the batch with bounded concurrency
      const results = await runWithConcurrency(
        batch.map((w) => w._id.toString()),
        CONCURRENCY,
        async (workspaceId) => {
          try {
            await permanentlyDeleteWorkspace(workspaceId);
            log.info({ workspaceId }, "Workspace permanently deleted.");
            return { ok: true as const, workspaceId };
          } catch (error) {
            log.error(
              { err: error, workspaceId },
              "Failed to delete workspace — will retry next run.",
            );
            return { ok: false as const, workspaceId };
          }
        },
      );

      for (const r of results) {
        if (r.ok) deleted++;
        else failed++;
      }

      // If the batch deleted fewer rows than we saw (some failures),
      // we still continue. The remaining failures will be retried on
      // the next run. To avoid an infinite loop, only break if this
      // batch returned zero successes AND zero failures — i.e. nothing
      // actually happened. Otherwise, keep draining.
      if (results.every((r) => !r.ok)) {
        log.warn(
          { batchSize: batch.length },
          "Entire batch failed — stopping this run to avoid infinite loop.",
        );
        break;
      }
    }

    log.info(
      {
        scanned,
        deleted,
        failed,
        durationMs: Date.now() - startedAt,
      },
      "Workspace deletion job completed.",
    );
  } catch (error) {
    log.error(
      {
        err: error,
        scanned,
        deleted,
        failed,
        durationMs: Date.now() - startedAt,
      },
      "Workspace deletion job crashed.",
    );

    // Rethrow so the scheduler logs it at its level too.
    throw error;
  }
}


// HELPERS

/**
 * Run `worker` over `items` with at most `limit` concurrent executions.
 * Preserves input order in the returned results array.
 */
async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function run(): Promise<void> {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;

      const item = items[i] as T;
      results[i] = await worker(item);
    }
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, run);
  await Promise.all(runners);

  return results;
}
