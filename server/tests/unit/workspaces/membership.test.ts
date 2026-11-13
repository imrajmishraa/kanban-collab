import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findOne: vi.fn(),
  findById: vi.fn(),
  select: vi.fn(),
  lean: vi.fn(),
}));

vi.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  WorkspaceModel: {
    findOne: mocks.findOne,
    findById: mocks.findById,
  },
}));

import {
  assertWorkspaceWritable,
  loadActiveMembership,
  loadWriterMembership,
} from "../../../src/application/workspaces/membership";

const workspaceId = new Types.ObjectId();
const userId = new Types.ObjectId().toString();
const otherUserId = new Types.ObjectId();

function membershipRow(
  role: "owner" | "admin" | "member" | "guest" = "member",
  status: "active" | "deletion_pending" = "active",
) {
  return {
    _id: workspaceId,
    status,
    members: [{ userId: new Types.ObjectId(userId), role }],
  };
}

describe("loadActiveMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findOne.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ lean: mocks.lean });
  });

  it("returns the caller's membership of an active workspace", async () => {
    mocks.lean.mockResolvedValue(membershipRow("admin"));

    const result = await loadActiveMembership(workspaceId, userId);

    expect(result.member.role).toBe("admin");
    expect(result.workspace.status).toBe("active");
    expect(mocks.findOne).toHaveBeenCalledWith({
      _id: workspaceId,
      "members.userId": new Types.ObjectId(userId),
    });
  });

  it("selects only what it needs by default", async () => {
    mocks.lean.mockResolvedValue(membershipRow());

    await loadActiveMembership(workspaceId, userId);

    expect(mocks.select).toHaveBeenCalledWith("members status");
  });

  it("refuses a workspace scheduled for deletion", async () => {
    mocks.lean.mockResolvedValue(membershipRow("owner", "deletion_pending"));

    await expect(
      loadActiveMembership(workspaceId, userId),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "WORKSPACE_PENDING_DELETION",
    });
  });

  it("hides non-membership behind the same error as a missing workspace", async () => {
    mocks.lean.mockResolvedValue(null);

    await expect(
      loadActiveMembership(workspaceId, userId),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: "WORKSPACE_MEMBER_REQUIRED",
    });
  });

  it("throws when the member row is missing from the members array", async () => {
    mocks.lean.mockResolvedValue({
      _id: workspaceId,
      status: "active",
      members: [{ userId: otherUserId, role: "member" }],
    });

    await expect(
      loadActiveMembership(workspaceId, userId),
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("lets the caller keep its own not-a-member error", async () => {
    mocks.lean.mockResolvedValue(null);

    const { boardAccessDeniedError } =
      await import("../../../src/shared/errors/board/board");

    await expect(
      loadActiveMembership(workspaceId, userId, {
        onMissing: boardAccessDeniedError,
      }),
    ).rejects.toMatchObject({ code: "BOARD_ACCESS_DENIED" });
  });

  it("checks the workspace state before anything else it returns", async () => {
    // A guest in a pending workspace must fail on the pending check first, so a
    // read-only workspace never looks like a role problem.
    mocks.lean.mockResolvedValue(membershipRow("guest", "deletion_pending"));

    await expect(
      loadWriterMembership(workspaceId, userId),
    ).rejects.toMatchObject({ code: "WORKSPACE_PENDING_DELETION" });
  });
});

describe("loadWriterMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findOne.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ lean: mocks.lean });
  });

  it("allows a non-guest member", async () => {
    mocks.lean.mockResolvedValue(membershipRow("member"));

    await expect(
      loadWriterMembership(workspaceId, userId),
    ).resolves.toMatchObject({ member: { role: "member" } });
  });

  it("refuses a guest", async () => {
    mocks.lean.mockResolvedValue(membershipRow("guest"));

    await expect(
      loadWriterMembership(workspaceId, userId),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: "GUEST_CANNOT_MODIFY_BOARD",
    });
  });
});

describe("assertWorkspaceWritable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findById.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ lean: mocks.lean });
  });

  it("passes for an active workspace", async () => {
    mocks.lean.mockResolvedValue({ status: "active" });

    await expect(assertWorkspaceWritable(workspaceId)).resolves.toBeUndefined();
    expect(mocks.findById).toHaveBeenCalledWith(workspaceId);
  });

  it("refuses a workspace scheduled for deletion", async () => {
    mocks.lean.mockResolvedValue({ status: "deletion_pending" });

    await expect(assertWorkspaceWritable(workspaceId)).rejects.toMatchObject({
      statusCode: 409,
      code: "WORKSPACE_PENDING_DELETION",
    });
  });

  it("treats a missing workspace as not-a-member rather than not-found", async () => {
    mocks.lean.mockResolvedValue(null);

    await expect(assertWorkspaceWritable(workspaceId)).rejects.toMatchObject({
      statusCode: 403,
      code: "WORKSPACE_MEMBER_REQUIRED",
    });
  });
});
