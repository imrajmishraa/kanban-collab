/**
 * "2 min", not "2m".
 *
 * The inbox stamps each row with how long ago it arrived, in the smallest unit
 * that still says something useful. Single letters saved a few pixels and cost
 * the reader a beat every time — `2m` reads as metres or months before it reads
 * as minutes, and the column is monospaced, so the extra characters cost nothing
 * that the layout needs.
 *
 * Pure, with the clock injected, so the cases are testable rather than observed.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * `2 min`, not `2 mins`: an abbreviation does not take a plural. Days are a word,
 * so they do.
 */
function unit(count: number, singular: string, pluralForm = singular): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Human distance from `iso` to `now`, with the direction spelled out: "2 min ago"
 * rather than "2 min". The row is a log, and a bare unit reads as a duration
 * ("2 min") as often as it reads as a timestamp.
 *
 * Units, in order: `just now` under a minute, then minutes, hours and days. Days
 * are rounded rather than capped into weeks — "12 days" is more use in an inbox
 * than "1 week", and nothing here needs to be older than the 90-day TTL.
 */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();

  if (Number.isNaN(then)) return "";

  const diff = now.getTime() - then;

  /* A clock skew or a notification created a second in the future reads as
     "just now" rather than "-1 min". */
  if (diff < MINUTE) return "just now";

  const minutes = Math.round(diff / MINUTE);
  if (minutes < 60) return `${unit(minutes, "min")} ago`;

  const hours = Math.round(diff / HOUR);
  if (hours < 24) return `${unit(hours, "hr")} ago`;

  return `${unit(Math.round(diff / DAY), "day", "days")} ago`;
}
