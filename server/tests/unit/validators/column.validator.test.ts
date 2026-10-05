import { describe, expect, it } from "@jest/globals";

import {
  columnParamsSchema,
  createColumnSchema,
  updateColumnSchema,
} from "../../../src/interfaces/http/validators/kanban/column.validator";

const BOARD_ID = "507f1f77bcf86cd799439011";
const COLUMN_ID = "507f1f77bcf86cd799439012";

describe("columnParamsSchema", () => {
  it("accepts a valid ObjectId", () => {
    expect(columnParamsSchema.safeParse({ columnId: COLUMN_ID }).success).toBe(
      true,
    );
  });

  it("rejects a non-ObjectId", () => {
    expect(columnParamsSchema.safeParse({ columnId: "123" }).success).toBe(
      false,
    );
  });
});

describe("createColumnSchema", () => {
  it("accepts a valid column", () => {
    const result = createColumnSchema.body.safeParse({
      boardId: BOARD_ID,
      name: "In progress",
      orderIndex: 1,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing orderIndex", () => {
    expect(
      createColumnSchema.body.safeParse({ boardId: BOARD_ID, name: "Todo" })
        .success,
    ).toBe(false);
  });
});

describe("updateColumnSchema", () => {
  it("accepts a name-only update", () => {
    expect(updateColumnSchema.body.safeParse({ name: "Done" }).success).toBe(
      true,
    );
  });

  it("rejects an empty update", () => {
    expect(updateColumnSchema.body.safeParse({}).success).toBe(false);
  });
});
