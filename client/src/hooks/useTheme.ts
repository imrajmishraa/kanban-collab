import { useThemeStore } from "@/stores/theme";

/**
 * The theme, as the app sees it.
 *
 * Read-only on purpose. `installThemeMatcher()` in `main.tsx` is the one place
 * that writes `<html>`, so a component calling this can re-render on a change
 * but can never start a second writer or a second OS listener — which is
 * exactly what this hook used to do from `AuthLayout` and `GuestRoute`.
 *
 * It returns `setMode` so a control can still ask for a change; that call goes
 * through the store, not through here.
 */
export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const theme = useThemeStore((state) => state.theme);
  const setMode = useThemeStore((state) => state.setMode);

  return { mode, theme, setMode };
}
