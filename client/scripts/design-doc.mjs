#!/usr/bin/env node
/**
 * Keeps the token half of `Design.md` in step with `src/index.css`.
 *
 * The stylesheet is the source of truth: every `--token: value;` in `:root` is a
 * documented token, every override in `.light` is a documented light value, and
 * the two font families come from the `@theme` block. This rewrites those parts
 * of the design doc from the CSS and leaves the rest — the type scale, radii,
 * spacing, motion and component recipes — exactly as written, because none of
 * that is derivable from a stylesheet.
 *
 * Run: node scripts/design-doc.mjs            rewrite Design.md in place
 *      node scripts/design-doc.mjs --check    exit 1 if it is out of date
 *      node scripts/design-doc.mjs --dry-run  show the diff, write nothing
 *
 * Wired as: npm run design:doc
 */
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const CLIENT = resolve(new URL("..", import.meta.url).pathname);
const CSS = resolve(CLIENT, "src/index.css");
const DOC = resolve(CLIENT, "..", "/client/Design.md");

const check = process.argv.includes("--check");
const dryRun = process.argv.includes("--dry-run");

/* ── read a file, with a message that says what is actually wrong ───────── */

function readText(path, label) {
  const stats = statSync(path, { throwIfNoEntry: false });
  if (!stats) {
    console.error(`${label} not found at ${path}`);
    console.error("Point the script at it, or create it.");
    process.exit(1);
  }
  if (stats.isDirectory()) {
    console.error(`${label} is a directory, not a file: ${path}`);
    console.error(
      `Something created a folder with that name — \`rmdir ${path}\` (or \`rm -rf\` ` +
        "if it has contents) and put the file there instead.",
    );
    process.exit(1);
  }
  return readFileSync(path, "utf8");
}

/* ── read the stylesheet ───────────────────────────────────────────────── */

const css = readText(CSS, "src/index.css");

function block(selector) {
  const re = new RegExp(`^${selector}\\s*\\{([\\s\\S]*?)^\\}`, "m");
  const match = re.exec(css);
  return match ? match[1] : "";
}

function tokensOf(text) {
  const out = new Map();
  for (const match of text.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    out.set(match[1], match[2].trim().replace(/\s+/g, " "));
  }
  return out;
}

const dark = tokensOf(block(":root"));
const light = tokensOf(block(".light"));
const theme = tokensOf(block("@theme"));

if (dark.size === 0) {
  console.error("no tokens found in :root — is src/index.css where I think it is?");
  process.exit(1);
}

/* ── read the doc ──────────────────────────────────────────────────────── */

const doc = readText(DOC, "Design.md");

/** The indented entries of one top-level block, as [name, value] pairs. */
function readSection(source, key) {
  const header = `\n${key}:\n`;
  const at = source.indexOf(header);
  if (at === -1) return null;
  const bodyStart = at + header.length;
  const rest = source.slice(bodyStart);
  const endRel = rest.search(/^[a-z]/m);
  const bodyEnd = endRel === -1 ? source.length : bodyStart + endRel;
  const body = source.slice(bodyStart, bodyEnd);
  const entries = [...body.matchAll(/^ {2}([a-z0-9-]+):\s*(.*)$/gm)].map((m) => [
    m[1],
    m[2].trim(),
  ]);
  // start points at the key itself; end at the first character of the next one
  return { start: at + 1, end: bodyEnd, entries };
}

const quote = (value) => `'${value.replace(/'/g, "''")}'`;

/** Rewrite one block: keep the doc's order, add new tokens, drop dead ones. */
function renderSection(key, source, changes) {
  const entries = source ? source.entries.map(([name]) => name) : [];
  const names = [
    ...entries.filter((name) => dark.has(name) || (key === "light" && light.has(name))),
    ...[...dark.keys()].filter((name) => !entries.includes(name)).sort(),
  ];
  const unique = [...new Set(names)].filter((name) =>
    key === "light" ? light.has(name) : dark.has(name),
  );

  const lines = unique.map((name) => {
    const value = key === "light" ? light.get(name) : dark.get(name);
    const previous = source?.entries.find(([n]) => n === name)?.[1];
    if (previous !== undefined && previous !== quote(value)) {
      changes.push(`${key}.${name}: ${previous} → ${quote(value)}`);
    }
    return `  ${name}: ${quote(value)}`;
  });

  if (source) {
    for (const [name] of source.entries) {
      const exists = key === "light" ? light.has(name) : dark.has(name);
      if (!exists) changes.push(`${key}.${name}: removed (no longer in the stylesheet)`);
    }
  }
  for (const name of unique) {
    if (!source?.entries.some(([n]) => n === name)) changes.push(`${key}.${name}: added`);
  }

  return `${key}:\n${lines.join("\n")}\n`;
}

/* ── rewrite ───────────────────────────────────────────────────────────── */

const changes = [];
let next = doc;

for (const key of ["colors", "light"]) {
  const section = readSection(next, key);
  const replacement = renderSection(key, section, changes);
  next = section
    ? next.slice(0, section.start) + replacement + next.slice(section.end)
    : next.replace(/\n---\n/, `\n${replacement}---\n`);
}

/* font families live in the front matter as prose values, not tokens */
for (const [token, field] of [
  ["font-sans", "font-ui"],
  ["font-mono", "font-mono"],
]) {
  const family = theme.get(token);
  if (!family) continue;
  const re = new RegExp(`(  ${field}:\\n    fontFamily: )"[^"]*"`);
  if (re.test(next)) {
    const value = family.replace(/"/g, '\\"');
    next = next.replace(re, `$1"${value}"`);
  }
}

/* ── report ────────────────────────────────────────────────────────────── */

if (changes.length === 0) {
  console.log("Design.md is in step with index.css — nothing to write");
  process.exit(0);
}

console.log(
  `${changes.length} change(s)${check ? "" : dryRun ? " (dry run)" : ""}:`,
);
for (const change of changes) console.log(`   ${change}`);

if (check) {
  console.error("\nDesign.md is out of date — run: npm run design:doc");
  process.exit(1);
}
if (!dryRun) {
  writeFileSync(DOC, next);
  console.log(`\nwrote ${DOC}`);
}
