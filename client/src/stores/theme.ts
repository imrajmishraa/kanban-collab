import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { applyThemeWithReveal } from "@/lib/themeReveal";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  readStoredMode,
  resolveTheme,
  watchSystemTheme,
  type Theme,
  type ThemeMode,
} from "@/lib/theme";

export type { Theme, ThemeMode };

/* The first render has to agree with `<html>`, which `index.html` painted
   before this module existed. So the initial state is the stored choice, not a
   fixed default: with nothing stored, `"system"` resolves to the OS, which is
   the same answer the pre-paint script reached. */
const initialMode = readStoredMode() ?? "system";

interface ThemeState {
  /** The user's choice, which is what the control shows. */
  mode: ThemeMode;
  /** The resolved theme, which is what the document shows. */
  theme: Theme;
  /**
   * @param mode    what the user picked
   * @param origin  the control they pressed, so the reveal can start under it
   */
  setMode: (mode: ThemeMode, origin?: HTMLElement | null) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: initialMode,
      theme: resolveTheme(initialMode),

      setMode: (mode, origin) => {
        const theme = resolveTheme(mode);
        /* Re-picking what is already on screen (the active swatch, or "system"
           when the OS agrees) must not start a reveal: nothing would change
           under it, yet the transition would hold both snapshot layers for the
           full 1.5-2s and the next real click would land on top of it.
           A deliberate choice is revealed; the OS changing under us is not,
           because there is no control to start the circle from. */
        if (get().theme !== theme) {
          applyThemeWithReveal(() => applyTheme(theme), origin);
        }
        set({ mode, theme });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      /* v1 stores `mode`. v0 stored `theme`, with no notion of system. */
      version: 1,
      partialize: (state) => ({ mode: state.mode }),
      migrate: (persisted, version) => {
        if (version === 0) {
          const old = persisted as { theme?: Theme } | undefined;
          return { mode: old?.theme === "light" ? "light" : "dark" } as {
            mode: ThemeMode;
          };
        }
        return persisted as { mode: ThemeMode };
      },
      /* Nothing here on purpose. Binding the document is `installThemeMatcher`'s
         job and it runs from `main.tsx`; rehydrating used to start a second OS
         listener of its own, so two callbacks raced to write the same class. */
    },
  ),
);

/* ── the binding ─────────────────────────────────────────────────────────
   Installed once, from `main.tsx`, before the first render. */

let uninstall: (() => void) | null = null;

/**
 * Binds `<html>` to the matcher: applies the stored theme (or the OS when
 * nothing is stored) and keeps following the OS while the mode is `"system"`.
 *
 * One listener at a time. Picking a side stops the OS from having a say;
 * picking "system" again hands it back. Either way the class itself is written
 * by `setMode`, through the reveal — this only moves the listener.
 *
 * @returns a teardown, for tests and for HMR
 */
export function installThemeMatcher(): () => void {
  if (uninstall) return uninstall;

  let stopWatching: (() => void) | null = null;

  const show = (theme: Theme) => {
    applyTheme(theme);
    useThemeStore.setState({ theme });
  };

  /* The OS changing under us is not a choice, so it must not run the reveal:
     there is no control to start the circle from. */
  const repoint = (mode: ThemeMode) => {
    stopWatching?.();
    stopWatching = mode === "system" ? watchSystemTheme(show) : null;
  };

  const mode = useThemeStore.getState().mode;
  show(resolveTheme(mode));
  repoint(mode);

  const unsubscribe = useThemeStore.subscribe((state, previous) => {
    if (state.mode !== previous.mode) repoint(state.mode);
  });

  uninstall = () => {
    unsubscribe();
    stopWatching?.();
    stopWatching = null;
    uninstall = null;
  };

  return uninstall;
}
