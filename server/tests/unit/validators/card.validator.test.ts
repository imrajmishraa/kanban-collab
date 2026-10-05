import { describe, expect, it } from "@jest/globals";

import {
  createCardSchema,
  moveCardSchema,
  updateCardSchema,
} from "../../../src/interfaces/http/validators/kanban/card.validator";

const COLUMN_ID = "507f1f77bcf86cd799439011";
const BOARD_ID = "507f1f77bcf86cd799439012";

describe("createCardSchema", () => {
  it("accepts a minimal valid card", () => {
    const result = createCardSchema.body.safeParse({
      columnId: COLUMN_ID,
      boardId: BOARD_ID,
      title: "Write the spec",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(
      createCardSchema.body.safeParse({
        columnId: COLUMN_ID,
        boardId: BOARD_ID,
        title: "   ",
      }).success,
    ).toBe(false);
  });

  it("rejects a missing boardId", () => {
    expect(
      createCardSchema.body.safeParse({
        columnId: COLUMN_ID,
        title: "No board",
      }).success,
    ).toBe(false);
  });
});

describe("updateCardSchema", () => {
  it("accepts a partial update", () => {
    expect(updateCardSchema.body.safeParse({ title: "Renamed" }).success).toBe(
      true,
    );
  });

  it("rejects an empty update", () => {
    expect(updateCardSchema.body.safeParse({}).success).toBe(false);
  });

  it("accepts a nullable dueDate (clearing it)", () => {
    expect(updateCardSchema.body.safeParse({ dueDate: null }).success).toBe(
      true,
    );
  });
});

describe("moveCardSchema", () => {
  it("accepts a valid move", () => {
    const result = moveCardSchema.body.safeParse({
      targetColumnId: COLUMN_ID,
      targetOrderIndex: 2,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a negative order index", () => {
    expect(
      moveCardSchema.body.safeParse({
        targetColumnId: COLUMN_ID,
        targetOrderIndex: -1,
      }).success,
    ).toBe(false);
  });
});
