import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findByIdLean: vi.fn(),
  boardFindLean: vi.fn(),
  columnFindLean: vi.fn(),
  cardFindLean: vi.fn(),
  deleteMany: vi.fn(),
  workspaceDeleteOne: vi.fn(),
}));

vi.mock("../../../src/infrastructure/db/mongoose/schemas", () => {
  const chain = (lean: typeof mocks.findByIdLean) => ({
    select: vi.fn(() => ({ lean })),
  });

  return {
    WorkspaceModel: {
      findById: vi.fn(() => chain(mocks.findByIdLean)),
      deleteOne: mocks.workspaceDeleteOne,
    },
    BoardModel: {
      find: vi.fn(() => ({ lean: mocks.boardFindLean })),
      deleteMany: mocks.deleteMany,
    },
    ColumnModel: {
      find: vi.fn(() => ({ lean: mocks.columnFindLean })),
      deleteMany: mocks.deleteMany,
    },
    CardModel: {
      find: vi.fn(() => ({ lean: mocks.cardFindLean })),
      deleteMany: mocks.deleteMany,
    },
    CommentModel: { deleteMany: mocks.deleteMany },
    ActivityLogModel: { deleteMany: mocks.deleteMany },
    YjsUpdateModel: { deleteMany: mocks.deleteMany },
  };
});

import { permanentlyDeleteWorkspace } from "../../../src/application/workspaces/permanentlyDeleteWorkspace";

const workspaceId = "507f1f77bcf86cd799439011";

describe("permanentlyDeleteWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.boardFindLean.mockResolvedValue([]);
  });

  it("refuses to touch an active workspace", async () => {
    mocks.findByIdLean.mockResolvedValue({
      status: "active",
      deletionRequestedAt: null,
      deletionScheduledFor: null,
    });

    await expect(permanentlyDeleteWorkspace(workspaceId)).rejects.toThrow(
      /Refusing to purge workspace .*not_pending_deletion/,
    );

    // Nothing was deleted — not a single collection was touched.
    expect(mocks.deleteMany).not.toHaveBeenCalled();
    expect(mocks.workspaceDeleteOne).not.toHaveBeenCalled();
  });

  it("refuses to purge a pending workspace before the grace period ends", async () => {
    mocks.findByIdLean.mockResolvedValue({
      status: "deletion_pending",
      deletionRequestedAt: new Date(Date.now() - 86_400_000),
      deletionScheduledFor: new Date(Date.now() + 86_400_000),
    });

    await expect(permanentlyDeleteWorkspace(workspaceId)).rejects.toThrow(
      /grace_not_elapsed/,
    );

    expect(mocks.deleteMany).not.toHaveBeenCalled();
  });

  it("purges a pending workspace whose grace period has elapsed", async () => {
    mocks.findByIdLean.mockResolvedValue({
      status: "deletion_pending",
      deletionRequestedAt: new Date(Date.now() - 2 * 86_400_000),
      deletionScheduledFor: new Date(Date.now() - 86_400_000),
    });

    await expect(
      permanentlyDeleteWorkspace(workspaceId),
    ).resolves.toBeUndefined();

    expect(mocks.workspaceDeleteOne).toHaveBeenCalledTimes(1);
  });

  it("is a no-op when the workspace is already gone", async () => {
    mocks.findByIdLean.mockResolvedValue(null);

    await expect(
      permanentlyDeleteWorkspace(workspaceId),
    ).resolves.toBeUndefined();

    expect(mocks.deleteMany).not.toHaveBeenCalled();
    expect(mocks.workspaceDeleteOne).not.toHaveBeenCalled();
  });
});
