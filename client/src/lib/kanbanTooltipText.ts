import type { TooltipTone } from "@/components/Tooltips/types";

/**
 * What a Kanban tooltip says, and in which tone.
 *
 * The words are the product decision, so they are here — pure, testable, and in one place —
 * rather than scattered through components. A due date that says "2 days" in one card and
 * "in 2 days" in another is the kind of drift this prevents.
 */

export interface Copy {
  label: string;
  tone: TooltipTone;
}

const DAY = 24 * 60 * 60 * 1000;

/** Whole days between two dates, rounded down, in the reader's own time zone. */
export function daysUntil(
  due: Date | string | number,
  now: Date = new Date(),
): number {
  const target = new Date(due);
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  return Math.round((startOfDay(target) - startOfDay(now)) / DAY);
}

/**
 * A due date, said the way a person would say it.
 *
 * Overdue is the only one that earns `danger`: a task due tomorrow is not a failure, and a
 * red bubble on every card trains the reader to ignore red.
 */
export function dueDateCopy(
  due: Date | string | number,
  now: Date = new Date(),
): Copy {
  const days = daysUntil(due, now);

  if (days < -1)
    return { label: `Overdue by ${Math.abs(days)} days`, tone: "danger" };
  if (days === -1) return { label: "Overdue by a day", tone: "danger" };
  if (days === 0) return { label: "Due today", tone: "warning" };
  if (days === 1) return { label: "Due tomorrow", tone: "warning" };
  if (days <= 7) return { label: `Due in ${days} days`, tone: "neutral" };

  return { label: `Due in ${Math.ceil(days / 7)} weeks`, tone: "neutral" };
}

export type SyncState = "saving" | "saved" | "offline" | "error";

/**
 * Sync status. `saving` is a spinner, `saved` closes itself, and `offline` is the only one
 * that is allowed to worry the reader.
 */
export function syncCopy(
  state: SyncState,
  savedAt?: Date | string | number,
  now: Date = new Date(),
): Copy & { loading: boolean; autoHide?: number } {
  if (state === "saving")
    return { label: "Saving…", tone: "neutral", loading: true };
  if (state === "offline")
    return {
      label: "Offline — changes are queued",
      tone: "warning",
      loading: false,
    };
  if (state === "error")
    return {
      label: "Could not save — retrying",
      tone: "danger",
      loading: false,
    };

  if (savedAt === undefined) {
    return { label: "Saved", tone: "success", loading: false, autoHide: 2000 };
  }

  const seconds = Math.max(
    0,
    Math.round((now.getTime() - new Date(savedAt).getTime()) / 1000),
  );

  if (seconds < 5) {
    return {
      label: "Saved just now",
      tone: "success",
      loading: false,
      autoHide: 2000,
    };
  }
  if (seconds < 60) {
    return {
      label: `Saved ${seconds}s ago`,
      tone: "success",
      loading: false,
      autoHide: 2000,
    };
  }

  const minutes = Math.round(seconds / 60);
  return {
    label: `Saved ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`,
    tone: "success",
    loading: false,
    autoHide: 2000,
  };
}

/** A column's WIP limit: quiet until it is reached, and then it is a warning. */
export function wipCopy(count: number, limit: number): Copy {
  if (limit <= 0) return { label: `${count} cards`, tone: "neutral" };
  if (count > limit) {
    return {
      label: `${count}/${limit} cards — over the limit`,
      tone: "danger",
    };
  }
  if (count === limit) {
    return {
      label: `${count}/${limit} cards — limit reached`,
      tone: "warning",
    };
  }

  return { label: `${count}/${limit} cards`, tone: "neutral" };
}

/** Why a button is not available. Never "disabled" on its own — that explains nothing. */
export function disabledReasonCopy(reason: string): Copy {
  return { label: reason, tone: "neutral" };
}

/** What a destructive action will actually do, before it is done. */
export function destructiveCopy(
  action: string,
  detail: string,
): Copy & {
  description: string;
} {
  return { label: action, description: detail, tone: "danger" };
}
