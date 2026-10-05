import { describe, expect, it } from "@jest/globals";

import {
  createNoteSchema,
  listNotesQuerySchema,
  noteParamsSchema,
  updateNoteSchema,
} from "../../../src/interfaces/http/validators/kanban/note.validator";

const WORKSPACE_ID = "507f1f77bcf86cd799439011";
const BOARD_ID = "507f1f77bcf86cd799439012";
const NOTE_ID = "507f1f77bcf86cd799439013";

describe("noteParamsSchema", () => {
  it("accepts a valid noteId", () => {
    expect(noteParamsSchema.safeParse({ noteId: NOTE_ID }).success).toBe(true);
  });

  it("rejects a malformed noteId", () => {
    expect(noteParamsSchema.safeParse({ noteId: "nope" }).success).toBe(false);
  });
});

describe("listNotesQuerySchema", () => {
  it("accepts a workspaceId alone", () => {
    expect(
      listNotesQuerySchema.safeParse({ workspaceId: WORKSPACE_ID }).success,
    ).toBe(true);
  });

  it("accepts an optional boardId", () => {
    expect(
      listNotesQuerySchema.safeParse({
        workspaceId: WORKSPACE_ID,
        boardId: BOARD_ID,
      }).success,
    ).toBe(true);
  });

  it("requires a workspaceId", () => {
    expect(listNotesQuerySchema.safeParse({}).success).toBe(false);
  });
});

describe("createNoteSchema", () => {
  it("accepts a title-only note", () => {
    const result = createNoteSchema.body.safeParse({
      workspaceId: WORKSPACE_ID,
      title: "Sprint retro",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(
      createNoteSchema.body.safeParse({
        workspaceId: WORKSPACE_ID,
        title: "",
      }).success,
    ).toBe(false);
  });

  it("rejects a title over 200 characters", () => {
    expect(
      createNoteSchema.body.safeParse({
        workspaceId: WORKSPACE_ID,
        title: "x".repeat(201),
      }).success,
    ).toBe(false);
  });
});

describe("updateNoteSchema", () => {
  it("accepts a pin toggle", () => {
    expect(updateNoteSchema.body.safeParse({ isPinned: true }).success).toBe(
      true,
    );
  });

  it("rejects an empty update", () => {
    expect(updateNoteSchema.body.safeParse({}).success).toBe(false);
  });
});
