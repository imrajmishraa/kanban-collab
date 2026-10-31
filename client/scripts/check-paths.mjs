#!/usr/bin/env node
/**
 * Fails when a file sits somewhere the structure says it should not, or when an
 * import crosses a boundary the structure says is closed.
 *
 * The model is docs/file-structure.md: pages mirror the routes, features own
 * their internals and expose a public `index.ts`, and the shared buckets hold
 * what two or more areas genuinely need.
 *
 * What it checks:
 *   orphan          nothing imports it
 *   boundary        an import reaches past a feature's `index.ts`
 *   shared-in-feature  a file inside a feature is imported from another area
 *   multi           a .tsx exports more than one component
 *   naming          a .tsx file is not PascalCase
 *   depth           a file sits more than DEPTH folders under src/
 *
 * Run: node scripts/check-paths.mjs
 *      node scripts/check-paths.mjs --strict           exit 1 on new findings
 *      node scripts/check-paths.mjs --write-baseline   record today's findings
 *      node scripts/check-paths.mjs --graph            dump the import graph
 * Wired as: npm run lint:paths
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const ROOT = resolve(new URL("../src", import.meta.url).pathname);
const BASELINE_FILE = resolve(
  new URL("./paths-baseline.json", import.meta.url).pathname,
);

/** A file may be at most this many folders under src/ — except pages, where the
 *  URL decides the depth. */
const DEPTH = 4;

/* Buckets that are mounted or consumed from outside, never owned by a feature.
   A file here is exempt from the orphan rule and never "in the wrong feature". */
const LAYERS = [
  "app/",
  "layouts/",
  "pages/",
  "services/",
  "lib/",
  "validations/",
];

const ALIASES = [
  ["@components/", "components/"],
  ["@validations/", "validations/"],
  ["@hooks/", "hooks/"],
  ["@app/", "app/"],
  ["@api/", "api/"],
  ["@/", ""],
];

const strict = process.argv.includes("--strict");
const writeBaseline = process.argv.includes("--write-baseline");
const dumpGraph = process.argv.includes("--graph");

/* ── collect files ─────────────────────────────────────────────────────── */

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

/* ── resolve an import specifier to a file in src/ ─────────────────────── */

function resolveSpec(spec, from) {
  let base = null;
  for (const [alias, target] of ALIASES) {
    if (spec.startsWith(alias)) {
      base = join(ROOT, target + spec.slice(alias.length));
      break;
    }
  }
  if (base === null) {
    if (!spec.startsWith(".")) return null; // package import
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

const STATIC = /(?:from\s*)["']([^"']+)["']/g;
const DYNAMIC = /import\s*\(\s*["']([^"']+)["']\s*\)/g;

const importers = new Map(); // file -> Set(importers)
for (const file of files) {
  const source = readFileSync(file, "utf8");
  /* Both forms count as an importer: a lazily loaded section is still used, and
     leaving it out made 19 live marketing components look dead. */
  for (const pattern of [STATIC, DYNAMIC]) {
    for (const match of source.matchAll(pattern)) {
      const target = resolveSpec(match[1], file);
      if (!target || target === file) continue;
      if (!importers.has(target)) importers.set(target, new Set());
      importers.get(target).add(file);
    }
  }
}

/* ── areas ─────────────────────────────────────────────────────────────── */

const featureOf = (p) => {
  const r = rel(p);
  return r.startsWith("features/") ? r.split("/")[1] : null;
};
/** Mount points. They may import from any feature (through its barrel); that
 *  does not make the feature's files shared. */
const SHELL = new Set(["app", "pages", "layouts"]);

/** Which area a file belongs to: a feature name, or the bucket it lives in. */
function areaOf(p) {
  const feature = featureOf(p);
  if (feature) return feature;
  const bucket = rel(p).split("/")[0];
  return SHELL.has(bucket) ? "shell" : bucket;
}
const isLayer = (p) => LAYERS.some((l) => rel(p).startsWith(l));
const isBarrel = (p) => rel(p).endsWith("/index.ts") && featureOf(p) !== null;
const isPage = (p) => rel(p).startsWith("pages/");

/* ── rules ─────────────────────────────────────────────────────────────── */

const findings = [];
const add = (rule, file, detail, hint) =>
  findings.push({ rule, file: rel(file), detail, hint });

for (const file of files) {
  const users = [...(importers.get(file) ?? [])];
  const name = rel(file).split("/").pop();
  const feature = featureOf(file);

  const source = file.endsWith(".tsx") ? readFileSync(file, "utf8") : "";
  const declaresComponent =
    file.endsWith(".tsx") &&
    /export\s+(default\s+)?(function|const)\s+[A-Z]/.test(source);

  /* naming — only files that declare a component are named after it */
  if (declaresComponent && !/^[A-Z][A-Za-z0-9]*\.tsx$/.test(name)) {
    add(
      "naming",
      file,
      `${name} is not PascalCase`,
      name.startsWith("use")
        ? "hooks are useThing.ts — rename unless it really renders"
        : "rename to PascalCase.tsx",
    );
  }

  /* multi */
  if (file.endsWith(".tsx")) {
    const exported = new Set();
    for (const m of source.matchAll(
      /export\s+(?:default\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9]*)/g,
    ))
      exported.add(m[1]);
    if (exported.size > 1) {
      add(
        "multi",
        file,
        `${exported.size} components in one file (${[...exported].join(", ")})`,
        "one component per file",
      );
    }
  }

  /* depth — pages are exempt, the URL decides their depth */
  if (!isPage(file)) {
    const depth = rel(file).split("/").length - 1;
    if (depth > DEPTH) {
      add("depth", file, `${depth} folders under src/`, `limit is ${DEPTH}`);
    }
  }

  /* orphan — layers, pages, barrels and tests have no importer by design */
  const isTest = /\.test\.tsx?$/.test(name);
  const isEntry = rel(file) === "main.tsx"; // mounted by index.html
  if (
    users.length === 0 &&
    !isLayer(file) &&
    !isBarrel(file) &&
    !isTest &&
    !isEntry
  ) {
    add("orphan", file, "nothing imports it", "delete it or give it an owner");
  }

  /* shared-in-feature — used from another area, so it is not that feature's.
     A barrel is the exception: being imported from outside is its whole job. */
  if (feature && !isBarrel(file)) {
    const foreign = new Set(
      users.map(areaOf).filter((a) => a !== feature && a !== "shell"),
    );
    if (foreign.size > 0) {
      add(
        "shared-in-feature",
        file,
        `imported from ${[...foreign].join(", ")} but lives in ${feature}`,
        "move it to a shared bucket, or keep it internal",
      );
    }
  }
}

/* boundary — static imports from outside a feature must go through its index.ts.
   Dynamic imports are exempt: a lazily loaded section keeps its own chunk, and
   routing it through the barrel would pull the whole feature in. */
for (const file of files) {
  const source = readFileSync(file, "utf8");
  const own = featureOf(file);
  for (const match of source.matchAll(STATIC)) {
    const spec = match[1];
    const deep = /^@\/features\/([^/]+)\/./.exec(spec);
    if (!deep) continue;
    if (deep[1] === own) continue; // internal
    add(
      "boundary",
      file,
      `reaches into features/${deep[1]} past its index.ts`,
      `import from "@/features/${deep[1]}" instead`,
    );
  }
}

/* ── optional: dump the resolved graph for other tooling ───────────────── */

if (dumpGraph) {
  const out = {
    files: files.map(rel).sort(),
    users: Object.fromEntries(
      [...importers].map(([f, u]) => [rel(f), [...u].map(rel).sort()]),
    ),
  };
  writeFileSync(
    "/scratch/work/graph.json",
    `${JSON.stringify(out, null, 1)}\n`,
  );
  console.log(
    `graph: ${out.files.length} files, ${Object.keys(out.users).length} with importers`,
  );
  process.exit(0);
}

/* ── report ────────────────────────────────────────────────────────────── */

const key = (f) => `${f.rule}:${f.file}`;
const baseline = new Set(
  writeBaseline || !statSync(BASELINE_FILE, { throwIfNoEntry: false })
    ? []
    : JSON.parse(readFileSync(BASELINE_FILE, "utf8")),
);

if (writeBaseline) {
  const keys = [...new Set(findings.map(key))].sort();
  writeFileSync(BASELINE_FILE, `${JSON.stringify(keys, null, 2)}\n`);
  console.log(`paths: baseline written with ${keys.length} findings`);
  process.exit(0);
}

const ORDER = [
  "boundary",
  "shared-in-feature",
  "multi",
  "naming",
  "depth",
  "orphan",
];
findings.sort(
  (a, b) =>
    ORDER.indexOf(a.rule) - ORDER.indexOf(b.rule) ||
    a.file.localeCompare(b.file),
);

const fresh = findings.filter((f) => !baseline.has(key(f)));
const counts = new Map();
for (const f of findings) counts.set(f.rule, (counts.get(f.rule) ?? 0) + 1);

if (findings.length === 0) {
  console.log("paths: clean");
  process.exit(0);
}

for (const f of findings) {
  const tag = baseline.has(key(f)) ? " (baselined)" : "";
  console.log(`${f.rule.padEnd(17)} ${f.file}${tag}`);
  console.log(`${" ".repeat(18)}${f.detail} — ${f.hint}`);
}

console.log(
  `\npaths: ${findings.length} findings in ${new Set(findings.map((f) => f.file)).size} files — ` +
    [...counts].map(([rule, n]) => `${n} ${rule}`).join(", "),
);
console.log(
  fresh.length === 0
    ? "no new findings against the baseline"
    : `${fresh.length} not in the baseline`,
);

process.exit(strict && fresh.length > 0 ? 1 : 0);
