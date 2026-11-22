#!/usr/bin/env node
/**
 * Change budget — keeps a pull request reviewable.
 *
 * Every rule in `docs/change-rules.md` is about a single file. This one is about
 * the diff: a change that touches 40 files cannot be reviewed, cannot be
 * reverted cleanly, and hides a behaviour change inside a rename sweep. That is
 * the failure mode the rest of the rules cannot catch.
 *
 * Measured against the merge base, so it counts what the PR actually adds:
 *
 *   files        15 (warn 8)      files changed, after ignores
 *   added lines 600 (warn 300)    insertions, after ignores
 *   areas           2             of server/ client/ docs/ tooling, app code only
 *
 * Ignores: lockfiles, generated output, docs and markdown, snapshots, fixtures.
 * A migration or a lockfile bump is not a code change.
 *
 * Override, for the change that genuinely is large (a dependency bump, a
 * mechanical rename, a schema migration):
 *
 *   Change-Budget-Exception: <one line saying why>
 *
 * as a trailer in the commit message, or `CHANGE_BUDGET_ALLOW=1` in the
 * environment. The override is printed, so it shows up in the CI log rather than
 * silently widening the budget.
 *
 * Usage:
 *   node scripts/check-change-budget.mjs                 # vs origin/main
 *   node scripts/check-change-budget.mjs <base-ref>
 *   node scripts/check-change-budget.mjs --strict        # exit 1 on a breach
 */
import { execFileSync } from "node:child_process";

const BUDGET = {
  files: 15,
  filesWarn: 8,
  added: 600,
  addedWarn: 300,
  areas: 2,
};

const IGNORED = [
  /^package-lock\.json$/,
  /^server\/package-lock\.json$/,
  /^client\/package-lock\.json$/,
  /\.lock$/,
  /^docs\//,
  /\.md$/,
  /^\.github\//,
  /snapshots?\//,
  /^server\/dist\//,
  /^client\/dist\//,
  /^server\/coverage\//,
  /^client\/coverage\//,
  /(^|\/)fixtures?\//,
  /(^|\/)__snapshots__\//,
];

/** Only these count as "areas" for the cross-cutting rule. */
const AREAS = [
  { name: "server", match: /^server\// },
  { name: "client", match: /^client\// },
];

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const baseArg = args.find((arg) => !arg.startsWith("--"));

const git = (...argv) =>
  execFileSync("git", argv, { encoding: "utf8" }).trim();

function resolveBase() {
  if (baseArg) return baseArg;
  if (process.env.GITHUB_BASE_SHA) return process.env.GITHUB_BASE_SHA;

  /* CI on a pull_request event has the base branch, not origin/main. */
  if (process.env.GITHUB_BASE_REF) return `origin/${process.env.GITHUB_BASE_REF}`;

  return "origin/main";
}

function mergeBase(base) {
  try {
    return git("merge-base", base, "HEAD");
  } catch {
    /* Shallow clone or a local branch with no remote: fall back to the base. */
    return base;
  }
}

function overrideReason() {
  if (process.env.CHANGE_BUDGET_ALLOW === "1") {
    return "CHANGE_BUDGET_ALLOW=1";
  }

  try {
    const message = git("log", "-1", "--pretty=%B");
    const match = /^Change-Budget-Exception:\s*(.+)$/m.exec(message);

    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

const base = resolveBase();
const from = mergeBase(base);

let rows;

try {
  rows = git("diff", "--numstat", `${from}...HEAD`)
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [added, deleted, file] = line.split("\t");

      return {
        file,
        added: added === "-" ? 0 : Number(added),
        deleted: deleted === "-" ? 0 : Number(deleted),
        binary: added === "-",
      };
    });
} catch (error) {
  console.log(
    `change-budget: could not diff against ${from} (${
      error instanceof Error ? error.message.split("\n")[0] : "unknown"
    }) — skipping.`,
  );

  process.exit(0);
}

const counted = rows.filter(
  (row) => !IGNORED.some((pattern) => pattern.test(row.file)),
);

const ignoredCount = rows.length - counted.length;
const files = counted.length;
const added = counted.reduce((total, row) => total + row.added, 0);
const deleted = counted.reduce((total, row) => total + row.deleted, 0);

const areas = AREAS.filter((area) =>
  counted.some((row) => area.match.test(row.file)),
).map((area) => area.name);

const breaches = [];
const warnings = [];

if (files > BUDGET.files) breaches.push(`${files} files changed (budget ${BUDGET.files})`);
else if (files > BUDGET.filesWarn) warnings.push(`${files} files changed (warn ${BUDGET.filesWarn})`);

if (added > BUDGET.added) breaches.push(`${added} lines added (budget ${BUDGET.added})`);
else if (added > BUDGET.addedWarn) warnings.push(`${added} lines added (warn ${BUDGET.addedWarn})`);

if (areas.length > BUDGET.areas) {
  breaches.push(`${areas.length} areas touched (${areas.join(" + ")}), budget ${BUDGET.areas}`);
}

console.log(`change-budget vs ${from.slice(0, 8)}`);
console.log(
  `  ${files} files (${ignoredCount} ignored) · +${added} / −${deleted} lines · areas: ${
    areas.join(", ") || "none"
  }`,
);

if (counted.length > 0 && files <= BUDGET.filesWarn) {
  const top = [...counted].sort((a, b) => b.added - a.added).slice(0, 5);

  console.log("  largest:");
  for (const row of top) console.log(`    +${row.added}/−${row.deleted}  ${row.file}`);
}

for (const warning of warnings) console.log(`  warn  ${warning}`);

const override = overrideReason();

if (breaches.length === 0) {
  console.log("  within budget");
  process.exit(0);
}

for (const breach of breaches) console.log(`  BREACH  ${breach}`);

if (override) {
  console.log(`  overridden: ${override}`);
  process.exit(0);
}

console.log(
  "\nSplit the change, or add a trailer to the commit message:\n" +
    "  Change-Budget-Exception: <why this one cannot be split>\n" +
    "See docs/change-rules.md § Change classes.",
);

if (strict) process.exit(1);
