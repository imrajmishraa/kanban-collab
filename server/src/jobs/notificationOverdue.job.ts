import { CardModel } from "../infrastructure/db/mongoose/schemas";
import { ENV } from "../config/env";
import { notificationOverdueJobLogger as log } from "../infrastructure/logging/childLogger";
import { createNotification } from "../application/notifications/createNotification";

/**
 * Cron job: emit CARD_OVERDUE notifications for cards whose due date has passed.
 *
 * `CARD_OVERDUE` has been declared since the notification schema was written —
 * in `NOTIFICATION_TYPES`, in the default preferences (all channels on), in the
 * client's type union and in the preferences UI — but nothing ever produced one.
 * The due-soon job only looks *forward* from `now`, so the overdue half of the
 * feature was never written and the preference toggle could never fire.
 *
 * One notification per member per card per day, keyed by
 * `CARD_OVERDUE:<cardId>:<userId>:<YYYY-MM-DD>`. The unique index on
 * `{ userId, dedupeKey }` makes re-runs idempotent — without it an hourly job
 * would remind the same person 24 times a day about the same card.
 *
 * Overdue cards stay overdue forever, so the query is capped two ways: a batch
 * limit (as the due-soon job does) and a lookback window, so a card overdue by
 * six months does not notify every day until the end of time.
 */
export async function notificationOverdueJob(): Promise<void> {
  const startedAt = Date.now();

  try {
    const now = new Date();
    const windowStart = new Date(
      now.getTime() - ENV.NOTIF_OVERDUE_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );

    const candidates = await CardModel.find({
      isArchived: false,
      dueDate: { $lt: now, $gte: windowStart },
      members: { $exists: true, $ne: [] },
    })
      .select("_id boardId workspaceId dueDate members title")
      .limit(ENV.NOTIF_BATCH_SIZE)
      .lean();

    log.info(
      {
        candidates: candidates.length,
        windowDays: ENV.NOTIF_OVERDUE_WINDOW_DAYS,
        durationMs: Date.now() - startedAt,
      },
      "Overdue reminder job scanned cards.",
    );

    let emitted = 0;
    let deduped = 0;

    for (const card of candidates) {
      const dueDate = card.dueDate;
      const dueDateKey = dueDate
        ? dueDate.toISOString().slice(0, 10)
        : "unknown";
      const daysLate = dueDate
        ? Math.max(
            1,
            Math.floor(
              (now.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000),
            ),
          )
        : 0;

      for (const memberId of card.members) {
        const result = await createNotification({
          userId: memberId,
          type: "CARD_OVERDUE",
          title: "A card is overdue",
          message: `“${card.title}” was due ${
            dueDate ? `on ${dueDate.toISOString().slice(0, 10)}` : "earlier"
          }${daysLate > 0 ? ` (${daysLate} day${daysLate === 1 ? "" : "s"} ago)` : ""}.`,
          workspaceId: card.workspaceId,
          boardId: card.boardId,
          cardId: card._id,
          metadata: {
            cardTitle: card.title,
            dueDate: dueDate ?? null,
            daysLate,
          },
          dedupeKey: `CARD_OVERDUE:${card._id.toString()}:${memberId.toString()}:${dueDateKey}`,
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
      "Overdue reminder job completed.",
    );
  } catch (error) {
    log.error(
      { err: error, durationMs: Date.now() - startedAt },
      "Overdue reminder job failed.",
    );
    throw error;
  }
}
