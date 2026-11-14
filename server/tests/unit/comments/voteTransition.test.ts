import { describe, expect, it } from "vitest";

import { planVote } from "../../../src/application/comments/voteTransition";

/**
 * The six legal edges of the comment-vote machine.
 *
 * none ──like──▶ like ──like──▶ none
 *  │              │  ▲
 *  │              │  └─dislike──┐
 *  └──dislike──▶ dislike ──like─┘
 */
describe("planVote — the six edges", () => {
  it("none → like", () => {
    expect(planVote(null, 1)).toEqual({
      op: "create",
      likeDelta: 1,
      dislikeDelta: 0,
      userAction: 1,
    });
  });

  it("none → dislike", () => {
    expect(planVote(null, -1)).toEqual({
      op: "create",
      likeDelta: 0,
      dislikeDelta: 1,
      userAction: -1,
    });
  });

  it("like → none (pressing like again toggles it off)", () => {
    expect(planVote(1, 1)).toEqual({
      op: "delete",
      likeDelta: -1,
      dislikeDelta: 0,
      userAction: 0,
    });
  });

  it("dislike → none (pressing dislike again toggles it off)", () => {
    expect(planVote(-1, -1)).toEqual({
      op: "delete",
      likeDelta: 0,
      dislikeDelta: -1,
      userAction: 0,
    });
  });

  it("like → dislike (switch sides, both counters move)", () => {
    expect(planVote(1, -1)).toEqual({
      op: "update",
      likeDelta: -1,
      dislikeDelta: 1,
      userAction: -1,
    });
  });

  it("dislike → like (switch back, both counters move)", () => {
    expect(planVote(-1, 1)).toEqual({
      op: "update",
      likeDelta: 1,
      dislikeDelta: -1,
      userAction: 1,
    });
  });
});

describe("planVote — invariants", () => {
  const actions = [1, -1] as const;
  const existing = [null, 1, -1] as const;

  it("never moves both counters in the same direction", () => {
    for (const current of existing) {
      for (const next of actions) {
        const plan = planVote(current, next);

        // A vote can add to one side and subtract from the other, or move a
        // single counter — never add to both (that would invent votes).
        expect(plan.likeDelta > 0 && plan.dislikeDelta > 0).toBe(false);
      }
    }
  });

  it("only ever removes a counter that was added before", () => {
    for (const current of existing) {
      for (const next of actions) {
        const plan = planVote(current, next);

        if (plan.likeDelta < 0) {
          expect(current).toBe(1);
        }
        if (plan.dislikeDelta < 0) {
          expect(current).toBe(-1);
        }
      }
    }
  });

  it("reports the vote the caller holds afterwards", () => {
    for (const current of existing) {
      for (const next of actions) {
        const plan = planVote(current, next);
        const expected = current === next ? 0 : next;

        expect(plan.userAction).toBe(expected);
      }
    }
  });

  it("keeps a toggled-off vote at zero net change over two presses", () => {
    for (const action of actions) {
      const first = planVote(null, action);
      const second = planVote(action, action);

      expect(first.likeDelta + second.likeDelta).toBe(0);
      expect(first.dislikeDelta + second.dislikeDelta).toBe(0);
    }
  });

  it("returns the right op for every edge", () => {
    expect(planVote(null, 1).op).toBe("create");
    expect(planVote(1, 1).op).toBe("delete");
    expect(planVote(1, -1).op).toBe("update");
  });
});
