/**
 * Board drag & drop, as one state instead of three.
 *
 * The view used to keep `draggingCardId`, `dragOverColumnId` and `dropIndex` in
 * three separate `useState`s, which meant every combination was representable —
 * including "nothing is being dragged, but the drop index is 3". Nothing
 * rendered that combination, but nothing prevented it either, and every handler
 * had to remember to clear all three.
 *
 * Here a drag is either not happening or it is happening *with* its target, so
 * the invalid combinations cannot be written down.
 */

export interface DragSource {
  cardId: string;
}

export interface DropTarget {
  cardId: string;
  columnId: string;
  index: number;
}

export type DragState =
  | { phase: "idle" }
  | {
      phase: "dragging";
      cardId: string;
      /** Column under the pointer, or null while it is over nothing. */
      overColumnId: string | null;
      /** Insertion index inside that column, or null when unknown. */
      overIndex: number | null;
    };

export type DragEvent =
  | { type: "START"; cardId: string }
  | { type: "OVER"; columnId: string; index: number }
  | { type: "END" }
  | { type: "DROP" };

export const IDLE_DRAG: DragState = { phase: "idle" };

export function boardDragReducer(
  state: DragState,
  event: DragEvent,
): DragState {
  switch (event.type) {
    case "START":
      /* A second START (another card grabbed mid-drag) replaces the source
         rather than stacking two drags. */
      return {
        phase: "dragging",
        cardId: event.cardId,
        overColumnId: null,
        overIndex: null,
      };

    case "OVER":
      /* A stray `dragover` with no drag in progress is ignored. This is the case
         the three booleans used to record happily. */
      if (state.phase !== "dragging") return state;

      if (
        state.overColumnId === event.columnId &&
        state.overIndex === event.index
      ) {
        return state;
      }

      return {
        ...state,
        overColumnId: event.columnId,
        overIndex: event.index,
      };

    case "END":
    case "DROP":
      return IDLE_DRAG;

    default: {
      const exhaustive: never = event;
      throw new Error(`Unhandled drag event: ${String(exhaustive)}`);
    }
  }
}

/**
 * Where a drop lands, or null when there is nothing to move.
 *
 * The pointer's index wins when it was recorded; otherwise the index the column
 * reports (i.e. the end of the column) is used. Same rule the view applied
 * inline as `dropIndex ?? index`.
 */
export function resolveDrop(
  state: DragState,
  columnId: string,
  index: number,
): DropTarget | null {
  if (state.phase !== "dragging") return null;

  return {
    cardId: state.cardId,
    columnId,
    index: state.overIndex ?? index,
  };
}
