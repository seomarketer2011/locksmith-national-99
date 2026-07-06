#!/usr/bin/env node
// Regenerate ONLY the title regions for every site in the enriched-cache.
// Doesn't touch hero paragraphs / FAQs / local-context — those stay as-is.
// Cost: ~14 prompts × 99 sites × ~$0.0005 = ~$0.70 fleet-wide.
//
// Usage:
//   ANTHROPIC_API_KEY=... node scripts/locksmith-fleet/regenerate-titles.mjs
//   ... --domain X     # single site
//   ... --dry-run

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CACHE = join(ROOT, "data", "locksmith-fleet", "enriched-cache");
const INTEL_DIR = join(ROOT, "data", "locksmith-fleet", "local-intelligence");
const FLEET = JSON.parse(readFileSync(join(ROOT, "data", "locksmith-fleet", "sites.json"), "utf8"));

const args = parseArgs(process.argv.slice(2));
if (!process.env.ANTHROPIC_API_KEY) { console.error("ANTHROPIC_API_KEY required"); process.exit(1); }

const SERVICES = [
  ["emergency-locksmith","Emergency Locksmith"],
  ["locked-out","Locked Out"],
  ["broken-key-removal","Broken Key Removal"],
  ["burglar-repair-service","Burglar Repair Service"],
  ["emergency-boarding-up","Emergency Boarding Up"],
  ["lock-changes","Lock Changes"],
  ["lock-repairs","Lock Repairs"],
  ["door-lock-installation","Door Lock Installation"],
  ["door-lock-replacement","Door Lock Replacement"],
  ["door-repairs","Door Repairs"],
  ["window-lock-repair-replacement","Window Lock Repair & Replacement"],
  ["safe-installation","Safe Installation"],
  ["safe-opening","Safe Opening"],
];

function homeTitlePrompt(loc) {
  return `Write a homepage <title> for a UK locksmith website serving ${loc}. Keep it short — under 60 characters. Style: clean, direct, action-oriented like a Google Ad headline. Must mention "${loc}". NO property types. NO words like "Specialists","Experts","Period","Victorian","Listed","HMO","Heritage". NO clickbait or all-caps. NO surrounding quotes.

Good examples:
  "Local Locksmith in ${loc} | 24/7 Call-Out"
  "Trusted ${loc} Locksmith – Same-Day Service"

Respond with ONLY the title text on a single line. Do not explain, count characters, or add any commentary.`;
}

function svcTitlePrompt(loc, label) {
  return `Write a <title> for the ${label} service page of a UK locksmith website serving ${loc}. Keep it short — under 60 characters. Style: clean, action-oriented. Must mention ${loc} and "${label}". Add ONE trust signal where natural ("24/7", "fast", "same-day", "no call-out fee", "trusted local"). NO property types. NO words like "Specialists","Experts","Period","Victorian","Listed","HMO","Heritage". NO clickbait, NO all-caps, NO surrounding quotes.

Good examples:
  "Emergency Locksmith ${loc} – 24/7 Call-Out"
  "${label} in ${loc} | Same-Day Service"

Respond with ONLY the title text on a single line. Do not explain, count characters, or add any commentary.`;
}

const COMMENTARY = /character count|this (falls short|meets|version|is \d+ char|gives)|let me (revise|create|try)|alternative|requirements|^\(?\s*\d+\s*char|^here'?s|^output|^title:|i'?ll (craft|create|keep)|just under|without clickbait/i;

// Extracts a single clean title line from a model response. Drops any
// reasoning/commentary lines, strips count notation / markdown / quotes / ✓,
// and rejects anything implausible (caller then retries or uses a fallback).
function sanitise(t) {
  const lines = String(t || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/^["'`*#\s]+|["'`*\s]+$/g, ""))
    .map((l) => l.replace(/^(Title|Output|Answer):\s*/i, "").trim())
    .filter(Boolean);

  // First line that is not commentary and contains letters.
  let chosen = lines.find((l) => !COMMENTARY.test(l) && /[a-z]/i.test(l)) || "";

  // Strip a trailing "(58 characters)" / "55 chars" / "✓" / stray markdown.
  chosen = chosen
    .replace(/\s*[\(\[]?\s*\d+\s*char(acter)?s?\s*[\)\]]?\s*✓?\s*$/i, "")
    .replace(/\s*✓\s*$/u, "")
    .replace(/\*\*/g, "")
    .trim();

  if (!chosen || chosen.length < 18 || chosen.length > 70) return "";
  return chosen;
}

async function callClaude(prompt) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type":"application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version":"2023-06-01" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 80, messages: [{ role:"user", content: prompt }] }),
  });
  if (!r.ok) throw new Error(`Claude ${r.status}`);
  const d = await r.json();
  return d.content.filter(b => b.type === "text").map(b => b.text).join("\n");
}

function slugify(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }

const targets = (args.domain ? [FLEET.find(s => s.domain === args.domain)] : FLEET.filter(s => s.logo_present)).filter(Boolean);
console.log(`Regenerating titles for ${targets.length} site(s).\n`);

let totalUpdated = 0;
for (const site of targets) {
  const cachePath = join(CACHE, site.cf_project + ".json");
  if (!existsSync(cachePath)) { console.log(`SKIP ${site.domain} (no cache)`); continue; }
  const cache = JSON.parse(readFileSync(cachePath, "utf8"));
  process.stdout.write(`${site.domain.padEnd(55)} `);

  let regions = [["meta.title", homeTitlePrompt(site.location), "home"]];
  for (const [slug, label] of SERVICES) regions.push([`${slug}.meta.title`, svcTitlePrompt(site.location, label), slug, label]);

  let changed = 0;
  for (const [key, prompt, slug, label] of regions) {
    let clean = "";
    // Up to 2 attempts to get a clean title from the model.
    for (let attempt = 0; attempt < 2 && !clean; attempt++) {
      try { clean = sanitise(await callClaude(prompt)); } catch (e) { /* retry */ }
    }
    // Fail closed: never keep a broken value. If the model never returned a
    // clean title, fall back to a deterministic template title.
    if (!clean) {
      clean = slug === "home"
        ? `Local Locksmith in ${site.location} | 24/7 Call-Out`.slice(0, 60)
        : `${label} ${site.location} | 24/7 Locksmith`.slice(0, 65);
    }
    if (clean !== cache[key]) {
      cache[key] = clean;
      changed++;
    }
  }
  if (!args.dry_run) writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  totalUpdated += changed > 0 ? 1 : 0;
  console.log(`${changed}/14 titles refreshed`);
}
console.log(`\nDone. ${totalUpdated} cache files updated.`);

function parseArgs(a){ const o={}; for(let i=0;i<a.length;i++){const t=a[i];if(!t.startsWith("--"))continue;const k=t.slice(2).replace(/-/g,"_");const n=a[i+1];if(n&&!n.startsWith("--")){o[k]=n;i++;}else o[k]=true;}return o; }
