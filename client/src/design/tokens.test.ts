/// <reference types="node" />
// This suite reads index.css and design.md off disk, so it needs the Node
// types. The app project deliberately does not include them (they would put
// `process` and `Buffer` in scope for browser code); this reference pulls them
// in for this file only.
import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * The design system's contract, checked against its own documentation.
 *
 * `design.md` publishes the token set, the type scale and 27 component recipes,
 * and `src/index.css` is where those tokens actually live. Nothing keeps the two
 * in step, so they drift the moment someone adds a token in a hurry — which is
 * how a design doc becomes a historical document. These tests make the doc
 * executable: if the code and the document disagree, this file fails.
 *
 * It also checks the accessibility claims in the doc's table, so the numbers
 * there are measured rather than remembered.
 */

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

/* The token spec lives at the repo root, one level above `client/`. Accept it
   beside the client too, so moving it does not break the contract test — and say
   plainly what is missing rather than dying on an ENOENT deep in an import. */
/* One canonical location, no fallback. A second candidate used to let a stale
   copy win — `client/Design.md`, which on a case-insensitive filesystem is the
   same path as `client/design.md`. One path, one file, same answer everywhere. */
const designPath = ((): URL => {
  const url = new URL("../../../design.md", import.meta.url);
  if (!existsSync(url)) {
    throw new Error(
      `design.md not found at ${url.pathname}. This suite checks the token spec ` +
        "against index.css, so it needs the spec at the repo root, one level " +
        "above client/. Add the file, or delete this test if the spec is not " +
        "being kept.",
    );
  }
  return url;
})();

const design = readFileSync(designPath, "utf8").replace(/^\uFEFF/, "");

/* ── index.css ─────────────────────────────────────────────────────────── */

/** `--token: value;` pairs from one rule block, e.g. `:root { … }`. */
function block(source: string, selector: string): Map<string, string> {
  const start = source.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`no ${selector} block in index.css`);
  const body = source.slice(start, source.indexOf("\n}", start));
  const tokens = new Map<string, string>();
  for (const m of body.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) {
    tokens.set(m[1], m[2].trim());
  }
  return tokens;
}

const dark = block(css, ":root");
const light = block(css, ".light");

/* ── design.md ─────────────────────────────────────────────────────────── */

/** The lines of a top-level `key:` block, as `name -> value`. */
function section(name: string): Map<string, string> {
  const start = design.indexOf(`\n${name}:\n`);
  if (start === -1) {
    throw new Error(
      `no ${name}: block in the design doc it read — ${designPath.pathname} ` +
        `(${design.length} bytes, first line: ${JSON.stringify(design.split("\n")[0])})`,
    );
  }
  const rest = design.slice(start + name.length + 3);
  const end = rest.search(/\n[a-z]+:\n/);
  const body = end === -1 ? rest : rest.slice(0, end);
  const entries = new Map<string, string>();
  for (const m of body.matchAll(/^ {2}([\w-]+):\s*(.*)$/gm)) {
    entries.set(m[1], m[2].trim().replace(/^'|'$/g, ""));
  }
  /* An empty section means the doc that was read is not the token spec: the
     block header matched, the entries did not. Naming the file beats a
     forty-seven-line diff of two documents that were never meant to agree. */
  if (entries.size === 0) {
    throw new Error(
      `the ${name}: block in the design doc parsed to nothing — read ` +
        `${designPath.pathname} (${design.length} bytes). Is this the token spec, ` +
        "or an older copy of it?",
    );
  }
  return entries;
}

const docColors = section("colors");
const docLight = section("light");
const docRounded = section("rounded");
const docTypography = section("typography");

/** Every `'{colors.x}'` / `'{typography.x}'` / `'{rounded.x}'` in the recipes. */
function recipeRefs(): Array<{ group: string; key: string }> {
  const start = design.indexOf("\ncomponents:\n");
  const body = design.slice(start);
  return [...body.matchAll(/'\{(\w+)\.([\w-]+)[^}]*\}'/g)].map((m) => ({
    group: m[1],
    key: m[2],
  }));
}

/* ── colour maths ──────────────────────────────────────────────────────── */

type Rgb = [number, number, number];

function parseColour(value: string): Rgb | null {
  const rgb = /^rgba?\(([^)]+)\)$/.exec(value);
  if (rgb) {
    const parts = rgb[1].split(",").map((p) => parseFloat(p));
    if (parts.length > 3 && parts[3] < 1) return null; // translucent: no ratio
    return [parts[0], parts[1], parts[2]];
  }
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) {
    return [
      parseInt(hex[1].slice(0, 2), 16),
      parseInt(hex[1].slice(2, 4), 16),
      parseInt(hex[1].slice(4, 6), 16),
    ];
  }
  return null;
}

function luminance([r, g, b]: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const one = parseColour(a);
  const two = parseColour(b);
  if (!one || !two) throw new Error(`cannot measure ${a} on ${b}`);
  const [hi, lo] = [luminance(one), luminance(two)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const ratio = (token: string, theme: "dark" | "light") => {
  const tokens = theme === "dark" ? dark : light;
  const page = theme === "dark" ? "rgb(0, 0, 0)" : "rgb(250, 250, 250)";
  return contrast(tokens.get(token) ?? "", page);
};

/* ── the contract ──────────────────────────────────────────────────────── */

describe("design.md mirrors index.css", () => {
  it("documents every token the dark theme defines", () => {
    const undocumented = [...dark.keys()].filter(
      (token) => !docColors.has(token.replace(/^--/, "")),
    );
    expect(undocumented).toEqual([]);
  });

  it("documents every token the light theme overrides", () => {
    const undocumented = [...light.keys()].filter(
      (token) => !docLight.has(token.replace(/^--/, "")),
    );
    expect(undocumented).toEqual([]);
  });

  it("quotes the same dark value the stylesheet defines", () => {
    const wrong = [...dark].filter(
      ([token, value]) => docColors.get(token.replace(/^--/, "")) !== value,
    );
    expect(wrong).toEqual([]);
  });

  it("quotes the same light value the stylesheet defines", () => {
    const wrong = [...light].filter(
      ([token, value]) => docLight.get(token.replace(/^--/, "")) !== value,
    );
    expect(wrong).toEqual([]);
  });

  it("has no token that only one theme defines", () => {
    const darkOnly = [...dark.keys()].filter(
      (token) => token !== "--color-scheme" && !light.has(token),
    );
    // The two themes must stay comparable: a token defined in one and not the
    // other is how a screen ends up unstyled in the theme nobody tested.
    expect(darkOnly).toEqual([]);
  });

  it("resolves every token a component recipe refers to", () => {
    const groups: Record<string, Map<string, string>> = {
      colors: docColors,
      typography: docTypography,
      rounded: docRounded,
    };
    const dangling = recipeRefs().filter(
      (ref) => !groups[ref.group]?.has(ref.key),
    );
    expect(dangling).toEqual([]);
  });

  it("names only tokens that exist for the recipes to use", () => {
    const known = new Set([...docColors.keys()].map((k) => `--${k}`));
    const refs = recipeRefs().filter((r) => r.group === "colors");
    const invented = refs.filter((r) => !known.has(`--${r.key}`));
    expect(invented).toEqual([]);
  });
});

describe("the accessibility table is measured, not remembered", () => {
  it("keeps primary and secondary text well clear of AA", () => {
    for (const theme of ["dark", "light"] as const) {
      expect(ratio("--text-primary", theme)).toBeGreaterThan(7);
      expect(ratio("--text-soft", theme)).toBeGreaterThan(4.5);
    }
  });

  it("keeps --text-subtle below AA, which is why it is placeholders only", () => {
    for (const theme of ["dark", "light"] as const) {
      // The bar is AA, not an arbitrary 3: subtle only has to be unusable for
      // content, and the current dark value sits at 3.0.
      expect(ratio("--text-subtle", theme)).toBeLessThan(4.5);
    }
  });

  it("fails the moment --text-muted is fixed, so the doc gets updated", () => {
    // design.md records this as a known gap: 4.23:1 in light. When someone
    // darkens the token to rgb(115) the ratio clears 4.5 and this test turns
    // red, which is the reminder to delete the paragraph that documents it.
    expect(ratio("--text-muted", "dark")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("--text-muted", "light")).toBeLessThan(4.5);
  });

  it("never lets the brand colour carry text in light", () => {
    // The doc's rule: #ff6b35 is 2.72:1 on the light page, so the light block
    // swaps to the deep amber. If the swap is removed, this fails.
    expect(ratio("--brand", "light")).toBeGreaterThan(4.5);
    expect(contrast("#ff6b35", "rgb(250, 250, 250)")).toBeLessThan(3);
  });
});
