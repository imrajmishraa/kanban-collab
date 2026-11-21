import { describe, expect, it } from "vitest";

import {
  canManageWorkspaceContent,
  canWriteWorkspaceContent,
  type WorkspaceRole,
} from "./workspacePermissions";

/**
 * The client's mirror of the server's table.
 *
 * These are the only two questions the UI asks before it renders a control that
 * destroys something, so they are pinned here rather than trusted to the
 * component. `null` (role unknown — list still loading, or not a member) must
 * read as "no", because the safe direction for a delete control is to hide it.
 */

const ROLES: Array<WorkspaceRole | null> = [
  null,
  "guest",
  "member",
  "admin",
  "owner",
];

describe("canManageWorkspaceContent", () => {
  it("grants only owner and admin", () => {
    expect(canManageWorkspaceContent("owner")).toBe(true);
    expect(canManageWorkspaceContent("admin")).toBe(true);
  });

  it("refuses members, guests and an unknown role", () => {
    expect(canManageWorkspaceContent("member")).toBe(false);
    expect(canManageWorkspaceContent("guest")).toBe(false);
    expect(canManageWorkspaceContent(null)).toBe(false);
  });
});

describe("canWriteWorkspaceContent", () => {
  it("grants every full member", () => {
    expect(canWriteWorkspaceContent("owner")).toBe(true);
    expect(canWriteWorkspaceContent("admin")).toBe(true);
    expect(canWriteWorkspaceContent("member")).toBe(true);
  });

  it("refuses guests and an unknown role", () => {
    expect(canWriteWorkspaceContent("guest")).toBe(false);
    expect(canWriteWorkspaceContent(null)).toBe(false);
  });
});

describe("the two tiers nest", () => {
  it("keeps manage a subset of write", () => {
    for (const role of ROLES) {
      if (canManageWorkspaceContent(role)) {
        expect(canWriteWorkspaceContent(role)).toBe(true);
      }
    }
  });

  it("leaves exactly one role able to write but not manage", () => {
    const writers = ROLES.filter((role) => canWriteWorkspaceContent(role));
    const managers = ROLES.filter((role) => canManageWorkspaceContent(role));

    expect(writers.filter((role) => !managers.includes(role))).toEqual([
      "member",
    ]);
  });
});
