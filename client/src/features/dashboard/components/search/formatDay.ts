/**
 * Short relative label for a board's `updatedAt`.
 *
 * Recent items read as "today" / "yesterday" / "5 days ago"; anything older
 * falls back to a fixed date so the row stays narrow.
 */
export function formatDay(iso: string): string {
  const then = new Date(iso);

  if (Number.isNaN(then.getTime())) return "";

  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;

  return then.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
