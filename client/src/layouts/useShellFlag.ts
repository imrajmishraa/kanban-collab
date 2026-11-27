import { useState } from "react";

/** Off by default: an existing reader's layout must not change under them. */
const KEY = "kanban.shell";

/**
 * Is the resizable shell on?
 *
 * `?shell=1` / `?shell=0` wins for one session, so a reviewer can flip it without
 * touching storage; otherwise the stored choice, otherwise off. Read once at mount
 * — the shell is not something to switch mid-drag.
 */
export function useShellFlag(): boolean {
  const [on] = useState(() => {
    if (typeof window === "undefined") return false;

    const query = new URLSearchParams(window.location.search).get("shell");
    if (query === "1") return true;
    if (query === "0") return false;

    return window.localStorage.getItem(KEY) === "1";
  });

  return on;
}
