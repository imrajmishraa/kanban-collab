import { useEffect } from "react";

import { useThemeStore } from "@/stores/theme";

export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const theme = useThemeStore((state) => state.theme);
  const setMode = useThemeStore((state) => state.setMode);

  /* The one place that writes the class. `:root` is dark, so `.light-theme` is
     the override; `.dark` is kept for the pre-paint script and for anything
     that reads the attribute rather than the palette. */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light-theme", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  /* Nothing stored: adopt the OS, now and whenever it changes. The store does
     this too when it rehydrates; doing it here as well means the app follows
     the system even if that rehydration never happened. */
  useEffect(() => {
    if (
      mode !== "system" ||
      typeof window === "undefined" ||
      !window.matchMedia
    )
      return;

    const query = window.matchMedia("(prefers-color-scheme: light)");
    const read = () => (query.matches ? "light" : "dark");

    if (useThemeStore.getState().theme !== read()) {
      useThemeStore.setState({ theme: read() });
    }

    /* `setState` rather than `setMode`: the OS changing under us is not a
       choice, so it must not run the reveal animation. */
    const onChange = () => useThemeStore.setState({ theme: read() });
    query.addEventListener("change", onChange);

    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  return { mode, theme, setMode };
}
