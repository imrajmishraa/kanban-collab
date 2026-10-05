import { describe, expect, it } from "@jest/globals";

import {
  boardQuerySchema,
  createBoardSchema,
  updateBoardSchema,
} from "../../../src/interfaces/http/validators/kanban/board.validator";

const WORKSPACE_ID = "507f1f77bcf86cd799439011";

describe("boardQuerySchema", () => {
  it("accepts a valid workspaceId and applies pagination defaults", () => {
    const result = boardQuerySchema.query.safeParse({
      workspaceId: WORKSPACE_ID,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.include).toBeUndefined();
    }
  });

  it("accepts the include=columns,cards opt-in", () => {
    for (const include of ["columns", "cards", "columns,cards"]) {
      expect(
        boardQuerySchema.query.safeParse({
          workspaceId: WORKSPACE_ID,
          include,
        }).success,
      ).toBe(true);
    }
  });

  it("rejects an unknown include value", () => {
    const result = boardQuerySchema.query.safeParse({
      workspaceId: WORKSPACE_ID,
      include: "everything",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a malformed workspaceId", () => {
    expect(
      boardQuerySchema.query.safeParse({ workspaceId: "not-an-object-id" })
        .success,
    ).toBe(false);
  });

  it("clamps limit to the allowed range", () => {
    expect(
      boardQuerySchema.query.safeParse({
        workspaceId: WORKSPACE_ID,
        limit: 1000,
      }).success,
    ).toBe(false);
  });
});

describe("createBoardSchema", () => {
  it("accepts a minimal valid board", () => {
    const result = createBoardSchema.body.safeParse({
      workspaceId: WORKSPACE_ID,
      name: "Roadmap",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a name shorter than 3 characters", () => {
    expect(
      createBoardSchema.body.safeParse({
        workspaceId: WORKSPACE_ID,
        name: "ab",
      }).success,
    ).toBe(false);
  });

  it("rejects a non-hex backgroundColor", () => {
    expect(
      createBoardSchema.body.safeParse({
        workspaceId: WORKSPACE_ID,
        name: "Roadmap",
        backgroundColor: "blue",
      }).success,
    ).toBe(false);
  });
});

describe("updateBoardSchema", () => {
  it("accepts a single-field update", () => {
    const result = updateBoardSchema.body.safeParse({ name: "Renamed" });

    expect(result.success).toBe(true);
  });

  it("rejects an empty update body", () => {
    expect(updateBoardSchema.body.safeParse({}).success).toBe(false);
  });

  it("rejects an invalid visibility value", () => {
    expect(
      updateBoardSchema.body.safeParse({ visibility: "secret" }).success,
    ).toBe(false);
  });
});
