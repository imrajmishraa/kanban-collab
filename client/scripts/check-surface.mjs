#!/usr/bin/env node
/**
 * Surface rules — the ones that decide whether a change works on a phone, a
 * tablet, or with a keyboard.
 *
 * `check-paths.mjs` guards *where* code lives. This guards *what the markup is
 * allowed to assume*. Every rule below is a bug this repo has already shipped:
 * a board you cannot reorder on a phone, controls that only exist while a mouse
 * hovers them, `100vh` on iOS where the browser chrome overlaps, a two-column
 * grid that jumps straight from 1 to 4 columns and is unusable at 768px.
 *
 * Rules (each id is stable — baselines and PR comments quote it):
 *
 *   surface/size          a component over its line budget
 *   surface/vh-not-dvh    `h-screen` / `100vh` where `dvh` is meant
 *   surface/hover-only    a control revealed by hover with no focus equivalent
 *   surface/no-middle     a responsive grid with no tablet step (sm:/md:)
 *   surface/safe-area     fixed chrome with no safe-area inset
 *   surface/drag-only     drag handling with no keyboard path
 *   surface/touch-target  a small control (report only, does not fail)
 *   surface/persist-version  a persisted store with no schema version
 *   surface/resize-a11y   a resize handle without separator semantics
 *
 * Run: node scripts/check-surface.mjs
 *      node scripts/check-surface.mjs --strict            exit 1 on new findings
 *      node scripts/check-surface.mjs --write-baseline    record today's state
 * Wired as: npm run lint:surface
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(new URL("../src", import.meta.url).pathname);
const BASELINE_FILE = resolve(
  new URL("./surface-baseline.json", import.meta.url).pathname,
);

/**
 * Line budgets, set from the repo's own distribution (p50 80, p90 342, p95 461
 * for .tsx). A component past 400 lines is doing more than one job; the ones
 * already over it are grandfathered in the baseline, not blessed.
 */
const BUDGET = {
  tsx: 400,
  ts: 300,
};

/**
 * Exempt from the line budget: tests are long by nature, and config/data tables
 * are a list, not logic. Everything else answers to the budget.
 */
const SIZE_EXEMPT =
  /\.test\.tsx?$|(^|\/)(navConfig|config|[a-zA-Z]+Config)\.ts$/;

const strict = process.argv.includes("--strict");
const writeBaseline = process.argv.includes("--write-baseline");

/* ── files ─────────────────────────────────────────────────────────────── */

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|css)$/.test(entry)) out.push(full);
  }
  return out;
}

const files = walk(ROOT).map((full) => ({
  full,
  rel: relative(ROOT, full).split("\\").join("/"),
  text: readFileSync(full, "utf8"),
}));

/* ── helpers ───────────────────────────────────────────────────────────── */

/**
 * The class strings in a file, near enough.
 *
 * A full JSX parse would be exact and much slower; a 240-character window after
 * `className=` catches every form in this codebase (string literal, template
 * literal, `cn(...)`), and the baseline absorbs the occasional false positive.
 */
function classChunks(text) {
  const chunks = [];
  const re = /\bclassName\s*=\s*/g;

  let match;

  while ((match = re.exec(text)) !== null) {
    chunks.push({
      chunk: text.slice(match.index, match.index + 240),
      offset: match.index,
    });
  }

  return chunks;
}

function lineOf(text, offset) {
  return text.slice(0, offset).split("\n").length;
}

const findings = [];

function report(rule, file, line, detail, severity = "error") {
  findings.push({ rule, file: file.rel, line, detail, severity });
}

/* ── rules ─────────────────────────────────────────────────────────────── */

for (const file of files) {
  const lineCount = file.text.split("\n").length;
  const isTsx = file.rel.endsWith(".tsx");
  const budget = isTsx ? BUDGET.tsx : BUDGET.ts;

  /* 1. size */
  if (
    !file.rel.endsWith(".css") &&
    !SIZE_EXEMPT.test(file.rel) &&
    lineCount > budget
  ) {
    report(
      "surface/size",
      file,
      1,
      `${lineCount} lines (budget ${budget}) — split it before adding to it`,
    );
  }

  /* 2. viewport unit */
  file.text.split("\n").forEach((line, index) => {
    if (/\b(h|min-h)-screen\b|100vh/.test(line) && !/dvh/.test(line)) {
      report(
        "surface/vh-not-dvh",
        file,
        index + 1,
        "use h-dvh / min-h-dvh (or 100dvh): iOS chrome overlaps 100vh",
      );
    }
  });

  /* 3. hover-only affordance */
  for (const { chunk, offset } of classChunks(file.text)) {
    const hiddenUntilHover =
      /opacity-0/.test(chunk) &&
      /(group-hover:|[^:]hover:opacity-100)/.test(chunk);

    const hasFocusPath =
      /(group-focus-within:|group-focus:|focus-within:|focus:opacity-100)/.test(
        chunk,
      );

    if (hiddenUntilHover && !hasFocusPath) {
      report(
        "surface/hover-only",
        file,
        lineOf(file.text, offset),
        "control is invisible without a pointer — add group-focus-within: / focus:",
      );
    }
  }

  /* 4. no tablet step — advisory, not a gate
   *
   * `grid lg:grid-cols-3` is idiomatic mobile-first and fine. What is worth a
   * second look is a single column that jumps straight to four or more at
   * `lg:` with nothing in between: that is the shape that squeezes at 768px.
   * This is a `warn` because only a human can tell whether it actually breaks.
   */
  for (const { chunk, offset } of classChunks(file.text)) {
    const wide = /(lg|xl):grid-cols-[4-9]/.test(chunk);
    const hasMiddle = /(sm|md):grid-cols-/.test(chunk);
    const baseIsSingle =
      /(?<![:\w-])grid-cols-1\b/.test(chunk) ||
      !/(?<![:\w-])grid-cols-[2-9]\b/.test(chunk);

    if (wide && !hasMiddle && baseIsSingle) {
      report(
        "surface/no-middle",
        file,
        lineOf(file.text, offset),
        "1 column straight to 4+ at lg: — check 768px, or declare a sm:/md: step",
        "warn",
      );
    }
  }

  /* 5. safe-area */
  if (
    /fixed\s+(bottom|top)-0|sticky\s+top-0|fixed\s+inset-x-0\s+bottom-0/.test(
      file.text,
    ) &&
    !/safe-area-inset/.test(file.text)
  ) {
    report(
      "surface/safe-area",
      file,
      1,
      "fixed chrome with no env(safe-area-inset-*) — it sits under the iOS bar",
    );
  }

  /* 6. drag-only */
  if (
    /onDragStart|onDragOver|draggable=/.test(file.text) &&
    !/onKeyDown|onKeyUp/.test(file.text)
  ) {
    report(
      "surface/drag-only",
      file,
      1,
      "drag handling with no keyboard path — a finger fires no HTML5 drag event",
    );
  }

  /* 8. persisted stores need a version
   *
   * A store that persists without `version` has no way to migrate the shape it
   * wrote last month. Adding a field later (a width, a mode) then means either
   * a runtime crash on old data or a silent reset of the user's settings. Every
   * store that already ships a version gets this for free; the ones that do not
   * are grandfathered so the rule can be switched on today.
   */
  if (/persist\(/.test(file.text) && !/\bversion:\s*\d/.test(file.text)) {
    report(
      "surface/persist-version",
      file,
      1,
      "persist() without `version` — add one now, so the shape can be migrated later",
    );
  }

  /* 9. a resize handle must be a separator
   *
   * The handle is the only way to change the width, so it has to be reachable
   * and operable without a pointer: `role="separator"`, `tabindex`, and the
   * aria value range are what a screen reader announces and what the arrow keys
   * drive. A `cursor-col-resize` div with an onPointerDown and nothing else is
   * invisible to every keyboard user.
   */
  const hasSeparator = /role="separator"/.test(file.text);
  const hasResizeCursor = /cursor-(col|ew)-resize/.test(file.text);

  if (hasSeparator && !/aria-valuenow/.test(file.text)) {
    report(
      "surface/resize-a11y",
      file,
      1,
      'role="separator" without aria-valuenow — announce the width it controls',
    );
  }

  if (hasResizeCursor && !hasSeparator) {
    report(
      "surface/resize-a11y",
      file,
      1,
      'resize cursor with no role="separator" — the handle is pointer-only',
    );
  }

  /* 7. touch target (report only) */
  file.text.split("\n").forEach((line, index) => {
    if (!/<button|role="button"/.test(line)) return;

    const small = /\b(h|size)-(6|7|8|9)\b/.exec(line);

    if (small) {
      report(
        "surface/touch-target",
        file,
        index + 1,
        `${small[0]} is under 44px — h-11 / size-11 is the floor for touch`,
        "warn",
      );
    }
  });
}

/* ── baseline ──────────────────────────────────────────────────────────── */

const key = (finding) => `${finding.rule}|${finding.file}`;
const counted = findings.filter((finding) => finding.severity === "error");

if (writeBaseline) {
  const baseline = {};

  for (const finding of counted) {
    baseline[key(finding)] = (baseline[key(finding)] ?? 0) + 1;
  }

  writeFileSync(BASELINE_FILE, `${JSON.stringify(baseline, null, 2)}\n`);

  console.log(
    `Wrote ${Object.keys(baseline).length} baseline entries (${counted.length} findings) to ${relative(process.cwd(), BASELINE_FILE)}`,
  );

  process.exit(0);
}

let baseline = {};

try {
  baseline = JSON.parse(readFileSync(BASELINE_FILE, "utf8"));
} catch {
  /* No baseline yet: everything counts as new. */
}

const seen = {};
const fresh = [];
const known = [];

for (const finding of counted) {
  const id = key(finding);
  seen[id] = (seen[id] ?? 0) + 1;

  if (seen[id] <= (baseline[id] ?? 0)) known.push(finding);
  else fresh.push(finding);
}

const byRule = (list) => {
  const out = {};

  for (const finding of list) {
    out[finding.rule] = (out[finding.rule] ?? 0) + 1;
  }

  return out;
};

console.log(
  `surface: ${counted.length} findings — ${known.length} grandfathered, ${fresh.length} new`,
);

if (Object.keys(byRule(known)).length > 0) {
  console.log("  grandfathered:", byRule(known));
}

if (fresh.length > 0) {
  console.log("\nNEW findings (fix these, or the PR fails):");

  for (const finding of fresh.slice(0, 40)) {
    console.log(
      `  ${finding.file}:${finding.line}  ${finding.rule}  ${finding.detail}`,
    );
  }

  if (fresh.length > 40) {
    console.log(`  … ${fresh.length - 40} more`);
  }
}

const warnings = findings.filter((finding) => finding.severity === "warn");

if (warnings.length > 0) {
  console.log(`\nwarn (report only, does not fail): ${byRule(warnings)}`);
}

if (fresh.length > 0 && strict) {
  process.exit(1);
}

if (fresh.length > 0) {
  console.log(
    "\nRun with --strict to fail, or --write-baseline to accept today's state.",
  );
}
