import { useEffect } from "react";

import { useSidebarState } from "@/features/dashboard";
import { useRightPanel } from "@/stores/rightPanel";

/**
 * The shell's shortcuts, in one place.
 *
 * Registered here rather than in `DashboardLayout` because this page renders
 * outside `AppLayout`: the app shell already binds ⌘B / ⌘J / ⌘⇧J, and a component
 * that binds them again would fire twice the moment the shell is nested.
 *
 * | Key | Effect |
 * |---|---|
 * | ⌘B | rail: open ↔ hidden |
 * | ⌘⇧B | rail: collapsed |
 * | ⌘J | column: open ↔ closed |
 * | ⌘⇧J | column: fullscreen (`remaining` — the stage yields to it) |
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

      /* Fullscreen: the column takes the viewport minus the rail, and the stage
         yields entirely — `remaining` is that state, not a width. */
      if (panel.mode === "off") panel.setMode("panel");
      panel.setLevel(panel.level === "remaining" ? "normal" : "remaining");
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
