/**
 * The read state of a notification, in one place.
 *
 * `isRead` and `readAt` are two fields describing one fact, and the fact has a
 * consequence: a TTL index deletes a notification 90 days after `readAt`, so
 * "read" also means "expires". When the two drift — `isRead: true` with
 * `readAt: null` — the notification shows as read forever and never expires, and
 * the TTL index cannot even see it because its partial filter is `isRead: true`.
 *
 * Every write path now goes through `applyReadState`, so the pair cannot be
 * written apart.
 */

export interface ReadState {
  isRead: boolean;
  readAt: Date | null;
}

/**
 * Normalise a read state so the two fields agree.
 *
 * Rules, in order:
 *   - `readAt` set        → read, and `readAt` is the timestamp of record
 *   - `isRead` true, no `readAt` → read; `readAt` is stamped with `now`
 *     (a legacy row, or a caller that only knew the flag)
 *   - `isRead` false      → unread; any stale `readAt` is cleared
 */
export function applyReadState(
  state: Partial<ReadState>,
  now: Date = new Date(),
): ReadState {
  if (state.readAt instanceof Date && !Number.isNaN(state.readAt.getTime())) {
    return { isRead: true, readAt: state.readAt };
  }

  if (state.isRead) {
    return { isRead: true, readAt: now };
  }

  return { isRead: false, readAt: null };
}

/**
 * True when the notification counts as read.
 *
 * `readAt` alone is enough — that is the field the TTL index watches — so a row
 * that somehow lost its flag still behaves correctly.
 */
export function isReadState(state: Partial<ReadState>): boolean {
  if (state.readAt instanceof Date && !Number.isNaN(state.readAt.getTime())) {
    return true;
  }

  return state.isRead === true;
}
