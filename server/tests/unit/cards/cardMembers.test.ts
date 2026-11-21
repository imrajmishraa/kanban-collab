import { describe, expect, it } from "vitest";

import { unknownCardMembers } from "../../../src/application/cards/cardMembers";

/**
 * Assignees must be in the workspace.
 *
 * `members[]` accepted any `ObjectId` that parsed, so a card could be assigned to
 * a user from another workspace or to an id that never existed — an assignee
 * nobody could resolve, and a notification written for someone with no access.
 */

const MEMBERS = new Set(["u-1", "u-2", "u-3"]);

describe("unknownCardMembers", () => {
  it("returns nothing when every assignee is a member", () => {
    expect(unknownCardMembers(["u-1", "u-3"], MEMBERS)).toEqual([]);
  });

  it("returns the ids that are not", () => {
    expect(unknownCardMembers(["u-1", "outsider"], MEMBERS)).toEqual([
      "outsider",
    ]);
  });

  it("treats an empty request as fine", () => {
    expect(unknownCardMembers([], MEMBERS)).toEqual([]);
  });

  it("reports every unknown id, not just the first", () => {
    expect(unknownCardMembers(["a", "u-2", "b"], MEMBERS)).toEqual(["a", "b"]);
  });
});
