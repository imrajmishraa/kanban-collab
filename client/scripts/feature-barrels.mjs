#!/usr/bin/env node
/**
 * Generates the feature barrels and flips cross-feature imports onto them.
 *
 * A feature's `index.ts` re-exports exactly what code outside the feature
 * imports — the public surface, nothing more. Outside imports are then rewritten
 * to `@/features/<feature>`, so the barrel is the only way in.
 *
 * It reads your tree as it is, so it works whatever state it is in and is safe
 * to run twice: the second run finds nothing left to flip.
 *
 * Lazily loaded sections are left on their deep path on purpose — routing them
 * through the barrel would pull the whole feature into one chunk.
 *
 * Run: node scripts/feature-barrels.mjs
 *      node scripts/feature-barrels.mjs --dry-run
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const ROOT = resolve(new URL("../src", import.meta.url).pathname);
const dryRun = process.argv.includes("--dry-run");

const ALIASES = [
  ["@components/", "components/"],
  ["@validations/", "validations/"],
  ["@hooks/", "hooks/"],
  ["@app/", "app/"],
  ["@api/", "api/"],
  ["@/", ""],
];

/* A specifier and the clause in front of it. The clause is kept verbatim except
   for a default import, which the barrel exposes as a named export. */
const IMPORT =
  /import\s+(type\s+)?([\s\S]*?)\s+from\s+(["'])([^"']+)\3;?/g;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const files = walk(ROOT);
const known = new Set(files);
const rel = (p) => relative(ROOT, p).split(sep).join("/");

function resolveSpec(spec, from) {
  let base = null;
  for (const [alias, target] of ALIASES) {
    if (spec.startsWith(alias)) {
      base = join(ROOT, target + spec.slice(alias.length));
      break;
    }
  }
  if (base === null) {
    if (!spec.startsWith(".")) return null;
    base = resolve(dirname(from), spec);
  }
  for (const candidate of [
    `${base}.tsx`,
    `${base}.ts`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
    base,
  ]) {
    if (known.has(candidate)) return candidate;
  }
  return null;
}

const featureOf = (p) => {
  const r = rel(p);
  return r.startsWith("features/") ? r.split("/")[1] : null;
};

/* ── 1. what does the outside world import from each feature? ───────────── */

const publicSurface = new Map(); // feature -> Map(file -> Set("name" | "type:name"))
const edits = []; // { file, spec, feature, clause }

for (const file of files) {
  const own = featureOf(file);
  const source = readFileSync(file, "utf8");
  for (const m of source.matchAll(IMPORT)) {
    const typeOnly = Boolean(m[1]);
    const clause = m[2].trim();
    const spec = m[4];
    const target = resolveSpec(spec, file);
    if (!target) continue;
    const feature = featureOf(target);
    if (!feature || feature === own) continue;
    /* The barrel itself is not a target: once imports point at it, a second run
       would otherwise write `export … from "./index"` — a self-export that
       collapses the whole surface into one circular line. */
    if (rel(target) === `features/${feature}/index.ts`) continue;
    if (clause.startsWith("*")) continue; // namespace import: leave it

    const parts = [];
    const isDefaultClause = !clause.startsWith("{");
    if (!isDefaultClause) {
      for (let p of clause.replace(/^\{|\}$/g, "").split(",")) {
        p = p.trim();
        if (!p) continue;
        const isType = typeOnly || p.startsWith("type ");
        if (p.startsWith("type ")) p = p.slice(5).trim();
        const local = p.split(" as ").pop().trim();
        parts.push({ local, isType });
      }
    } else {
      parts.push({
        local: clause.split(" as ").pop().trim(),
        isType: typeOnly,
        isDefault: true,
      });
    }
    if (parts.length === 0) continue;

    if (!publicSurface.has(feature)) publicSurface.set(feature, new Map());
    const surface = publicSurface.get(feature);
    if (!surface.has(target)) surface.set(target, new Set());
    for (const part of parts) {
      const tag = part.isType ? "type" : part.isDefault ? "default" : "value";
      surface.get(target).add(`${tag}:${part.local}`);
    }
    edits.push({ file, spec, feature, clause });
  }
}

/* ── 2. write the barrels ──────────────────────────────────────────────── */

const written = [];
for (const feature of [...publicSurface.keys()].sort()) {
  const surface = publicSurface.get(feature);
  const lines = [
    "/**",
    ` * Public API of the \`${feature}\` feature.`,
    " *",
    " * Only what code outside this folder imports. Everything else is internal:",
    " * use a relative path from inside the feature, and add to this list only",
    " * when something outside genuinely needs it.",
    " */",
  ];
  for (const file of [...surface.keys()].sort()) {
    const relPath = rel(file).slice(`features/${feature}/`.length).replace(/\.tsx?$/, "");
    const names = [...surface.get(file)];
    const values = names.filter((n) => n.startsWith("value:")).map((n) => n.slice(6)).sort();
    const defaults = names.filter((n) => n.startsWith("default:")).map((n) => n.slice(8)).sort();
    const types = names.filter((n) => n.startsWith("type:")).map((n) => n.slice(5)).sort();
    if (values.length) lines.push(`export { ${values.join(", ")} } from "./${relPath}";`);
    // A default export has no name of its own; the barrel gives it one.
    for (const name of defaults) {
      lines.push(`export { default as ${name} } from "./${relPath}";`);
    }
    if (types.length) lines.push(`export type { ${types.join(", ")} } from "./${relPath}";`);
  }
  const out = join(ROOT, "features", feature, "index.ts");
  if (!dryRun) writeFileSync(out, `${lines.join("\n")}\n`);
  written.push(rel(out));
}

/* ── 3. flip the imports onto the barrels ──────────────────────────────── */

const byFile = new Map();
for (const edit of edits) {
  if (!byFile.has(edit.file)) byFile.set(edit.file, []);
  byFile.get(edit.file).push(edit);
}

let flipped = 0;
for (const [file, items] of byFile) {
  let source = readFileSync(file, "utf8");
  for (const { spec, feature, clause } of items) {
    const anchor = `from "${spec}"`;
    const at = source.indexOf(anchor);
    if (at === -1) continue;
    const head = source.slice(0, at);
    const next = `from "@/features/${feature}"`;
    if (clause.startsWith("{")) {
      // keep the clause exactly as written
      source = head + next + source.slice(at + anchor.length);
    } else {
      // a default import becomes the named export the barrel provides
      const local = clause.split(" as ").pop().trim();
      const clauseAt = head.lastIndexOf(clause);
      const replaced =
        clauseAt === -1
          ? head
          : head.slice(0, clauseAt) + `{ ${local} }` + head.slice(clauseAt + clause.length);
      source = replaced + next + source.slice(at + anchor.length);
    }
    flipped += 1;
  }
  if (!dryRun) writeFileSync(file, source);
}

console.log(
  `${dryRun ? "would write" : "wrote"} ${written.length} barrels, ` +
    `${dryRun ? "would flip" : "flipped"} ${flipped} imports`,
);
for (const w of written) console.log(`   ${w}`);
