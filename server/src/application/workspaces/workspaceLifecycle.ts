/**
 * Workspace lifecycle — the explicit state machine.
 *
 * The workspace has always had two states (`active`, `deletion_pending`) and a
 * 30-day grace period, but the transitions were written inline in the delete
 * handler and nothing could ever move a workspace *back*. This module is the
 * single place that decides:
 *
 *   - which transitions exist
 *   - which are legal from the current state
 *   - what the new state (and its dates) looks like
 *
 * It is pure: no database, no clock, no logging. Callers pass `now` and apply
 * the returned `patch`. That is what makes the machine testable, and what makes
 * "the user deleted their workspace by accident" a recoverable state instead of
 * a 30-day countdown to data loss.
 *
 *   active ──REQUEST_DELETION──▶ deletion_pending ──PURGE──▶ (gone)
 *     ▲                                │
 *     └────────CANCEL_DELETION─────────┘
 */

import { WORKSPACE_DELETION_GRACE_PERIOD_DAYS } from "../../shared/constants/workspace";

export type WorkspaceStatus = "active" | "deletion_pending";

export interface WorkspaceLifecycleState {
  status: WorkspaceStatus;
  deletionRequestedAt: Date | null;
  deletionScheduledFor: Date | null;
}

/** Fields the machine may rewrite. `null` means "clear it". */
export interface WorkspaceLifecyclePatch {
  status: WorkspaceStatus;
  deletionRequestedAt: Date | null;
  deletionScheduledFor: Date | null;
}

export type WorkspaceEvent =
  | { type: "REQUEST_DELETION"; now: Date; graceDays?: number }
  | { type: "CANCEL_DELETION"; now: Date }
  | { type: "PURGE"; now: Date };

export type WorkspaceTransition =
  | {
      ok: true;
      from: WorkspaceStatus;
      to: WorkspaceStatus;
      patch: WorkspaceLifecyclePatch;
    }
  | {
      ok: false;
      from: WorkspaceStatus;
      reason:
        | "already_pending_deletion"
        | "not_pending_deletion"
        | "grace_not_elapsed";
    };

/** Adds whole days without mutating the input date. */
export function addDays(from: Date, days: number): Date {
  const next = new Date(from.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * True when the workspace may be edited.
 *
 * A workspace scheduled for deletion is read-only: everything in it is about to
 * be destroyed, and letting people keep writing into it silently discards their
 * work when the cron runs. Cancelling the deletion is the only write allowed.
 */
export function isWorkspaceWritable(status: WorkspaceStatus): boolean {
  return status === "active";
}

export function transitionWorkspace(
  state: WorkspaceLifecycleState,
  event: WorkspaceEvent,
): WorkspaceTransition {
  const from = state.status;

  switch (event.type) {
    case "REQUEST_DELETION": {
      if (from === "deletion_pending") {
        return { ok: false, from, reason: "already_pending_deletion" };
      }

      const graceDays = event.graceDays ?? WORKSPACE_DELETION_GRACE_PERIOD_DAYS;

      if (!Number.isFinite(graceDays) || graceDays <= 0) {
        throw new Error("Deletion grace period must be a positive number.");
      }

      return {
        ok: true,
        from,
        to: "deletion_pending",
        patch: {
          status: "deletion_pending",
          deletionRequestedAt: event.now,
          deletionScheduledFor: addDays(event.now, graceDays),
        },
      };
    }

    case "CANCEL_DELETION": {
      if (from === "active") {
        return { ok: false, from, reason: "not_pending_deletion" };
      }

      /* Back to a clean active workspace: the dates are cleared so a later
         delete request schedules from *that* moment, not from the old one. */
      return {
        ok: true,
        from,
        to: "active",
        patch: {
          status: "active",
          deletionRequestedAt: null,
          deletionScheduledFor: null,
        },
      };
    }

    case "PURGE": {
      if (from === "active") {
        return { ok: false, from, reason: "not_pending_deletion" };
      }

      if (!state.deletionScheduledFor) {
        /* Pending with no date is not a legal state; treat it as not-yet-due
           rather than deleting a workspace whose clock was never started. */
        return { ok: false, from, reason: "grace_not_elapsed" };
      }

      if (state.deletionScheduledFor.getTime() > event.now.getTime()) {
        return { ok: false, from, reason: "grace_not_elapsed" };
      }

      return {
        ok: true,
        from,
        to: "deletion_pending",
        patch: {
          status: "deletion_pending",
          deletionRequestedAt: state.deletionRequestedAt,
          deletionScheduledFor: state.deletionScheduledFor,
        },
      };
    }

    default: {
      const exhaustive: never = event;
      throw new Error(`Unhandled workspace event: ${String(exhaustive)}`);
    }
  }
}
