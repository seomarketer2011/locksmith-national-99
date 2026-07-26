#!/usr/bin/env node
// Enable Cloudflare Email Address Obfuscation on every locksmith fleet zone.
// This is a second scrape-protection layer on top of the client-side email
// assembly in the contact page templates. Only applies to domains proxied
// through a Cloudflare zone.
//
// Without flags: audit only (lists each zone's current setting).
// With --apply: turn the setting on where it is off.
// With --domain X: limit to a single domain.
//
// Required env: CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY  (or CLOUDFLARE_API_TOKEN).

import { readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SITES = JSON.parse(readFileSync(join(ROOT, "data", "locksmith-fleet", "sites.json"), "utf8"));

const args = parseArgs(process.argv.slice(2));
const APPLY = !!args.apply;
const ONLY = args.domain || null;

const email = process.env.CLOUDFLARE_EMAIL;
const key = process.env.CLOUDFLARE_API_KEY;
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token && !(email && key)) {
  console.error("Missing CF creds. Set CLOUDFLARE_API_TOKEN or CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY.");
  process.exit(1);
}
const H = token ? { Authorization: `Bearer ${token}` } : { "X-Auth-Email": email, "X-Auth-Key": key };

const targets = ONLY ? SITES.filter(s => s.domain === ONLY) : SITES;
console.log(`Checking email obfuscation on ${targets.length} domain(s).  apply=${APPLY}\n`);

const stats = { on: 0, off: 0, enabled: 0, no_zone: 0, error: 0 };

for (const site of targets) {
  const { domain } = site;
  try {
    const zoneId = await findZone(domain);
    if (!zoneId) { console.log(`  ${domain.padEnd(50)} no-zone`); stats.no_zone++; continue; }
    const setting = await cfGet(`/zones/${zoneId}/settings/email_obfuscation`);
    const value = setting.result && setting.result.value;
    if (value === "on") { console.log(`  ${domain.padEnd(50)} ON`); stats.on++; continue; }
    console.log(`  ${domain.padEnd(50)} OFF`);
    stats.off++;
    if (APPLY) {
      const upd = await cfPatch(`/zones/${zoneId}/settings/email_obfuscation`, { value: "on" });
      if (upd.success) { console.log(`    -> enabled`); stats.enabled++; }
      else { console.log(`    -> failed: ${JSON.stringify(upd.errors)}`); stats.error++; }
    }
  } catch (e) {
    console.log(`  ${domain.padEnd(50)} ERROR  ${e.message}`);
    stats.error++;
  }
}

console.log("\n--- Summary ---");
for (const [k, v] of Object.entries(stats)) console.log(`  ${k.padEnd(8)} ${v}`);
if (!APPLY && stats.off) console.log(`\nRerun with --apply to enable obfuscation on the ${stats.off} zone(s) currently off.`);

// ---- helpers ----

async function findZone(domain) {
  const parts = domain.split(".");
  const candidates = parts.length >= 3
    ? [domain, parts.slice(-3).join("."), parts.slice(-2).join(".")]
    : [domain];
  for (const cand of candidates) {
    const r = await cfGet(`/zones?name=${encodeURIComponent(cand)}`);
    if (r.result && r.result.length) return r.result[0].id;
  }
  return null;
}

async function cfGet(path) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers: H });
  return r.json();
}

async function cfPatch(path, body) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method: "PATCH",
    headers: { ...H, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (tok.startsWith("--")) {
      const k = tok.slice(2).replace(/-/g, "_");
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) { a[k] = next; i++; }
      else a[k] = true;
    }
  }
  return a;
}
