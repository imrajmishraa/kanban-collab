import {
  clamp,
  fitsWithRail,
  railWidth,
  SHELL,
  type ShellConfig,
  type ShellState,
} from "./shellLayout";

/*
 * The shell's commands: what a key or a button asks the layout to become.
 *
 * Separate from `shellLayout.ts` because the two answer different questions — that
 * file is the geometry (what the three widths are, and whether they fit), this one
 * is the intent (what a gesture means). The split also keeps both files under the
 * 300-line budget `check-surface.mjs` enforces.
 */

/**
 * ⌘B: open ↔ hidden. Opening at a width where both cannot fit closes the column
 * in the same state change: the group cannot satisfy every `minSize`, so it must
 * never be asked (F3).
 */
export function toggleRail(
  groupPx: number,
  s: ShellState,
  c: ShellConfig = SHELL,
): Partial<ShellState> {
  if (s.railOpen) return { railOpen: false, railCollapsed: false };

  /* The rail reopens at its stored width, so that is what has to fit. */
  if (
    !s.columnOpen ||
    fitsWithRail(groupPx, clamp(s.railPx, c.left.min, c.left.max), c)
  ) {
    return { railOpen: true, railCollapsed: false };
  }

  return {
    railOpen: true,
    railCollapsed: false,
    columnOpen: false,
    fullWidth: false,
  };
}

/** ⌘⇧B: the icon strip. */
export function collapseRail(): Partial<ShellState> {
  return { railOpen: true, railCollapsed: true };
}

export function openColumn(
  groupPx: number,
  s: ShellState,
  c: ShellConfig = SHELL,
): Partial<ShellState> {
  /* The rail stays as it is; the column must fit beside *that*. */
  if (!s.railOpen || fitsWithRail(groupPx, railWidth(s, c), c)) {
    return { columnOpen: true };
  }

  return { columnOpen: true, railOpen: false, railCollapsed: false };
}

/** ⌘J: open ↔ closed. */
export function toggleColumn(
  groupPx: number,
  s: ShellState,
  c: ShellConfig = SHELL,
): Partial<ShellState> {
  if (s.columnOpen) return { columnOpen: false, fullWidth: false };

  return openColumn(groupPx, s, c);
}

/** ⌘⇧J: full width ↔ normal. Opens the column first, so one key always works. */
export function toggleFullWidth(
  groupPx: number,
  s: ShellState,
  c: ShellConfig = SHELL,
): Partial<ShellState> {
  if (!s.columnOpen) {
    return { ...openColumn(groupPx, s, c), fullWidth: true };
  }

  return { fullWidth: !s.fullWidth };
}
