import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const boardId = new Types.ObjectId().toString();
const workspaceId = new Types.ObjectId();
const userId = new Types.ObjectId().toString();

const boardLean = vi.fn();
const workspaceLean = vi.fn();

vi.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  BoardModel: {
    findById: vi.fn(() => ({
      select: vi.fn(() => ({ lean: boardLean })),
    })),
  },
  WorkspaceModel: {
    findOne: vi.fn(() => ({
      select: vi.fn(() => ({ lean: workspaceLean })),
    })),
  },
}));

import { authorize } from "../../../src/interfaces/websockets/middlewares/authorize";

function mockBoard(visibility: "private" | "public" | "workspace") {
  boardLean.mockResolvedValue({ _id: boardId, workspaceId, visibility });
}

function mockWorkspace(
  role: "owner" | "admin" | "member" | "guest",
  status: "active" | "deletion_pending" = "active",
) {
  workspaceLean.mockResolvedValue({
    members: [{ userId: new Types.ObjectId(userId), role }],
    status,
  });
}

describe("websocket authorize", () => {
  beforeEach(() => {
    boardLean.mockReset();
    workspaceLean.mockReset();
  });

  it("allows a member and reports write access", async () => {
    mockBoard("workspace");
    mockWorkspace("member");

    await expect(authorize(userId, boardId)).resolves.toEqual({
      role: "member",
      canWrite: true,
    });
  });

  it("makes a guest read-only", async () => {
    mockBoard("workspace");
    mockWorkspace("guest");

    await expect(authorize(userId, boardId)).resolves.toEqual({
      role: "guest",
      canWrite: false,
    });
  });

  it("denies a guest on a private board", async () => {
    mockBoard("private");
    mockWorkspace("guest");

    await expect(authorize(userId, boardId)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("rejects the upgrade when the workspace is scheduled for deletion", async () => {
    mockBoard("workspace");
    mockWorkspace("owner", "deletion_pending");

    await expect(authorize(userId, boardId)).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringMatching(/scheduled for deletion/i),
    });
  });

  it("still rejects a non-member of a pending workspace", async () => {
    mockBoard("workspace");
    workspaceLean.mockResolvedValue(null);

    await expect(authorize(userId, boardId)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("rejects a malformed board id before touching the database", async () => {
    await expect(authorize(userId, "not-an-object-id")).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(boardLean).not.toHaveBeenCalled();
  });
});
