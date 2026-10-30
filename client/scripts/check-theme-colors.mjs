#!/usr/bin/env node
/**
 * Fails when a raw colour utility appears in the client.
 *
 * The app is themed with tokens: `bg-(--bg-surface)`, `text-(--text-muted)`,
 * `border-(--hairline)` and so on. Every one of those flips between the dark
 * and light palettes in `src/index.css`. A raw utility does not, which is how
 * a screen ends up unreadable in one of the two themes.
 *
 * Run: node scripts/check-theme-colors.mjs
 * Wired as: npm run lint:colors
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("../src", import.meta.url).pathname;

const PALETTE = [
  "white", "black", "neutral", "stone", "zinc", "gray", "slate",
  "orange", "amber", "yellow", "rose", "red", "emerald", "green",
  "sky", "blue", "indigo", "violet", "purple", "pink",
];

const UTILITIES = ["bg", "text", "border", "from", "via", "to", "ring", "fill", "stroke", "divide", "outline"];

const PATTERNS = [
  {
    // bg-white/6, text-neutral-400, border-orange-50/15
    regex: new RegExp(`\\b(?:${UTILITIES.join("|")})-(?:${PALETTE.join("|")})-\\d{2,3}(?:/\\d+)?\\b`, "g"),
    why: "raw palette utility; use a token",
  },
  {
    // bg-white/6 without a palette step
    regex: /\b(?:bg|text|border|ring|fill|stroke)-white\/[\d.]+\b/g,
    why: "raw white wash; use --tint-N",
  },
  {
    // bg-[#141416], border-[#E4E6E9]
    regex: new RegExp(`\\b(?:${UTILITIES.join("|")})-\\[#[0-9a-fA-F]{3,8}\\]`, "g"),
    why: "hardcoded hex; use a token",
  },
  {
    // bg-(var(--x)) does not resolve in Tailwind v4
    regex: /\b(?:bg|text|border|ring|fill|stroke)-\(var\(/g,
    why: "malformed token shorthand; write bg-(--token)",
  },
];

/* Files allowed to break the rule, with the reason. Keep this list short and
   argue each entry; it is the escape hatch, not the norm. */
const ALLOW = [];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|css)$/.test(entry)) out.push(full);
  }
  return out;
}

const findings = [];

for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file);
  const source = readFileSync(file, "utf8");
  const lines = source.split("\n");

  for (const { regex, why } of PATTERNS) {
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(line)) !== null) {
        const allowed = ALLOW.some((entry) => rel.endsWith(entry.file) && entry.pattern.test(match[0]));
        if (allowed) continue;
        findings.push({ file: rel, line: i + 1, found: match[0], why });
      }
    }
  }
}

if (findings.length === 0) {
  console.log("theme colours: clean");
  process.exit(0);
}

const byFile = new Map();
for (const finding of findings) {
  const list = byFile.get(finding.file) ?? [];
  list.push(finding);
  byFile.set(finding.file, list);
}

console.error(`theme colours: ${findings.length} raw colour utilities in ${byFile.size} files\n`);
for (const [file, list] of [...byFile.entries()].sort()) {
  console.error(`  ${file}`);
  for (const finding of list.slice(0, 6)) {
    console.error(`    ${finding.line}: ${finding.found}  (${finding.why})`);
  }
  if (list.length > 6) console.error(`    ... ${list.length - 6} more`);
}
console.error("\nEvery surface, edge and text colour must come from src/index.css.");
process.exit(1);
