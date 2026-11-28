#!/usr/bin/env node
/**
 * Every relative link in `docs/` and the root markdown resolves.
 *
 * The pages in this repository point at each other constantly — a pattern page
 * at a rule, a workflow at a pattern, `AGENTS.md` at both. Nothing checks those
 * links, and a moved file leaves a reader following a path that no longer
 * exists. That is the drift that put `client/src/index.css` in a page about a
 * theme block that lives in `client/src/styles/theme.css`.
 *
 * What it checks:
 *   docs/link      a relative link points at a file that does not exist
 *   docs/unlisted  a page under docs/ is not linked from docs/README.md (warn)
 *
 * Run: node scripts/check-docs-links.mjs
 *      node scripts/check-docs-links.mjs --strict    exit 1 on findings
 * Wired as: a step in the `agents` job of .github/workflows/ci-cd.yml
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const strict = process.argv.includes("--strict");

const findings = [];
const warnings = [];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

const docsFiles = existsSync(join(ROOT, "docs")) ? walk(join(ROOT, "docs")) : [];
const rootFiles = readdirSync(ROOT)
  .filter((name) => name.endsWith(".md"))
  .map((name) => join(ROOT, name));

const LINK = /\]\(([^)\s]+)\)/g;

for (const file of [...docsFiles, ...rootFiles]) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(LINK)) {
    const target = match[1];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const [pathPart] = target.split("#");
    if (!pathPart) continue;

    const resolved = resolve(dirname(file), pathPart);
    if (!existsSync(resolved)) {
      findings.push({
        id: "docs/link",
        where: relative(ROOT, file),
        message: `→ ${target} does not resolve`,
      });
    }
  }
}

/* A page nobody can reach from the index is a page nobody reads. Reachability,
   not a direct link: `agents/README.md` is linked from the index and carries the
   rest, which is the shape this folder is built on. */
const index = join(ROOT, "docs/README.md");
if (existsSync(index)) {
  const edges = new Map();
  for (const file of [...docsFiles, ...rootFiles]) {
    const text = readFileSync(file, "utf8");
    const targets = [];
    for (const match of text.matchAll(LINK)) {
      const target = match[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const [pathPart] = target.split("#");
      if (!pathPart) continue;
      targets.push(resolve(dirname(file), pathPart));
    }
    edges.set(file, targets);
  }

  const seen = new Set([index]);
  const queue = [index];
  while (queue.length) {
    for (const next of edges.get(queue.shift()) ?? []) {
      if (!seen.has(next) && existsSync(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }

  for (const file of docsFiles) {
    if (!seen.has(file)) {
      warnings.push(`${relative(join(ROOT, "docs"), file)} is unreachable from docs/README.md`);
    }
  }
}

console.log(
  `docs links: ${docsFiles.length + rootFiles.length} files scanned, ` +
    `${findings.length} broken, ${warnings.length} unlisted`,
);
for (const finding of findings) {
  console.log(`  ${finding.id.padEnd(14)} ${finding.where} ${finding.message}`);
}
for (const warning of warnings.slice(0, 5)) {
  console.log(`  warn           ${warning}`);
}
if (warnings.length > 5) console.log(`  warn           … and ${warnings.length - 5} more`);

if (strict && findings.length > 0) process.exit(1);
