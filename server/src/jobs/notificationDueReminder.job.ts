import { CardModel } from "../infrastructure/db/mongoose/schemas";
import { ENV } from "../config/env";
import { notificationDueReminderJobLogger as log } from "../infrastructure/logging/childLogger";
import { createNotification } from "../application/notifications/createNotification";

/**
 * Cron job: emit CARD_DUE_SOON notifications for cards approaching their due date.
 *
 * Runs every 15 minutes (configurable via NOTIF_DUE_REMINDER_CRON).
 *
 * For each candidate card, every assigned member gets one notification per
 * day, keyed by `CARD_DUE_SOON:<cardId>:<userId>:<YYYY-MM-DD>`. The unique
 * index on `{ userId, dedupeKey }` makes re-runs idempotent — without it this
 * job (96 runs/day) would flood users with duplicate reminders.
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
      .limit(ENV.NOTIF_BATCH_SIZE)
      .lean();

    log.info(
      {
        candidates: candidates.length,
        windowHours: ENV.NOTIF_DUE_SOON_WINDOW_HOURS,
        durationMs: Date.now() - startedAt,
      },
      "Due reminder job scanned cards.",
    );

    let emitted = 0;
    let deduped = 0;

    for (const card of candidates) {
      const dueDate = card.dueDate;
      const dueDateKey = dueDate
        ? dueDate.toISOString().slice(0, 10)
        : "unknown";

      for (const memberId of card.members) {
        const result = await createNotification({
          userId: memberId,
          type: "CARD_DUE_SOON",
          title: "A card is due soon",
          message: `“${card.title}” is due ${
            dueDate ? `on ${dueDate.toISOString().slice(0, 10)}` : "soon"
          }.`,
          workspaceId: card.workspaceId,
          boardId: card.boardId,
          cardId: card._id,
          metadata: {
            cardTitle: card.title,
            dueDate: dueDate ?? null,
          },
          dedupeKey: `CARD_DUE_SOON:${card._id.toString()}:${memberId.toString()}:${dueDateKey}`,
        });

        if (result.created) {
          emitted += 1;
        } else {
          deduped += 1;
        }
      }
    }

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
