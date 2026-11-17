import { describe, expect, it } from "vitest";

import {
  IDLE_DRAG,
  boardDragReducer,
  resolveDrop,
  type DragState,
} from "./boardDrag";

function dragging(
  overrides: Partial<Extract<DragState, { phase: "dragging" }>> = {},
) {
  return {
    phase: "dragging" as const,
    cardId: "card-1",
    overColumnId: null,
    overIndex: null,
    ...overrides,
  };
}

describe("boardDragReducer", () => {
  it("starts idle", () => {
    expect(IDLE_DRAG).toEqual({ phase: "idle" });
  });

  it("START begins a drag with no target yet", () => {
    const state = boardDragReducer(IDLE_DRAG, { type: "START", cardId: "c1" });

    expect(state).toEqual(dragging({ cardId: "c1" }));
  });

  it("a second START replaces the source instead of stacking", () => {
    const first = boardDragReducer(IDLE_DRAG, { type: "START", cardId: "c1" });
    const second = boardDragReducer(first, { type: "START", cardId: "c2" });

    expect(second).toEqual(dragging({ cardId: "c2" }));
  });

  it("OVER records the column and index", () => {
    const state = boardDragReducer(dragging(), {
      type: "OVER",
      columnId: "col-2",
      index: 3,
    });

    expect(state).toEqual(dragging({ overColumnId: "col-2", overIndex: 3 }));
  });

  it("ignores OVER when nothing is being dragged", () => {
    // The old three-boolean version happily stored this: dragOverColumnId set,
    // dropIndex set, draggingCardId null.
    const state = boardDragReducer(IDLE_DRAG, {
      type: "OVER",
      columnId: "col-1",
      index: 2,
    });

    expect(state).toBe(IDLE_DRAG);
  });

  it("keeps the same object when the target did not change", () => {
    const over = dragging({ overColumnId: "col-1", overIndex: 1 });
    const again = boardDragReducer(over, {
      type: "OVER",
      columnId: "col-1",
      index: 1,
    });

    expect(again).toBe(over);
  });

  it("END returns to idle", () => {
    expect(
      boardDragReducer(dragging({ overColumnId: "col-1", overIndex: 0 }), {
        type: "END",
      }),
    ).toBe(IDLE_DRAG);
  });

  it("DROP returns to idle", () => {
    expect(boardDragReducer(dragging(), { type: "DROP" })).toBe(IDLE_DRAG);
  });
});

describe("resolveDrop", () => {
  it("returns null when nothing is being dragged", () => {
    expect(resolveDrop(IDLE_DRAG, "col-1", 0)).toBeNull();
  });

  it("prefers the index the pointer recorded", () => {
    expect(
      resolveDrop(
        dragging({ overColumnId: "col-2", overIndex: 1 }),
        "col-2",
        5,
      ),
    ).toEqual({ cardId: "card-1", columnId: "col-2", index: 1 });
  });

  it("falls back to the column's own index when the pointer never landed on a card", () => {
    expect(resolveDrop(dragging(), "col-3", 4)).toEqual({
      cardId: "card-1",
      columnId: "col-3",
      index: 4,
    });
  });

  it("uses index 0 rather than treating it as missing", () => {
    expect(
      resolveDrop(
        dragging({ overColumnId: "col-1", overIndex: 0 }),
        "col-1",
        9,
      ),
    ).toMatchObject({ index: 0 });
  });
});
