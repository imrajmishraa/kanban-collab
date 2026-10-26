import {
  NotificationModel,
  NotificationPreferenceModel,
} from "../infrastructure/db/mongoose/schemas";
import { notificationDigestJobLogger as log } from "../infrastructure/logging/childLogger";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Cron job: build per-user notification digests for users who opted in
 * (`digestFrequency` of `daily` or `weekly`).
 *
 * Runs daily (configurable via NOTIF_DIGEST_CRON). For each eligible user we
 * gather their unread notifications in the digest window and emit a summary.
 *
 * Delivery note: there is no email/push transport wired into the server yet,
 * so the digest is emitted to the delivery log — swap the `log.info` body for
 * the real transport when one exists. The selection logic here is the part
 * that was missing.
 */
export async function notificationDigestJob(): Promise<void> {
  const startedAt = Date.now();

  try {
    let sent = 0;
    let skipped = 0;
    let scanned = 0;

    // H-6: iterate every eligible user with a cursor. The previous `.limit()`
    // silently capped delivery to the first N users, so everyone past the cap
    // never received a digest.
    const cursor = NotificationPreferenceModel.find({
      digestFrequency: { $in: ["daily", "weekly"] },
    })
      .select("userId digestFrequency")
      .cursor();

    for await (const preference of cursor) {
      scanned += 1;

      const windowDays = preference.digestFrequency === "weekly" ? 7 : 1;
      const since = new Date(Date.now() - windowDays * DAY_MS);

      const notifications = await NotificationModel.find({
        userId: preference.userId,
        isRead: false,
        createdAt: { $gte: since },
      })
        .sort({ createdAt: -1 })
        .select("type title message createdAt")
        .lean();

      if (notifications.length === 0) {
        skipped += 1;
        continue;
      }

      // ── Delivery seam ────────────────────────────────────────────────
      // Replace this log with the real email/push send when a transport
      // is available. The payload below is what a digest would contain.
      log.info(
        {
          userId: preference.userId,
          frequency: preference.digestFrequency,
          windowDays,
          count: notifications.length,
          digest: notifications.map((n) => ({
            type: n.type,
            title: n.title,
            message: n.message,
            createdAt: n.createdAt,
          })),
        },
        "Digest prepared for delivery.",
      );

      sent += 1;
    }

    log.info(
      { scanned, sent, skipped, durationMs: Date.now() - startedAt },
      "Digest job completed.",
    );
  } catch (error) {
    log.error(
      { err: error, durationMs: Date.now() - startedAt },
      "Digest job failed.",
    );
    throw error;
  }
}
