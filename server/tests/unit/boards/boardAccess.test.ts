import { describe, expect, it } from "vitest";

import {
  boardCapabilities,
  can,
  canManageBoard,
  canReadBoard,
  canWriteBoard,
  type BoardVisibility,
  type WorkspaceRole,
} from "../../../src/application/boards/boardAccess";

/**
 * The lattice, as a table.
 *
 * Before this module the rule was "is the caller a member?", which made
 * `public`, `workspace` and `private` identical for members and `admin`
 * identical to `member` everywhere. These tests pin the three axes apart so a
 * future edit has to change the table on purpose.
 */

const ROLES: Array<WorkspaceRole | null> = [
  null,
  "guest",
  "member",
  "admin",
  "owner",
];

const VISIBILITIES: BoardVisibility[] = ["private", "workspace", "public"];

describe("read", () => {
  it("lets anyone read a public board, member or not", () => {
    for (const role of ROLES) {
      expect(canReadBoard("public", role)).toBe(true);
    }
  });

  it("lets the whole workspace read a workspace board, guests included", () => {
    expect(canReadBoard("workspace", "guest")).toBe(true);
    expect(canReadBoard("workspace", "member")).toBe(true);
    expect(canReadBoard("workspace", "admin")).toBe(true);
    expect(canReadBoard("workspace", "owner")).toBe(true);
  });

  it("refuses a non-member for anything that is not public", () => {
    expect(canReadBoard("workspace", null)).toBe(false);
    expect(canReadBoard("private", null)).toBe(false);
  });

  it("keeps a private board away from guests", () => {
    // The WebSocket upgrade always refused this combination; the HTTP read
    // path did not. Now both ask this function.
    expect(canReadBoard("private", "guest")).toBe(false);
    expect(canReadBoard("private", "member")).toBe(true);
    expect(canReadBoard("private", "admin")).toBe(true);
    expect(canReadBoard("private", "owner")).toBe(true);
  });

  it("widens monotonically: private ⊆ workspace ⊆ public", () => {
    for (const role of ROLES) {
      if (canReadBoard("private", role)) {
        expect(canReadBoard("workspace", role)).toBe(true);
      }
      if (canReadBoard("workspace", role)) {
        expect(canReadBoard("public", role)).toBe(true);
      }
    }
  });
});

describe("write", () => {
  it("is role-only — visibility never widens it", () => {
    for (const role of ROLES) {
      const byVisibility = VISIBILITIES.map((visibility) =>
        can("write", visibility, role),
      );

      expect(new Set(byVisibility).size).toBe(1);
    }
  });

  it("lets every full member write", () => {
    expect(canWriteBoard("member")).toBe(true);
    expect(canWriteBoard("admin")).toBe(true);
    expect(canWriteBoard("owner")).toBe(true);
  });

  it("refuses guests and non-members", () => {
    expect(canWriteBoard("guest")).toBe(false);
    expect(canWriteBoard(null)).toBe(false);
  });
});

describe("manage", () => {
  it("is the difference between admin and member", () => {
    expect(canManageBoard("member")).toBe(false);
    expect(canManageBoard("admin")).toBe(true);
    expect(canManageBoard("owner")).toBe(true);
  });

  it("is never granted to guests or non-members", () => {
    expect(canManageBoard("guest")).toBe(false);
    expect(canManageBoard(null)).toBe(false);
  });

  it("is a subset of write", () => {
    for (const role of ROLES) {
      if (canManageBoard(role)) expect(canWriteBoard(role)).toBe(true);
    }
  });
});

describe("boardCapabilities", () => {
  it("describes a public guest as read-only", () => {
    expect(boardCapabilities("public", "guest")).toEqual(["read"]);
  });

  it("describes a member as read + write", () => {
    expect(boardCapabilities("workspace", "member")).toEqual(["read", "write"]);
  });

  it("describes an admin as everything", () => {
    expect(boardCapabilities("private", "admin")).toEqual([
      "read",
      "write",
      "manage",
    ]);
  });

  it("describes a stranger on a private board as nothing", () => {
    expect(boardCapabilities("private", null)).toEqual([]);
  });
});

describe("can()", () => {
  it("agrees with the three named predicates", () => {
    for (const visibility of VISIBILITIES) {
      for (const role of ROLES) {
        expect(can("read", visibility, role)).toBe(
          canReadBoard(visibility, role),
        );
        expect(can("write", visibility, role)).toBe(canWriteBoard(role));
        expect(can("manage", visibility, role)).toBe(canManageBoard(role));
      }
    }
  });
});
