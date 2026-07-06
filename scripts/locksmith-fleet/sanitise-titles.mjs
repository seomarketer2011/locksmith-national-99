#!/usr/bin/env node
// Deterministic, $0 in-place sanitiser for fleet enriched-cache titles + descriptions.
// Strips AI reasoning-leak ("Character count", "Let me revise", markdown, ✓, count
// notation) from every *.meta.title and *.meta.description field. Where a real title
// can be recovered from a reasoning blob it is kept; otherwise a clean deterministic
// template title is applied so no field is ever left broken.
//
// Usage:
//   node scripts/locksmith-fleet/sanitise-titles.mjs            # apply
//   node scripts/locksmith-fleet/sanitise-titles.mjs --dry-run  # report only

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CACHE = join(ROOT, "data", "locksmith-fleet", "enriched-cache");
const FLEET = JSON.parse(readFileSync(join(ROOT, "data", "locksmith-fleet", "sites.json"), "utf8"));
const DRY = process.argv.includes("--dry-run");

const SERVICE_LABEL = {
  "emergency-locksmith": "Emergency Locksmith",
  "locked-out": "Locked Out",
  "broken-key-removal": "Broken Key Removal",
  "burglar-repair-service": "Burglar Repair Service",
  "emergency-boarding-up": "Emergency Boarding Up",
  "lock-changes": "Lock Changes",
  "lock-repairs": "Lock Repairs",
  "door-lock-installation": "Door Lock Installation",
  "door-lock-replacement": "Door Lock Replacement",
  "door-repairs": "Door Repairs",
  "window-lock-repair-replacement": "Window Lock Repair & Replacement",
  "safe-installation": "Safe Installation",
  "safe-opening": "Safe Opening",
};

const byProject = Object.fromEntries(FLEET.map((s) => [s.cf_project, s]));

// Lines that are pure model commentary — never part of a real title.
const COMMENTARY = /character count|this (falls short|meets|version|is \d+ char|gives)|let me (revise|create|try)|alternative|requirements|^\(?\s*\d+\s*char|^here'?s|^output|^title:|i'?ll (craft|create|keep)|just under|hits? \d+|maintains? a|without clickbait/i;

function looksLikeTitle(s) {
  if (!s) return false;
  if (COMMENTARY.test(s)) return false;
  // A real title has letters and is a reasonable length
  if (!/[a-z]/i.test(s)) return false;
  return true;
}

function stripCount(s) {
  // remove a trailing "(58 characters)", "55 chars", "✓", "**", etc.
  return s
    .replace(/\s*[\(\[]?\s*\d+\s*char(acter)?s?\s*[\)\]]?\s*✓?\s*$/i, "")
    .replace(/\s*✓\s*$/u, "")
    .replace(/\*\*/g, "")
    .trim();
}

function sanitiseTitle(raw, fallback, maxLen) {
  const lines = String(raw || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => stripCount(l.replace(/^["'`*#\s]+|["'`*\s]+$/g, "")))
    .filter(Boolean);

  // Pick the first line that reads like a real title.
  let chosen = lines.find(looksLikeTitle) || "";
  chosen = stripCount(chosen).replace(/^["'`*#\s]+|["'`*\s]+$/g, "");

  // Reject implausible results -> deterministic fallback.
  if (!chosen || chosen.length < 18) chosen = fallback;
  // Hard length cap: truncate at a separator if possible, else hard cut.
  if (chosen.length > maxLen) {
    const cut = chosen.slice(0, maxLen);
    const lastSep = Math.max(cut.lastIndexOf(" | "), cut.lastIndexOf(" – "), cut.lastIndexOf(" - "));
    chosen = (lastSep > 25 ? cut.slice(0, lastSep) : cut.replace(/\s+\S*$/, "")).trim();
  }
  return chosen;
}

function fallbackTitle(serviceSlug, location) {
  if (serviceSlug === "home") return `Local Locksmith in ${location} | 24/7 Call-Out`.slice(0, 60);
  const label = SERVICE_LABEL[serviceSlug] || "Locksmith";
  return `${label} ${location} | 24/7 Locksmith`.slice(0, 65);
}

function serviceFromKey(key) {
  if (key === "meta.title" || key === "meta.description") return "home";
  return key.split(".")[0];
}

let filesChanged = 0;
let fieldsFixed = 0;
const samples = [];

for (const file of readdirSync(CACHE).filter((f) => f.endsWith(".json"))) {
  const path = join(CACHE, file);
  const cache = JSON.parse(readFileSync(path, "utf8"));
  const site = byProject[file.replace(".json", "")];
  const location = site?.location || "your area";
  let changed = false;

  for (const key of Object.keys(cache)) {
    const isTitle = key.endsWith("meta.title");
    const isDesc = key.endsWith("meta.description");
    if (!isTitle && !isDesc) continue;

    const before = cache[key];
    if (typeof before !== "string") continue;

    // Defect detection — only touch a field that is genuinely broken.
    const hasCommentary = before.split("\n").some((l) => COMMENTARY.test(l));
    const isMultiline = /\n/.test(before.trim());
    const hasMarkdown = /\*\*|^#+\s/.test(before);
    const hasCount = /[\(\[]?\s*\d+\s*char(acter)?s?\s*[\)\]]?\s*✓?\s*$/i.test(before.trim()) || /✓/.test(before);
    const titleTooLong = isTitle && before.length > 65;

    const defective = hasCommentary || isMultiline || hasMarkdown || hasCount || titleTooLong;
    if (!defective) continue;

    const svc = serviceFromKey(key);
    let after;
    if (isTitle) {
      after = sanitiseTitle(before, fallbackTitle(svc, location), 65);
    } else {
      // description: drop commentary lines, strip count/markdown. Do NOT length-cap clean copy.
      const lines = before.replace(/\r/g, "").split("\n")
        .map((l) => stripCount(l.replace(/^["'`*#\s]+|["'`*\s]+$/g, "")))
        .filter((l) => l && !COMMENTARY.test(l));
      after = (lines[0] || before).trim();
      after = stripCount(after);
    }

    if (after !== before) {
      const reasons = [
        hasCommentary && "commentary",
        isMultiline && "multiline",
        hasMarkdown && "markdown",
        hasCount && "count",
        titleTooLong && "too-long",
      ].filter(Boolean).join(",");
      if (samples.length < 40) samples.push({ file: file.replace(".json", ""), key, reasons, before: before.replace(/\n/g, "\\n").slice(0, 90), after });
      cache[key] = after;
      changed = true;
      fieldsFixed++;
    }
  }

  if (changed) {
    filesChanged++;
    if (!DRY) writeFileSync(path, JSON.stringify(cache, null, 2));
  }
}

console.log(`${DRY ? "[dry-run] " : ""}Sanitised ${fieldsFixed} fields across ${filesChanged} cache files.\n`);
console.log("Sample fixes (before -> after):");
for (const s of samples) {
  console.log(`\n  ${s.file}  [${s.key}]`);
  console.log(`    BEFORE: ${JSON.stringify(s.before)}`);
  console.log(`    AFTER:  ${JSON.stringify(s.after)}`);
}
