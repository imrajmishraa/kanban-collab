import { CardModel } from "../infrastructure/db/mongoose/schemas";
import { ENV } from "../config/env";
import { notificationDueReminderJobLogger as log } from "../infrastructure/logging/childLogger";

/**
 * Cron job: emit CARD_DUE_SOON notifications for cards approaching their due date.
 *
 * Runs every 15 minutes (configurable via NOTIF_DUE_REMINDER_CRON).
 *
 * TODO:
 *   1. Query cards where:
 *        dueDate between now and now + NOTIF_DUE_SOON_WINDOW_HOURS
 *        isArchived = false
 *        members[] not empty
 *   2. For each card, for each member:
 *        - build dedupeKey = `CARD_DUE_SOON:${cardId}:${userId}:${dueDateDate}`
 *        - call createNotification(...)  (dedupe handled by unique index)
 *   3. Log emitted / deduped counts
 *
 * Dedupe matters — this job runs 96× per day per card. Without the
 * dedupeKey unique index, users would drown in reminders.
 */
export async function notificationDueReminderJob(): Promise<void> {
  const startedAt = Date.now();

  try {
    const now = new Date();
    const windowEnd = new Date(
      now.getTime() + ENV.NOTIF_DUE_SOON_WINDOW_HOURS * 60 * 60 * 1000,
    );

    const candidates = await CardModel.find({
      isArchived: false,
      dueDate: { $gte: now, $lte: windowEnd },
      members: { $exists: true, $ne: [] },
    })
      .select("_id boardId workspaceId dueDate members title")
      .lean();

    log.info(
      {
        candidates: candidates.length,
        windowHours: ENV.NOTIF_DUE_SOON_WINDOW_HOURS,
        durationMs: Date.now() - startedAt,
      },
      "Due reminder job scanned cards.",
    );

    // ── Stub ────────────────────────────────────────────────────────────────
    // Replace with:
    //   for (const card of candidates) { await emitDueSoon(card, now); }
    const emitted = 0;
    const deduped = 0;

    log.info(
      { emitted, deduped, durationMs: Date.now() - startedAt },
      "Due reminder job completed.",
    );
  } catch (error) {
    log.error(
      { err: error, durationMs: Date.now() - startedAt },
      "Due reminder job failed.",
    );
    throw error;
  }
}
