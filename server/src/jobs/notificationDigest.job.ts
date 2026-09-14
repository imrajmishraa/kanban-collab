import { NotificationPreferenceModel } from "../infrastructure/db/mongoose/schemas";
import { notificationDigestJobLogger as log } from "../infrastructure/logging/childLogger";

export async function notificationDigestJob(): Promise<void> {
  const startedAt = Date.now();

  try {
    const eligibleUsers = await NotificationPreferenceModel.countDocuments({
      digestFrequency: { $in: ["daily", "weekly"] },
    });

    log.info(
      { eligibleUsers, durationMs: Date.now() - startedAt },
      "Digest job scanned users.",
    );

    const sent = 0;
    const skipped = 0;

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
