#!/usr/bin/env node
/**
 * Server structure rules — the layering `AGENTS.md` describes, made mechanical.
 *
 * The client has `check-paths.mjs` for this. The server had nothing, so
 * "controllers stay thin" and "use cases live in application/" were conventions
 * that only a reviewer could enforce. These rules are the subset that holds
 * today; anything that does not hold today is deliberately not here, because a
 * rule the code already breaks is a rule everyone learns to ignore.
 *
 *   server/layer-direction   a lower layer imports a higher one
 *   server/size              a file over its line budget
 *   server/no-console        console.* instead of a pino child logger
 *   server/env-outside-config process.env read anywhere but config/env.ts
 *   server/raw-api-error     `new ApiError(...)` in a controller instead of a factory
 *
 * Run: node scripts/check-layers.mjs
 *      node scripts/check-layers.mjs --strict           exit 1 on new findings
 *      node scripts/check-layers.mjs --write-baseline   record today's state
 * Wired as: npm run lint:layers
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(new URL("../src", import.meta.url).pathname);
const BASELINE_FILE = resolve(
  new URL("./layers-baseline.json", import.meta.url).pathname,
);

/**
 * Layer order, lowest first. An import may only point at the same layer, a
 * lower one, or `shared`/`config` — never upward. `interfaces` sits on top
 * because it is what the outside world talks to.
 */
const LAYERS = ["shared", "config", "infrastructure", "application", "interfaces"];

/** Line budgets per area. A controller past 400 lines is several controllers. */
const BUDGETS = [
  { match: /^interfaces\/http\/controllers\//, budget: 400 },
  { match: /^interfaces\/websockets\//, budget: 500 },
  { match: /^application\//, budget: 400 },
  { match: /^infrastructure\//, budget: 400 },
  { match: /^shared\//, budget: 300 },
];

/**
 * Exempt: the schema registry is a single table by design, and generated-style
 * tables grow without becoming harder to read.
 */
const SIZE_EXEMPT = /^infrastructure\/db\/mongoose\/schemas\.ts$/;

/** Only this file may read the environment; everything else imports ENV. */
const ENV_ALLOWED = /^config\/env\.ts$/;

/**
 * `config/env.ts` validates at import time and exits before any logger exists,
 * so `console` is the only channel available there. It is the one place the
 * no-console rule cannot apply.
 */
const CONSOLE_ALLOWED = /^config\/env\.ts$/;

const strict = process.argv.includes("--strict");
const writeBaseline = process.argv.includes("--write-baseline");

/* ── files ─────────────────────────────────────────────────────────────── */

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".ts")) out.push(full);
  }
  return out;
}

const files = walk(ROOT).map((full) => ({
  full,
  rel: relative(ROOT, full).split("\\").join("/"),
  text: readFileSync(full, "utf8"),
}));

const findings = [];

function report(rule, file, line, detail, severity = "error") {
  findings.push({ rule, file: file.rel, line, detail, severity });
}

function layerOf(rel) {
  return LAYERS.find((layer) => rel === layer || rel.startsWith(`${layer}/`));
}

/* ── rules ─────────────────────────────────────────────────────────────── */

for (const file of files) {
  const lines = file.text.split("\n");
  const own = layerOf(file.rel);
  const ownRank = own ? LAYERS.indexOf(own) : -1;

  /* 1. layer direction */
  lines.forEach((line, index) => {
    /* Only relative imports say anything about layering; a package import does
       not carry a path. */
    const match = /from\s+"(\.[^"]+)"/.exec(line);

    if (!match || ownRank === -1) return;

    const resolved = relative(ROOT, resolve(ROOT, file.rel, "..", match[1]))
      .split("\\")
      .join("/");

    const target = layerOf(resolved);

    if (!target) return;

    const targetRank = LAYERS.indexOf(target);

    if (targetRank > ownRank) {
      report(
        "server/layer-direction",
        file,
        index + 1,
        `${own} imports ${target} (${resolved}) — dependencies point down, not up`,
      );
    }
  });

  /* 2. size */
  const budget = BUDGETS.find(({ match }) => match.test(file.rel));

  if (budget && !SIZE_EXEMPT.test(file.rel) && lines.length > budget.budget) {
    report(
      "server/size",
      file,
      1,
      `${lines.length} lines (budget ${budget.budget}) — split it before adding to it`,
    );
  }

  /* 3. console */
  lines.forEach((line, index) => {
    if (CONSOLE_ALLOWED.test(file.rel)) return;

    if (/\bconsole\.(log|info|warn|error|debug)\b/.test(line)) {
      report(
        "server/no-console",
        file,
        index + 1,
        "use a pino child logger (authLogger, lifecycleLogger, …)",
      );
    }
  });

  /* 4. environment access */
  if (!ENV_ALLOWED.test(file.rel)) {
    lines.forEach((line, index) => {
      if (/process\.env\b/.test(line) && !/^\s*\*/.test(line)) {
        report(
          "server/env-outside-config",
          file,
          index + 1,
          "read config through ENV (config/env.ts) so the schema validates it",
        );
      }
    });
  }

  /* 5. raw error construction in controllers */
  if (file.rel.startsWith("interfaces/http/controllers/")) {
    lines.forEach((line, index) => {
      if (/new ApiError\(/.test(line)) {
        report(
          "server/raw-api-error",
          file,
          index + 1,
          "use the factory in shared/errors/<domain>.ts so the code stays consistent",
        );
      }
    });
  }
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
    `Wrote ${Object.keys(baseline).length} baseline entries (${counted.length} findings)`,
  );

  process.exit(0);
}

let baseline = {};

try {
  baseline = JSON.parse(readFileSync(BASELINE_FILE, "utf8"));
} catch {
  /* No baseline yet. */
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

  for (const finding of list) out[finding.rule] = (out[finding.rule] ?? 0) + 1;

  return out;
};

console.log(
  `layers: ${counted.length} findings — ${known.length} grandfathered, ${fresh.length} new`,
);

if (Object.keys(byRule(known)).length > 0) {
  console.log("  grandfathered:", byRule(known));
}

if (fresh.length > 0) {
  console.log("\nNEW findings:");

  for (const finding of fresh.slice(0, 40)) {
    console.log(
      `  ${finding.file}:${finding.line}  ${finding.rule}  ${finding.detail}`,
    );
  }

  if (fresh.length > 40) console.log(`  … ${fresh.length - 40} more`);
}

if (fresh.length > 0 && strict) process.exit(1);

if (fresh.length > 0) {
  console.log(
    "\nRun with --strict to fail, or --write-baseline to accept today's state.",
  );
}
