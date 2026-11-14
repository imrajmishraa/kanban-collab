const DAY_MS = 24 * 60 * 60 * 1000;

export interface DeletionNotice {
  /** Whole days left, rounded up. Never negative. */
  daysLeft: number;
  /** True once the scheduled instant has passed. */
  due: boolean;
  /** Sentence for the banner. */
  label: string;
}

/**
 * Turn `deletionScheduledFor` into something a person can act on.
 *
 * Rounds **up**, so a workspace with 4 hours left reads "less than a day"
 * rather than "0 days" — a countdown that hits zero while the purge job has not
 * run yet would read as a bug.
 *
 * Returns null when there is no usable date, so a malformed or missing value
 * renders no banner instead of "Invalid Date".
 */
export function describeDeletion(
  scheduledFor: string | null | undefined,
  now: Date = new Date(),
): DeletionNotice | null {
  if (!scheduledFor) return null;

  const target = new Date(scheduledFor);
  const targetMs = target.getTime();

  if (Number.isNaN(targetMs)) return null;

  const remainingMs = targetMs - now.getTime();

  if (remainingMs <= 0) {
    return {
      daysLeft: 0,
      due: true,
      label:
        "The grace period has ended — this workspace is being removed and its boards, cards and notes go with it.",
    };
  }

  const daysLeft = Math.ceil(remainingMs / DAY_MS);

  return {
    daysLeft,
    due: false,
    label:
      daysLeft === 1
        ? "This workspace is scheduled for deletion in less than a day."
        : `This workspace is scheduled for deletion in ${daysLeft} days.`,
  };
}
