/// <reference types="node" />
// This suite reads index.html off disk, so it needs the Node types. Node
// environment, not jsdom: `import.meta.url` is a file URL here, and reading the
// file is the whole point.
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DARK_CLASS, LIGHT_CLASS, THEME_STORAGE_KEY } from "../lib/theme";

/**
 * The pre-paint script in `index.html`.
 *
 * That script is the one place the theme rule is written twice: it has to set
 * the class before the bundle is parsed, so it cannot import `lib/theme.ts`.
 * The two have to agree on the storage key and on the class names, or a stored
 * light preference paints dark until the store rehydrates — which is the bug
 * this file exists to keep fixed.
 *
 * The literals are read from the module rather than typed again here, so the
 * only way to break this is to change one side and not the other.
 *
 * The rule itself, and the runtime side of it, are pinned in `theme.test.ts`.
 */
const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

describe("index.html's pre-paint script", () => {
  it("reads the key the store actually writes", () => {
    expect(html).toContain(`localStorage.getItem("${THEME_STORAGE_KEY}")`);
  });

  it("writes the palette class the stylesheet actually defines", () => {
    expect(html).toContain(`classList.toggle("${LIGHT_CLASS}"`);
    expect(html).toContain(`classList.toggle("${DARK_CLASS}"`);
  });

  it("writes no bare `light` class", () => {
    /* The bug this guards: `light` is not a class any stylesheet defines, so a
       stored light preference painted dark until the store rehydrated. */
    expect(html).not.toMatch(/classList\.toggle\("light"/);
  });

  it("falls back to the OS, not to a fixed theme, when nothing is stored", () => {
    expect(html).toContain("prefers-color-scheme: light");
    expect(html).toContain('var mode = "system"');
  });

  it("sets colorScheme alongside the class", () => {
    expect(html).toContain("root.style.colorScheme = theme");
  });
});
