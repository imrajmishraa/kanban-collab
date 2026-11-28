/**
 * The board the drag demo plays on, and the three moves it makes.
 *
 * A faux board, authored rather than automated: real words only on the card
 * the story is about, so the eye has one place to land. Pure — no React, no
 * framer-motion — so each move is tested on its own in `dragDemoBoard.test.ts`.
 */

export type ColumnId = "backlog" | "review" | "done";

export interface DemoCard {
  id: string;
  title: string;
  tag: string;
  due?: string;
}

export type Board = Record<ColumnId, DemoCard[]>;

/** The card the story follows. */
export const MOVING = "invite-flow";

/** The open slot it will land in. */
export const SLOT = "__slot__";

export const MOVING_CARD: DemoCard = {
  id: MOVING,
  title: "Ship the invite flow",
  tag: "Auth",
  due: "Today",
};

export const START: Board = {
  backlog: [
    { id: "empty-states", title: "Polish empty states", tag: "Design" },
    { id: "permissions", title: "Board permissions", tag: "Auth" },
  ],
  review: [
    MOVING_CARD,
    { id: "replay", title: "Offline replay", tag: "Sync" },
    { id: "covers", title: "Card covers", tag: "Design" },
  ],
  done: [
    { id: "presence", title: "Presence cursors", tag: "Realtime" },
    { id: "wip", title: "WIP limits", tag: "Board" },
    { id: "export", title: "CSV export", tag: "Data" },
  ],
};

export const COLUMNS: { id: ColumnId; name: string }[] = [
  { id: "backlog", name: "Backlog" },
  { id: "review", name: "In review" },
  { id: "done", name: "Done" },
];

/** Out of its column: the others close the gap. */
export function liftOut(board: Board, from: ColumnId): Board {
  return {
    ...board,
    [from]: board[from].filter((card) => card.id !== MOVING),
  };
}

/** An open slot at the top of the target column, so room is made before the
 *  card lands rather than after it. */
export function reserve(board: Board, to: ColumnId): Board {
  const slot: DemoCard = { id: SLOT, title: "", tag: "" };
  return { ...board, [to]: [slot, ...board[to]] };
}

/** The card takes the slot it was measured against. */
export function place(board: Board, to: ColumnId): Board {
  return {
    ...board,
    [to]: board[to].map((card) => (card.id === SLOT ? MOVING_CARD : card)),
  };
}

/** Cards in a column, not counting the open slot. */
export function countIn(board: Board, column: ColumnId): number {
  return board[column].filter((card) => card.id !== SLOT).length;
}

/** The poster: the card already in Done, for readers who asked for no motion. */
export function poster(): Board {
  return place(reserve(liftOut(START, "review"), "done"), "done");
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
