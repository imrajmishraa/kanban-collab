import { createContext, useContext } from "react";

import type { Edge } from "@/lib/shellLayout";

/**
 * What a pane needs from the shell, and nothing else.
 *
 * The `Group` owns the drag: only the library knows which separator the pointer is
 * on, and only the shell knows the group's measured width. Both are handed down
 * through this context so a pane can draw its own `Panel` and `Separator` without
 * taking the engine as four props.
 */
export interface PaneChrome {
  /** Pixel `defaultSize` for the first frame, before a measurement lands. */
  initial: { rail: number; column: number };
  /** Tells the engine which edge a drag belongs to. */
  separatorProps: (edge: Edge) => {
    onPointerDown: () => void;
    onFocus: () => void;
  };
  /** True while a divider is held — the shell kills transitions on it. */
  resizing: boolean;
  setResizing: (resizing: boolean) => void;
}

export const PaneChromeContext = createContext<PaneChrome | null>(null);

export function usePaneChrome(): PaneChrome {
  const chrome = useContext(PaneChromeContext);

  if (!chrome) {
    throw new Error(
      "A pane was rendered outside the shell. Wrap it in `ShellLayout`.",
    );
  }

  return chrome;
}
