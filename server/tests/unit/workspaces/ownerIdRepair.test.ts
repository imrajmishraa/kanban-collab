import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `ownerId` must name an owner.
 *
 * It is written once, at creation, and nothing kept it in step with
 * `members[].role` — so rows drifted to a demoted member or to somebody who had
 * left. The permission now checks the role, so this keeps the field honest
 * rather than closing a hole; it runs on every purge tick.
 */

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  updateOne: vi.fn(),
  logWarn: vi.fn(),
}));

vi.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  WorkspaceModel: { find: mocks.find, updateOne: mocks.updateOne },
}));

vi.mock("../../../src/infrastructure/logging/childLogger", () => ({
  workspaceCleanupJobLogger: { warn: mocks.logWarn, info: vi.fn() },
}));

import { repairWorkspaceOwnerIds } from "../../../src/application/workspaces/ownerIdRepair";

/** `ObjectId.equals` is what the module calls, so the fixtures carry one. */
const id = (value: string) => ({
  toString: () => value,
  equals: (other: unknown) => String(other) === value,
});

const OWNER = id("owner-1");
const DEMOTED = id("demoted-1");
const OTHER_OWNER = id("owner-2");

function workspace(
  ownerId: unknown,
  members: Array<{ userId: unknown; role: string }>,
) {
  return { _id: id("ws-1"), ownerId, members };
}

function chain(result: unknown): unknown {
  const lean = async () => result;

  return { lean, select: () => ({ lean }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.updateOne.mockResolvedValue({});
});

describe("repairWorkspaceOwnerIds", () => {
  it("leaves a workspace whose ownerId still names an owner", async () => {
    mocks.find.mockReturnValue(
      chain([workspace(OWNER, [{ userId: OWNER, role: "owner" }])]),
    );

    const result = await repairWorkspaceOwnerIds();

    expect(result).toEqual({ scanned: 1, repaired: 0, ownerless: 0 });
    expect(mocks.updateOne).not.toHaveBeenCalled();
  });

  it("re-points a workspace whose ownerId was demoted", async () => {
    mocks.find.mockReturnValue(
      chain([
        workspace(DEMOTED, [
          { userId: DEMOTED, role: "member" },
          { userId: OTHER_OWNER, role: "owner" },
        ]),
      ]),
    );

    const result = await repairWorkspaceOwnerIds();

    expect(result.repaired).toBe(1);
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { _id: expect.anything() },
      { $set: { ownerId: OTHER_OWNER } },
    );
  });

  it("re-points a workspace whose ownerId has left", async () => {
    mocks.find.mockReturnValue(
      chain([workspace(DEMOTED, [{ userId: OTHER_OWNER, role: "owner" }])]),
    );

    const result = await repairWorkspaceOwnerIds();

    expect(result.repaired).toBe(1);
  });

  it("leaves an ownerless workspace alone and says so", async () => {
    /* Inventing an owner would be a worse decision than reporting one. */
    mocks.find.mockReturnValue(
      chain([workspace(DEMOTED, [{ userId: OWNER, role: "member" }])]),
    );

    const result = await repairWorkspaceOwnerIds();

    expect(result).toEqual({ scanned: 1, repaired: 0, ownerless: 1 });
    expect(mocks.updateOne).not.toHaveBeenCalled();
    expect(mocks.logWarn).toHaveBeenCalled();
  });
});
