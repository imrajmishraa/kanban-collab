/**
 * The shell's layout as a pure function.
 *
 * Why this exists: every failure in the brief (F1–F4) had one cause. Four
 * different things wrote the layout — `expand()`, `resize()`, a dynamic
 * `maxSize`, and rules that read a measured width back into a mode — and each of
 * them re-lays the group out on its own, so they raced.
 *
 * Here there is one question ("given this viewport and what the reader chose,
 * what are the three widths?") and one answer, applied in a single
 * `Group.setLayout()` call.
 *
 * Nothing in this file imports React or the library, so it is unit-testable.
 *
 * Numbers are Layout.md §3. They are pixels because a floor that changes with the
 * window is not a floor: a `"55%"` ceiling left the rail 176px at 1280 and the
 * rail needs 200.
 */

export const SHELL = {
  left: { min: 220, max: 420, default: 280, collapsed: 72 },
  centre: { min: 420 },
  /** `max` is the *soft* maximum: what a normal (non-full-width) drag keeps. */
  right: { min: 320, max: 600, default: 420 },
} as const;

export type ShellConfig = typeof SHELL;

export type PaneId = "leftPanel" | "centreLayout" | "rightPanel";

/** Panel id → percentage of the group (0..100), the shape `setLayout` takes. */
export type Layout = Record<PaneId, number>;

/**
 * What the reader chose.
 *
 * Widths are the *intended* open widths in px and are never 0 and never derived
 * from what the library happened to report: they change only when the reader
 * drags (`settleDrag`) or on an explicit command.
 *
 * `railCollapsed` is the icon strip — open, but narrower than the open floor.
 * The library's `minSize` for the rail is therefore `left.collapsed`; the 200px
 * open floor is this model's rule, not a constraint the library knows about.
 */
export type ShellState = {
  railOpen: boolean;
  railCollapsed: boolean;
  railPx: number;
  columnOpen: boolean;
  columnPx: number;
  /** The column takes `group − rail` and the board collapses. */
  fullWidth: boolean;
};

export type Edge = "left" | "right";

export const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/** Percentages that always sum to exactly 100: the board takes the remainder. */
export function toLayout(
  groupPx: number,
  railPx: number,
  columnPx: number,
): Layout {
  const left = (railPx / groupPx) * 100;
  const right = (columnPx / groupPx) * 100;

  return {
    leftPanel: left,
    centreLayout: Math.max(0, 100 - left - right),
    rightPanel: right,
  };
}

/** The width the rail takes: nothing, the icon strip, or the reader's choice. */
export function railWidth(s: ShellState, c: ShellConfig = SHELL): number {
  if (!s.railOpen) return 0;
  if (s.railCollapsed) return c.left.collapsed;

  return clamp(s.railPx, c.left.min, c.left.max);
}

/**
 * Can the rail and the column both be open at this width, with the board at its
 * floor? When this is false a command must close one of them *before* asking for
 * a layout: the group cannot satisfy every `minSize` at once, and the library's
 * answer to an unsatisfiable request is to do nothing (F3).
 */
export function fitsBoth(groupPx: number, c: ShellConfig = SHELL): boolean {
  return fitsWithRail(groupPx, c.left.min, c);
}

/**
 * The same question, for a rail that is a known width.
 *
 * `fitsBoth` answers it for the rail's floor, which is only right when the rail is
 * about to open at its minimum. Asked of a *collapsed* rail it is too strict — the
 * 72px strip leaves room the 200px floor does not, so a column that fits was
 * refused; asked of a rail reopening at a stored 280 it is too loose, and the
 * library answered an unsatisfiable request by doing nothing (F3).
 */
export function fitsWithRail(
  groupPx: number,
  railPx: number,
  c: ShellConfig = SHELL,
): boolean {
  return groupPx >= railPx + c.centre.min + c.right.min;
}

/**
 * The three widths for this viewport and these choices.
 *
 * - A closed pane is 0 (a collapsed pane, not an unmounted one).
 * - Reopening a pane gives back the width the reader last had.
 * - Full width: the column takes everything the rail leaves; the board is 0.
 * - If the stored widths do not fit, the column gives way first and then the
 *   rail, each only down to its own floor. The board's floor is never spent, and
 *   the stored widths are never rewritten by this squeeze.
 */
/**
 * Whose width gives way while a divider is being dragged.
 *
 * The library only resizes the two panes beside the divider it is moving, so a
 * rail dragged wider eats the board and nothing else. The board has a floor, and
 * the pane at the other end has slack: this is the pure answer to "take it from
 * there instead", so the drag never has to stop dead.
 *
 * Returns the corrected `left`/`right` in pixels, or `null` when the board is
 * still above its floor and nothing has to move.
 */
export function giveWay(
  groupPx: number,
  px: { left: number; centre: number; right: number },
  edge: Edge,
  s: ShellState,
  c: ShellConfig = SHELL,
): { left: number; right: number } | null {
  const short = c.centre.min - px.centre;
  if (!(groupPx > 0) || short <= 0.5) return null;

  /* The dragged pane keeps what it has; the other one gives. */
  const other = edge === "left" ? px.right : px.left;
  const floor =
    edge === "left"
      ? s.columnOpen
        ? c.right.min
        : 0
      : s.railCollapsed
        ? c.left.collapsed
        : c.left.min;

  const take = Math.min(short, Math.max(0, other - floor));
  if (take <= 0.5) return null;

  return edge === "left"
    ? { left: px.left, right: px.right - take }
    : { left: px.left - take, right: px.right };
}

export function computeLayout(
  groupPx: number,
  s: ShellState,
  c: ShellConfig = SHELL,
): Layout {
  if (!(groupPx > 0)) {
    throw new RangeError("computeLayout needs a measured group width");
  }

  let rail = railWidth(s, c);
  let column = s.columnOpen ? clamp(s.columnPx, c.right.min, c.right.max) : 0;

  if (s.columnOpen && s.fullWidth) {
    return toLayout(groupPx, rail, groupPx - rail);
  }

  let over = rail + column + c.centre.min - groupPx;

  if (over > 0 && column > 0) {
    const give = Math.min(over, column - c.right.min);
    column -= give;
    over -= give;
  }

  if (over > 0 && rail > 0) {
    const floor = s.railCollapsed ? c.left.collapsed : c.left.min;
    rail -= Math.min(over, Math.max(0, rail - floor));
  }

  return toLayout(groupPx, rail, column);
}

/**
 * Turn the layout the library settled on after a *user* drag into a change to the
 * stored choices.
 *
 * Only the pane on the edge the reader grabbed may change its stored width: a
 * drag that pushed through to a neighbour must not rewrite the neighbour's
 * choice (that was F2 — the rail "coming back at its minimum"). The caller
 * re-applies `computeLayout` afterwards, which puts the neighbour back.
 *
 * `edge` is the separator the reader last touched; `null` (nothing touched yet)
 * changes nothing.
 */
export function settleDrag(
  groupPx: number,
  layout: Layout,
  edge: Edge | null,
  s: ShellState,
  c: ShellConfig = SHELL,
): Partial<ShellState> {
  if (!edge || !(groupPx > 0)) return {};

  /* Sub-pixel slack: percentages round-trip through floats. */
  const EPS = 0.5;

  /*
   * How far past a floor a release may land and still mean "the floor".
   *
   * Every pane's `minSize` is 0, so the library never stops a drag; the model is
   * the only thing deciding that a gesture meant something else. At zero tolerance a
   * board released 20px under its floor flipped the column to full width, and a
   * column released 10px under 320 closed itself — two large consequences for a
   * small overshoot.
   */
  const SLOP = 32;
  const px = (id: PaneId) => (layout[id] / 100) * groupPx;

  if (edge === "left") {
    const rail = px("leftPanel");

    /* Dragged to nothing: that is the reader hiding it. The width they had
       before stays stored, so reopening gives it back (F1). */
    if (rail <= EPS) return { railOpen: false, railCollapsed: false };

    /* Under the floor is a hide, not a half-open rail and not the icon strip:
       the strip is a command's business (`toggleRail`, the mode menu), and a
       drag that goes under the floor has said what it wants. No slop here — the
       floor is the wall, and one pixel under it is one pixel past it. */
    if (rail < c.left.min) {
      return { railOpen: false, railCollapsed: false };
    }

    return {
      railOpen: true,
      railCollapsed: false,
      railPx: clamp(rail, c.left.min, c.left.max),
    };
  }

  const column = px("rightPanel");
  const centre = px("centreLayout");

  if (column < c.right.min - SLOP) {
    return { columnOpen: false, fullWidth: false };
  }

  /* The board was pushed below its floor, which a collapsible pane does by
     collapsing. That is the "drag past the stop" gesture: flip to full width and
     keep the old `columnPx`, so leaving full width restores it. */
  if (centre < c.centre.min - SLOP) {
    return { columnOpen: true, fullWidth: true };
  }

  return {
    columnOpen: true,
    fullWidth: false,
    columnPx: clamp(column, c.right.min, c.right.max),
  };
}

/** Initial `defaultSize`s in px for the panels (a number is pixels in v4). */
export function initialSizes(s: ShellState, c: ShellConfig = SHELL) {
  return {
    rail: railWidth(s, c),
    column: s.columnOpen ? clamp(s.columnPx, c.right.min, c.right.max) : 0,
  };
}

/**
 * Dev diagnostic: `setLayout` returns the layout it actually applied after
 * validation. If that differs from what was asked for, a constraint won — which
 * used to be a silent no-op (F3) and is now a console warning.
 */
export function divergence(want: Layout, got: Record<string, number>): number {
  return Math.max(
    ...(Object.keys(want) as PaneId[]).map((id) =>
      Math.abs(want[id] - (got[id] ?? 0)),
    ),
  );
}

/* ── Commands ─────────────────────────────────────────────────────────────── */
