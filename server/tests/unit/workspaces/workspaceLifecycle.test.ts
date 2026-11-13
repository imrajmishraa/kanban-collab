import { describe, expect, it } from "vitest";

import {
  addDays,
  isWorkspaceWritable,
  transitionWorkspace,
  type WorkspaceLifecycleState,
} from "../../../src/application/workspaces/workspaceLifecycle";

const NOW = new Date("2026-11-13T10:00:00.000Z");

const active: WorkspaceLifecycleState = {
  status: "active",
  deletionRequestedAt: null,
  deletionScheduledFor: null,
};

const pending: WorkspaceLifecycleState = {
  status: "deletion_pending",
  deletionRequestedAt: new Date("2026-11-01T00:00:00.000Z"),
  deletionScheduledFor: new Date("2026-12-01T00:00:00.000Z"),
};

describe("transitionWorkspace — REQUEST_DELETION", () => {
  it("moves active → deletion_pending and schedules the default 30-day grace", () => {
    const result = transitionWorkspace(active, {
      type: "REQUEST_DELETION",
      now: NOW,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.from).toBe("active");
    expect(result.to).toBe("deletion_pending");
    expect(result.patch.status).toBe("deletion_pending");
    expect(result.patch.deletionRequestedAt).toEqual(NOW);
    expect(result.patch.deletionScheduledFor).toEqual(
      new Date("2026-12-13T10:00:00.000Z"),
    );
  });

  it("honours an explicit grace period", () => {
    const result = transitionWorkspace(active, {
      type: "REQUEST_DELETION",
      now: NOW,
      graceDays: 7,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.patch.deletionScheduledFor).toEqual(
      new Date("2026-11-20T10:00:00.000Z"),
    );
  });

  it("refuses to schedule an already-pending workspace", () => {
    const result = transitionWorkspace(pending, {
      type: "REQUEST_DELETION",
      now: NOW,
    });

    expect(result).toEqual({
      ok: false,
      from: "deletion_pending",
      reason: "already_pending_deletion",
    });
  });

  it("rejects a nonsense grace period instead of scheduling in the past", () => {
    for (const graceDays of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() =>
        transitionWorkspace(active, {
          type: "REQUEST_DELETION",
          now: NOW,
          graceDays,
        }),
      ).toThrow(/grace period/i);
    }
  });
});

describe("transitionWorkspace — CANCEL_DELETION", () => {
  it("moves deletion_pending → active and clears both dates", () => {
    const result = transitionWorkspace(pending, {
      type: "CANCEL_DELETION",
      now: NOW,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.to).toBe("active");
    expect(result.patch).toEqual({
      status: "active",
      deletionRequestedAt: null,
      deletionScheduledFor: null,
    });
  });

  it("refuses to cancel a workspace that is not pending", () => {
    const result = transitionWorkspace(active, {
      type: "CANCEL_DELETION",
      now: NOW,
    });

    expect(result).toEqual({
      ok: false,
      from: "active",
      reason: "not_pending_deletion",
    });
  });

  it("survives a delete → cancel → delete round trip", () => {
    const first = transitionWorkspace(active, {
      type: "REQUEST_DELETION",
      now: NOW,
    });
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const cancelled = transitionWorkspace(
      { ...active, ...first.patch },
      { type: "CANCEL_DELETION", now: NOW },
    );
    expect(cancelled.ok).toBe(true);
    if (!cancelled.ok) return;

    const later = new Date("2027-01-01T00:00:00.000Z");
    const second = transitionWorkspace(
      { ...active, ...cancelled.patch },
      { type: "REQUEST_DELETION", now: later },
    );

    expect(second.ok).toBe(true);
    if (!second.ok) return;

    // The new countdown starts from the new request, not the abandoned one.
    expect(second.patch.deletionRequestedAt).toEqual(later);
    expect(second.patch.deletionScheduledFor).toEqual(
      new Date("2027-01-31T00:00:00.000Z"),
    );
  });
});

describe("transitionWorkspace — PURGE", () => {
  it("refuses to purge an active workspace", () => {
    const result = transitionWorkspace(active, { type: "PURGE", now: NOW });

    expect(result).toEqual({
      ok: false,
      from: "active",
      reason: "not_pending_deletion",
    });
  });

  it("refuses to purge before the grace period elapses", () => {
    const result = transitionWorkspace(pending, {
      type: "PURGE",
      now: new Date("2026-11-30T23:59:59.000Z"),
    });

    expect(result).toEqual({
      ok: false,
      from: "deletion_pending",
      reason: "grace_not_elapsed",
    });
  });

  it("allows the purge exactly at the scheduled instant", () => {
    const result = transitionWorkspace(pending, {
      type: "PURGE",
      now: new Date("2026-12-01T00:00:00.000Z"),
    });

    expect(result.ok).toBe(true);
  });

  it("allows the purge after the scheduled instant", () => {
    const result = transitionWorkspace(pending, {
      type: "PURGE",
      now: new Date("2026-12-05T00:00:00.000Z"),
    });

    expect(result.ok).toBe(true);
  });

  it("never purges a pending workspace whose clock was never started", () => {
    const result = transitionWorkspace(
      {
        status: "deletion_pending",
        deletionRequestedAt: null,
        deletionScheduledFor: null,
      },
      { type: "PURGE", now: NOW },
    );

    expect(result).toEqual({
      ok: false,
      from: "deletion_pending",
      reason: "grace_not_elapsed",
    });
  });
});

describe("isWorkspaceWritable", () => {
  it("treats only an active workspace as writable", () => {
    expect(isWorkspaceWritable("active")).toBe(true);
    expect(isWorkspaceWritable("deletion_pending")).toBe(false);
  });
});

describe("addDays", () => {
  it("does not mutate the input date", () => {
    const from = new Date("2026-11-13T10:00:00.000Z");
    const next = addDays(from, 30);

    expect(from.toISOString()).toBe("2026-11-13T10:00:00.000Z");
    expect(next.toISOString()).toBe("2026-12-13T10:00:00.000Z");
  });
});
