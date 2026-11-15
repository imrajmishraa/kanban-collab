/**
 * The comment-vote state machine, as a table.
 *
 * A vote is a three-state value per (comment, user): none, like, dislike. The
 * handler used to keep this logic inline next to its database calls, which meant
 * the six legal transitions could only be exercised through HTTP with a live
 * database. Extracted here so every edge is testable, and so the deltas applied
 * to the denormalised counters on `Comment` are decided in one place.
 *
 *   none ──like──▶ like ──like──▶ none
 *    │              │  ▲
 *    │              │  └─dislike──┐
 *    └──dislike──▶ dislike ──like─┘
 */

export type VoteOp = "create" | "delete" | "update";

export interface VotePlan {
  /** What to do with the (comment, user) row. */
  op: VoteOp;
  /** Change to `Comment.likeCount`. */
  likeDelta: number;
  /** Change to `Comment.dislikeCount`. */
  dislikeDelta: number;
  /** The caller's vote after this press: 1, -1, or 0 for "no vote". */
  userAction: 1 | -1 | 0;
}

/**
 * Decide what a vote press does.
 *
 * Pure and total: every path returns all four values, so the handler never
 * needs a pre-initialised variable that a branch then overwrites. Three cases:
 * first vote, same vote again (toggle off), opposite vote (switch sides and
 * adjust both counters).
 */
export function planVote(
  existingAction: 1 | -1 | null,
  action: 1 | -1,
): VotePlan {
  if (existingAction === null) {
    return {
      op: "create",
      likeDelta: action === 1 ? 1 : 0,
      dislikeDelta: action === -1 ? 1 : 0,
      userAction: action,
    };
  }

  if (existingAction === action) {
    return {
      op: "delete",
      likeDelta: action === 1 ? -1 : 0,
      dislikeDelta: action === -1 ? -1 : 0,
      userAction: 0,
    };
  }

  return {
    op: "update",
    likeDelta: action === 1 ? 1 : -1,
    dislikeDelta: action === -1 ? 1 : -1,
    userAction: action,
  };
}
