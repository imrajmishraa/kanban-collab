import { useEffect } from "react";

import { useSidebarState } from "@/features/dashboard";
import { useLayoutShellStore } from "@/layouts/stores/layoutShellStore";
import { useRightPanel } from "@/stores/rightPanel";

/**
 * The shell's shortcuts, in one place.
 *
 * Called by `ShellLayout`, which `AppLayout` mounts when the flag is on. It must be
 * called *once*: a second registration fires every key twice, which is why
 * `AppLayout`'s own ⌘B / ⌘J handlers stand down in the same change.
 *
 * | Key | Effect |
 * |---|---|
 * | ⌘B | rail: open ↔ hidden |
 * | ⌘⇧B | rail: collapsed |
 * | ⌘J | column: open ↔ closed |
 * | ⌘⇧J | column: full width (`remaining` — the stage yields to it) |
 */

/** A shortcut must never eat a keystroke meant for a field. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName;

  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function useShellShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      if (key !== "b" && key !== "j") return;

      event.preventDefault();

      const rail = useSidebarState.getState();
      const panel = useRightPanel.getState();

      if (key === "b") {
        if (event.shiftKey) {
          rail.setMode("collapsed");
          return;
        }

        rail.setMode(rail.mode === "hidden" ? "open" : "hidden");
        return;
      }

      if (!event.shiftKey) {
        panel.setMode(panel.mode === "off" ? "panel" : "off");
        return;
      }

      /* Full width: the column takes viewport − rail and the stage yields
         entirely — `remaining` is that state, not a width. One implementation,
         shared with the bar's button, so the two can never disagree. */
      useLayoutShellStore.getState().toggleLevel();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
