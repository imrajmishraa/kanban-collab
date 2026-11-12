/**
 * The universal theme matcher — the one rule the whole client follows.
 *
 *   a theme the user stored  → that theme
 *   nothing stored           → the OS, and the OS keeps deciding
 *
 * Everything that touches `<html>` goes through `applyTheme` below, so the
 * class names exist here and nowhere else. `index.html` repeats them in its
 * pre-paint script, because that has to run before this module is parsed;
 * `design/theme.test.ts` fails if the two ever drift apart.
 *
 * This module is deliberately state-free. The store in `stores/theme.ts` holds
 * the choice, and `installThemeMatcher()` there is the only thing that calls
 * `applyTheme` in response to the OS.
 */

/** What the user picked. "system" follows the OS and keeps following it. */
export type ThemeMode = "system" | "light" | "dark";

/** What that resolves to on screen. */
export type Theme = "light" | "dark";

/** The key the pre-paint script in `index.html` reads. Both must agree. */
export const THEME_STORAGE_KEY = "kanban-theme";

/**
 * The class the light palette lives on, in `styles/tokens.css`.
 *
 * `:root` is already dark, so dark is the *absence* of this class. `DARK_CLASS`
 * is written as well, but only so `dark:` utilities and anything reading the
 * attribute have something to match — see the `@custom-variant` in index.css.
 */
export const LIGHT_CLASS = "light-theme";
export const DARK_CLASS = "dark";

const SYSTEM_QUERY = "(prefers-color-scheme: light)";

/** The OS preference right now. Dark when there is no `matchMedia` at all. */
export function systemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia(SYSTEM_QUERY).matches ? "light" : "dark";
}

/** The whole matcher, as one expression. */
export function resolveTheme(mode: ThemeMode): Theme {
  return mode === "system" ? systemTheme() : mode;
}

/**
 * Reads the persisted choice straight out of storage.
 *
 * `null` means nothing was ever stored — the one case where the OS is the
 * answer by default. Reading it here rather than from the store lets
 * `main.tsx` and the store reach the same answer before either has rendered.
 *
 * The envelope is Zustand's (`{ state: { mode }, version: 1 }`). v0 stored
 * `theme` with no notion of system, so that key is read too.
 */
export function readStoredMode(): ThemeMode | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { mode?: unknown; theme?: unknown };
    };
    const stored = parsed?.state?.mode ?? parsed?.state?.theme;
    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : null;
  } catch {
    /* Corrupt entry, or storage blocked by the browser. Not stored, then. */
    return null;
  }
}

/**
 * Writes the theme to `<html>`: the palette class, the marker class, and
 * `colorScheme` for the parts CSS cannot reach — scrollbars, autofill, the
 * date picker.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle(LIGHT_CLASS, theme === "light");
  root.classList.toggle(DARK_CLASS, theme === "dark");
  root.style.colorScheme = theme;
}

/**
 * Calls `onChange` whenever the OS preference changes.
 *
 * @returns a stop function, so a caller that leaves "system" can hand the OS
 *          back its silence instead of leaving a listener behind
 */
export function watchSystemTheme(onChange: (theme: Theme) => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const query = window.matchMedia(SYSTEM_QUERY);
  const handler = () => onChange(query.matches ? "light" : "dark");
  query.addEventListener("change", handler);
  return () => query.removeEventListener("change", handler);
}
