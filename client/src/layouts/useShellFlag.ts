import { useState } from "react";

/** Off by default: an existing reader's layout must not change under them. */
const KEY = "kanban.shell";

/**
 * Which layout to draw.
 *
 * - `off` — the layout before the shell: a fixed rail, a fixed navbar, CSS
 *   variables for the widths. Still the default, because a reader who has never
 *   asked for anything else must not get a different page.
 * - `v1` — the shell as it first shipped: one component drawing all three panes.
 * - `v2` — the same shell with the panes split into
 *   `components/layout/appLayout/`, and one store behind all three.
 *
 * `?shell=1` / `?shell=0` wins for one session, so a reviewer can flip it without
 * touching storage; otherwise the stored choice, otherwise off. Read once at mount
 * — a layout is not something to switch mid-drag.
 */
export type ShellMode = "off" | "v1" | "v2";

export function useShellMode(): ShellMode {
  const [mode] = useState<ShellMode>(() => {
    if (typeof window === "undefined") return "off";

    const query = new URLSearchParams(window.location.search).get("shell");
    if (query === "1") return "v2";
    if (query === "0") return "v1";

    const stored = window.localStorage.getItem(KEY);
    if (stored === "1") return "v2";
    if (stored === "0") return "v1";

    return "off";
  });

  return mode;
}

/**
 * "Is a shell being drawn at all" — for the code that only needs to know whether
 * the shell owns the rail's width, not which shell it is.
 */
export function useShellFlag(): boolean {
  return useShellMode() !== "off";
}
