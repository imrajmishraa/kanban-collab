// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The theme contract.
 *
 * One rule for the whole client: a stored choice wins, and with nothing stored
 * the OS decides and keeps deciding. These tests pin that rule, the class names
 * it writes, and the fact that `index.html`'s pre-paint script writes the same
 * ones — that script cannot import TypeScript, so it is the one place the rule
 * is written twice.
 */

const SYSTEM_QUERY = "(prefers-color-scheme: light)";

/* ── a controllable OS preference ────────────────────────────────────────
   jsdom has no `matchMedia`, and even if it did, the point of these tests is
   to move the preference while the app is running. */

let prefersLight = false;
const osListeners = new Set<() => void>();

function stubMatchMedia(): void {
  window.matchMedia = ((query: string) => ({
    /* A getter, not a snapshot: a real MediaQueryList updates `matches` in
       place, and the matcher reads it from inside the change handler. */
    get matches() {
      return query === SYSTEM_QUERY ? prefersLight : false;
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => {
      osListeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      osListeners.delete(listener);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

/** Flips the OS preference and tells whoever is listening. */
function setSystem(light: boolean): void {
  prefersLight = light;
  for (const listener of [...osListeners]) listener();
}

/* ── loading the modules fresh ───────────────────────────────────────────
   The store reads storage and the matcher keeps its teardown at module scope,
   so each test needs its own copy of both. */

async function load() {
  vi.resetModules();
  const theme = await import("../lib/theme");
  const store = await import("../stores/theme");
  return { theme, store };
}

const root = () => document.documentElement;

beforeEach(() => {
  prefersLight = false;
  osListeners.clear();
  localStorage.clear();
  root().className = "";
  root().removeAttribute("style");
  stubMatchMedia();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the matcher's rule", () => {
  it("takes the stored choice when there is one", async () => {
    localStorage.setItem(
      "kanban-theme",
      JSON.stringify({ state: { mode: "light" }, version: 1 }),
    );
    const { theme } = await load();

    expect(theme.readStoredMode()).toBe("light");
    expect(theme.resolveTheme("light")).toBe("light");
  });

  it("reads nothing as nothing, so the OS is the default", async () => {
    const { theme } = await load();

    expect(theme.readStoredMode()).toBeNull();
    expect(theme.resolveTheme("system")).toBe("dark");

    prefersLight = true;
    expect(theme.resolveTheme("system")).toBe("light");
  });

  it("reads the v0 entry, which stored `theme` and had no system", async () => {
    localStorage.setItem(
      "kanban-theme",
      JSON.stringify({ state: { theme: "light" }, version: 0 }),
    );
    const { theme } = await load();

    expect(theme.readStoredMode()).toBe("light");
  });

  it("treats a corrupt entry as nothing stored", async () => {
    localStorage.setItem("kanban-theme", "{not json");
    const { theme } = await load();

    expect(theme.readStoredMode()).toBeNull();
  });

  it("writes the palette class, the dark marker and colorScheme", async () => {
    const { theme } = await load();

    theme.applyTheme("light");
    expect(root().classList.contains("light-theme")).toBe(true);
    expect(root().classList.contains("dark")).toBe(false);
    expect(root().style.colorScheme).toBe("light");

    theme.applyTheme("dark");
    expect(root().classList.contains("light-theme")).toBe(false);
    expect(root().classList.contains("dark")).toBe(true);
    expect(root().style.colorScheme).toBe("dark");
  });
});

describe("installThemeMatcher", () => {
  it("follows the OS when nothing is stored", async () => {
    prefersLight = true;
    const { store } = await load();

    store.installThemeMatcher();

    expect(store.useThemeStore.getState().mode).toBe("system");
    expect(store.useThemeStore.getState().theme).toBe("light");
    expect(root().classList.contains("light-theme")).toBe(true);
  });

  it("lets a stored choice beat the OS, and stops listening to it", async () => {
    prefersLight = false;
    localStorage.setItem(
      "kanban-theme",
      JSON.stringify({ state: { mode: "light" }, version: 1 }),
    );
    const { store } = await load();

    store.installThemeMatcher();

    expect(store.useThemeStore.getState().theme).toBe("light");
    expect(root().classList.contains("light-theme")).toBe(true);

    /* The OS now disagrees. A stored choice means it has no say. */
    setSystem(false);
    expect(store.useThemeStore.getState().theme).toBe("light");
    expect(root().classList.contains("light-theme")).toBe(true);
  });

  it("hands the OS back its say when the mode returns to system", async () => {
    const { store } = await load();

    store.installThemeMatcher();
    store.useThemeStore.getState().setMode("dark");
    expect(root().classList.contains("dark")).toBe(true);

    store.useThemeStore.getState().setMode("system");
    setSystem(true);

    expect(store.useThemeStore.getState().theme).toBe("light");
    expect(root().classList.contains("light-theme")).toBe(true);
  });

  it("installs one binding however many times it is called", async () => {
    const { store } = await load();

    store.installThemeMatcher();
    store.installThemeMatcher();

    /* One listener means one callback per OS change, and nothing to unwind. */
    expect(osListeners.size).toBe(1);

    setSystem(true);
    expect(root().classList.contains("light-theme")).toBe(true);
  });

  it("releases the OS listener when torn down", async () => {
    const { store } = await load();

    const uninstall = store.installThemeMatcher();
    expect(osListeners.size).toBe(1);

    uninstall();
    expect(osListeners.size).toBe(0);
  });
});
