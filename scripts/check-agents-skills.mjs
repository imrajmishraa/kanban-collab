#!/usr/bin/env node
/**
 * The skills registry's contract, checked against the table it mirrors.
 *
 * `AGENTS.md` §7 is the list an agent reads first; `docs/agents/skill-registry.md`
 * is where each row's source, status and guide live. Nothing keeps the two in
 * step, and a registry that drifts from the table is worse than no registry —
 * the table says "use this", the registry says nothing, and the next agent
 * fills the gap by inventing.
 *
 * What it checks:
 *   agents/duplicate     a skill appears twice in the same table
 *   agents/missing       a skill in §7 has no registry row
 *   agents/orphan        a registry row names a skill §7 does not list
 *   agents/placeholder   `ln-*`, `<name>`, TODO or TBD survived into a name
 *   agents/status        a status outside the four the registry defines
 *   agents/link          a guide link points at a file that does not exist
 *
 * Warnings (reported, never fatal): a Verified skill with no guide yet.
 *
 * Run: node scripts/check-agents-skills.mjs
 *      node scripts/check-agents-skills.mjs --strict    exit 1 on findings
 * Wired as: the `agents` job in .github/workflows/ci-cd.yml
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const AGENTS = resolve(ROOT, "AGENTS.md");
const REGISTRY = resolve(ROOT, "docs/agents/skill-registry.md");

const strict = process.argv.includes("--strict");
const STATUSES = new Set(["Verified", "Unverified", "Planned", "Rejected"]);
const PLACEHOLDER = /ln-\*|TODO|TBD|<[a-z-]+>/i;
const WARN_LIMIT = 5;

const findings = [];
const warnings = [];

function add(id, where, message) {
  findings.push({ id, where, message });
}

/** The cells of a markdown table row, without the outer pipes. */
function cells(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/** The skill name in a cell: `name` or a plain name. */
function skillName(cell) {
  const ticked = cell.match(/`([^`]+)`/);
  return (ticked ? ticked[1] : cell).trim();
}

/* ── AGENTS.md §7 ────────────────────────────────────────────────────── */

const agents = readFileSync(AGENTS, "utf8").split("\n");
const sectionStart = agents.findIndex((line) => /^## 7\./.test(line));
const sectionEnd = agents.findIndex((line, i) => i > sectionStart && /^## 8\./.test(line));

if (sectionStart === -1 || sectionEnd === -1) {
  add("agents/section", "AGENTS.md", "§7 (skills) or §8 (definition of done) is missing");
}

const tableSkills = [];
for (const line of agents.slice(sectionStart + 1, sectionEnd)) {
  if (!line.startsWith("|")) continue;
  const first = cells(line)[0] ?? "";
  if (!first.startsWith("`")) continue;
  tableSkills.push(skillName(first));
}

if (tableSkills.length === 0) {
  add("agents/section", "AGENTS.md §7", "no skill rows found");
}

/* ── docs/agents/skill-registry.md ───────────────────────────────────── */

if (!existsSync(REGISTRY)) {
  add("agents/registry", "docs/agents/skill-registry.md", "the registry file is missing");
}

const registrySkills = [];
if (existsSync(REGISTRY)) {
  for (const line of readFileSync(REGISTRY, "utf8").split("\n")) {
    if (!line.startsWith("|")) continue;
    const row = cells(line);
    if (row.length < 4) continue;
    if (!row[0].startsWith("`")) continue;

    const name = skillName(row[0]);
    const source = row[1] ?? "";
    const status = row[2];
    const guide = row[4] ?? "";

    registrySkills.push({ name, status, source, guide });

    // A row that says Verified is a claim that a file was read. It has to name it.
    if (status === "Verified" && (!source || /not inspected/i.test(source))) {
      add("agents/source", `registry: ${name}`, "Verified, but the source column names nothing");
    }

    if (!STATUSES.has(status)) {
      add("agents/status", `registry: ${name}`, `"${status}" is not one of ${[...STATUSES].join(", ")}`);
    }

    const link = guide.match(/\]\(([^)]+)\)/);
    if (link && !link[1].startsWith("http")) {
      if (!existsSync(resolve(ROOT, "docs/agents", link[1]))) {
        add("agents/link", `registry: ${name}`, `guide link does not resolve: ${link[1]}`);
      }
    }

    // Only a skill whose source was read is a promise to document it. An
    // Unverified row is honest about not having been read yet.
    if (status === "Verified" && !link) {
      warnings.push(`${name} is verified but has no guide yet`);
    }
  }
}

/* ── the two tables against each other ───────────────────────────────── */

for (const list of [tableSkills, registrySkills.map((row) => row.name)]) {
  const seen = new Set();
  for (const name of list) {
    if (seen.has(name)) add("agents/duplicate", name, "listed twice");
    seen.add(name);
    if (PLACEHOLDER.test(name)) {
      add("agents/placeholder", name, "placeholder id — verify the real skill name first");
    }
  }
}

const tableSet = new Set(tableSkills);
const registrySet = new Set(
  registrySkills.filter((row) => row.status !== "Rejected").map((row) => row.name),
);

for (const name of tableSet) {
  if (!registrySet.has(name)) add("agents/missing", name, "in AGENTS.md §7, absent from the registry");
}
for (const name of registrySet) {
  if (!tableSet.has(name)) add("agents/orphan", name, "in the registry, absent from AGENTS.md §7");
}

/* ── a guide must carry the sections the template promises ──────────── */

const REQUIRED_SECTIONS = [
  /^#+ .*when this applies/i,
  /^#+ .*workflow/i,
  /^#+ .*verification/i,
];

for (const row of registrySkills) {
  const link = row.guide.match(/\]\(([^)]+)\)/);
  if (!link || link[1].startsWith("http")) continue;
  const path = resolve(ROOT, "docs/agents", link[1]);
  if (!existsSync(path)) continue; // agents/link already reported it
  const body = readFileSync(path, "utf8");
  for (const section of REQUIRED_SECTIONS) {
    if (!section.test(body)) {
      add("agents/sections", link[1], `missing a section matching ${section}`);
    }
  }
}

/* ── a page may only name a skill the table lists ────────────────────── */

const selectionFile = resolve(ROOT, "docs/agents/skill-selection.md");
if (existsSync(selectionFile)) {
  const body = readFileSync(selectionFile, "utf8");
  for (const match of body.matchAll(/`([\w./-]+\.(?:md|ts|tsx|mjs|json))`/g)) {
    // A bare `SKILL.md` is the name of a file that lives outside this repo, not a
    // path into it. Only a path — or one of the two root documents — is checkable.
    const isPath = match[1].includes("/") || /^(AGENTS|DESIGN)\.md$/.test(match[1]);
    if (!isPath) continue;
    if (!existsSync(resolve(ROOT, match[1]))) {
      add("agents/precedence", "docs/agents/skill-selection.md", `names a file that does not exist: ${match[1]}`);
    }
  }
}

const pageDirs = ["docs/agents/patterns", "docs/agents/workflows"].filter((dir) =>
  existsSync(resolve(ROOT, dir)),
);
for (const dir of pageDirs) {
  for (const entry of readdirSync(resolve(ROOT, dir))) {
    if (!entry.endsWith(".md")) continue;
    const path = join(dir, entry);
    const lines = readFileSync(resolve(ROOT, path), "utf8").split("\n");

    let inSkillsTable = false;
    for (const line of lines) {
      if (/^#{2,3}\s/.test(line)) {
        inSkillsTable = /where.*skill/i.test(line);
        continue;
      }
      if (!inSkillsTable || !line.startsWith("|")) continue;
      const first = (cells(line)[0] ?? "").trim();
      if (!first.startsWith("`")) continue;
      const name = skillName(first);
      if (name === "Skill") continue;
      if (!tableSet.has(name)) {
        add("agents/skill-ref", path, `names \`${name}\`, which AGENTS.md §7 does not list`);
      }
    }
  }
}

/* ── report ──────────────────────────────────────────────────────────── */

const count = (status) => registrySkills.filter((row) => row.status === status).length;

console.log(
  `agents: ${tableSkills.length} skills in AGENTS.md §7 · ${registrySkills.length} in the registry ` +
    `(${count("Verified")} verified, ${count("Unverified")} unverified, ` +
    `${count("Planned")} planned, ${count("Rejected")} rejected)`,
);

for (const finding of findings) {
  console.log(`  ${finding.id.padEnd(20)} ${finding.where} — ${finding.message}`);
}

for (const warning of warnings.slice(0, WARN_LIMIT)) {
  console.log(`  warn                 ${warning}`);
}
if (warnings.length > WARN_LIMIT) {
  console.log(`  warn                 … and ${warnings.length - WARN_LIMIT} more`);
}

if (findings.length === 0) {
  console.log(`\nno findings${warnings.length ? `, ${warnings.length} warning(s)` : ""}`);
}

if (strict && findings.length > 0) process.exit(1);
