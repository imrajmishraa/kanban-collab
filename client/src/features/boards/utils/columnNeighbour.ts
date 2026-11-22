/**
 * Where a card goes when it is moved with the keyboard.
 *
 * Dragging is the only way to change a card's column, and dragging needs a
 * mouse: native HTML5 drag-and-drop never fires from a finger, and there is no
 * keyboard path at all. This is the arithmetic the keyboard path needs — the
 * column to the left or right of the one holding the card — kept pure so the
 * rule is testable without a board.
 */

export interface NeighbourColumn {
  id: string;
}

/**
 * The id of the column `direction` steps from the one holding `currentColumnId`.
 *
 * Returns `null` at the edge rather than wrapping: a card that jumps from Done
 * to To do because somebody pressed the wrong arrow is worse than nothing
 * happening.
 */
export function neighbourColumnId(
  columns: readonly NeighbourColumn[],
  currentColumnId: string,
  direction: "left" | "right",
): string | null {
  const index = columns.findIndex((column) => column.id === currentColumnId);

  if (index === -1) {
    return null;
  }

  const next = direction === "left" ? index - 1 : index + 1;

  if (next < 0 || next >= columns.length) {
    return null;
  }

  return columns[next]?.id ?? null;
}
