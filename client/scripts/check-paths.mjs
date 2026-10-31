#!/usr/bin/env node
/**
 * Fails when a component lives somewhere other than next to the code that uses
 * it. The rule is in docs/file-structure.md; this file is the mechanical half
 * of it.
 *
 * What it checks:
 *   proximity  a component with exactly one importer sits in another folder
 *   shared     a component under features/ is imported by two different features
 *   naming     a .tsx file whose basename is not PascalCase
 *   multi      a .tsx file exporting more than one component
 *   depth      a component file more than DEPTH folders under src/
 *   orphan     a component nothing imports
 *
 * Run: node scripts/check-paths.mjs
 *      node scripts/check-paths.mjs --strict           exit 1 on new findings
 *      node scripts/check-paths.mjs --write-baseline   record today's findings
 * Wired as: npm run lint:paths
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const ROOT = resolve(new URL("../src", import.meta.url).pathname);
const BASELINE_FILE = resolve(
  new URL("./paths-baseline.json", import.meta.url).pathname,
);

/** A component file may be at most this many folders under src/. */
const DEPTH = 4;

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

const SPEC = /(?:from\s*|import\s*\(\s*|require\s*\(\s*)["']([^"']+)["']/g;

const importers = new Map(); // file -> Set(importers)
for (const file of files) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(SPEC)) {
    const target = resolveSpec(match[1], file);
    if (!target || target === file) continue;
    if (!importers.has(target)) importers.set(target, new Set());
    importers.get(target).add(file);
  }
}

/* ── which files are checked, and which are a layer ────────────────────── */

/* These prefixes encode a cross-cutting contract — the backend surface, its
   DTOs, the shared validation, the app shell. Scattering them per feature would
   mean N copies of the same contract, so they are a layer, not a feature, and
   proximity does not apply to them. See R8 in docs/file-structure.md. */
const LAYERS = [
  "api/",
  "types/api/",
  "validations/",
  "lib/",
  "app/",
  "collaboration/",
];
const isLayer = (p) => LAYERS.some((l) => rel(p).startsWith(l));

const isComponentPath = (p) => {
  const r = rel(p);
  return r.startsWith("components/") || r.includes("/components/");
};
const isPage = (p) => /\/pages\/[^/]+\.tsx$/.test(rel(p));
const isSupport = (p) => /^(hooks|types|utils|stores)\//.test(rel(p));
/* A store is state, not markup: one current importer does not make it local, so
   proximity is a judgement call there and the checker only reports orphans. */
const isStore = (p) => rel(p).startsWith("stores/");
/* The app layer mounts things — routes, layouts, providers. It does not own the
   content it mounts, so it never counts as a file's parent. */
const isAppLayer = (p) => rel(p).startsWith("app/");

const checked = files.filter(
  (f) => !isLayer(f) && (isComponentPath(f) || isPage(f) || isSupport(f)),
);

/* ── rules ─────────────────────────────────────────────────────────────── */

const findings = [];
const add = (rule, file, detail, hint) =>
  findings.push({ rule, file: rel(file), detail, hint });

const featureOf = (p) => {
  const m = /^features\/([^/]+)\//.exec(rel(p));
  return m ? m[1] : null;
};

/**
 * Where a file should live, given the one file that imports it.
 *
 * Normally that is simply the importer's folder. When the importer is a page,
 * though, its folder is `pages/` — and pages hold screens, not the parts they
 * are built from. The parts belong in the feature's `components/`, or `hooks/`
 * for a hook.
 */
function targetHome(file, importer) {
  const importerDir = dirname(importer);
  if (!rel(importerDir).endsWith("/pages")) return importerDir;

  const featureRoot = rel(importerDir).replace(/\/pages$/, "");
  const isHook = /^use[A-Z]/.test(rel(file).split("/").pop());
  return join(ROOT, featureRoot, isHook ? "hooks" : "components");
}

for (const file of checked) {
  const users = [...(importers.get(file) ?? [])];
  const name = rel(file).split("/").pop();

  /* naming */
  if (file.endsWith(".tsx") && !/^[A-Z][A-Za-z0-9]*\.tsx$/.test(name)) {
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
    const source = readFileSync(file, "utf8");
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

  /* orphan — pages are mounted by the router, so they are allowed no importer */
  if (users.length === 0 && !isPage(file) && !isLayer(file)) {
    add("orphan", file, "nothing imports it", "delete it or give it an owner");
  }

  /* proximity — a page is mounted by the router, and chrome is mounted by a
     layout, so neither is told to move into the app layer */
  let moving = false;
  if (
    users.length === 1 &&
    !isPage(file) &&
    !isStore(file) &&
    !isAppLayer(users[0])
  ) {
    const home = dirname(file);
    const userHome = targetHome(file, users[0]);
    if (home !== userHome) {
      moving = true;
      add(
        "proximity",
        file,
        `only ${rel(users[0])} imports it`,
        `move next to it, into ${rel(userHome)}/`,
      );
    }
  }

  /* depth — reported only when no move is already queued for this file, since
     the move is what changes its depth */
  const depth = rel(file).split("/").length - 1;
  if (depth > DEPTH && !moving) {
    add("depth", file, `${depth} folders under src/`, `limit is ${DEPTH}`);
  }

  /* shared — a component under features/ used by another feature */
  const ownFeature = featureOf(file);
  if (ownFeature) {
    const others = new Set(
      users.map(featureOf).filter((f) => f && f !== ownFeature),
    );
    if (others.size > 0) {
      add(
        "shared",
        file,
        `used by ${[...others].join(", ")} but lives in ${ownFeature}`,
        "move to components/<domain>/",
      );
    }
  }
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

const ORDER = ["proximity", "shared", "multi", "naming", "depth", "orphan"];
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
  console.log(`${f.rule.padEnd(10)} ${f.file}${tag}`);
  console.log(`${" ".repeat(11)}${f.detail} — ${f.hint}`);
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
