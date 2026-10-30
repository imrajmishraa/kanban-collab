import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { applyThemeWithReveal } from "@/lib/themeReveal";

/** What the user picked. "system" follows the OS and keeps following it. */
export type ThemeMode = "system" | "light" | "dark";

/** What that resolves to on screen. */
export type Theme = "light" | "dark";

const STORAGE_KEY = "kanban-theme";

function systemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function resolveTheme(mode: ThemeMode): Theme {
  return mode === "system" ? systemTheme() : mode;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  /* Dark is the :root default, so `.light` is the override and `.dark` is kept
     for the pre-paint script and for anything that reads it. */
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/* Only one listener at a time: switching away from system, or back to it,
   replaces the previous one. */
let stopWatching: (() => void) | null = null;

function watchSystemTheme(onChange: (theme: Theme) => void) {
  stopWatching?.();
  stopWatching = null;

  if (typeof window === "undefined" || !window.matchMedia) return;

  const query = window.matchMedia("(prefers-color-scheme: light)");
  const handler = () => onChange(query.matches ? "light" : "dark");

  query.addEventListener("change", handler);
  stopWatching = () => query.removeEventListener("change", handler);
}

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
    (set) => ({
      mode: "system",
      theme: resolveTheme("system"),

      setMode: (mode, origin) => {
        const theme = resolveTheme(mode);
        /* A deliberate choice is revealed; the OS changing under us is not,
           because there is no control to start the circle from. */
        applyThemeWithReveal(() => applyTheme(theme), origin);

        if (mode === "system") {
          watchSystemTheme((next) => {
            applyTheme(next);
            set({ theme: next });
          });
        } else {
          /* Leaving system means the OS no longer gets a say. */
          stopWatching?.();
          stopWatching = null;
        }

        set({ mode, theme });
      },
    }),
    {
      name: STORAGE_KEY,
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
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const theme = resolveTheme(state.mode);
        applyTheme(theme);

        if (state.mode === "system") {
          watchSystemTheme((next) => {
            applyTheme(next);
            useThemeStore.setState({ theme: next });
          });
        }

        useThemeStore.setState({ theme });
      },
    },
  ),
);
