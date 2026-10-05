import {
  NotificationModel,
  NotificationPreferenceModel,
} from "../infrastructure/db/mongoose/schemas";
import { ENV } from "../config/env";
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
 * so the digest is emitted to the delivery log — swap the `emitDigest` body
 * for the real transport when one exists. The selection logic here is the
 * part that was missing.
 */
export async function notificationDigestJob(): Promise<void> {
  const startedAt = Date.now();

  try {
    const eligible = await NotificationPreferenceModel.find({
      digestFrequency: { $in: ["daily", "weekly"] },
    })
      .select("userId digestFrequency")
      .limit(ENV.NOTIF_BATCH_SIZE)
      .lean();

    log.info(
      { eligibleUsers: eligible.length, durationMs: Date.now() - startedAt },
      "Digest job scanned users.",
    );

    let sent = 0;
    let skipped = 0;

    for (const preference of eligible) {
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
      { sent, skipped, durationMs: Date.now() - startedAt },
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
