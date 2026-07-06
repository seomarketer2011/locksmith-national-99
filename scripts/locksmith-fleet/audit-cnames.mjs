#!/usr/bin/env node
// Audit + fix the apex CNAME for each locksmith fleet domain.
// Discovers any CNAME pointing at main.<project>.pages.dev (preview branch alias)
// and rewrites it to <project>.pages.dev (production alias).
//
// Without flags: audit only (lists what would change).
// With --apply: actually update DNS records.
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
console.log(`Auditing ${targets.length} domain(s).  apply=${APPLY}\n`);

const stats = { correct: 0, broken: 0, fixed: 0, no_zone: 0, no_cname: 0, error: 0 };

for (const site of targets) {
  const { domain, cf_project } = site;
  const want = `${cf_project}.pages.dev`;
  try {
    const zoneId = await findZone(domain);
    if (!zoneId) { console.log(`  ${domain.padEnd(50)} no-zone`); stats.no_zone++; continue; }
    const recs = await cfGet(`/zones/${zoneId}/dns_records?name=${encodeURIComponent(domain)}&type=CNAME`);
    if (!recs.result || !recs.result.length) { console.log(`  ${domain.padEnd(50)} no-CNAME`); stats.no_cname++; continue; }
    const rec = recs.result[0];
    if (rec.content === want) { console.log(`  ${domain.padEnd(50)} OK   (${rec.content})`); stats.correct++; continue; }
    console.log(`  ${domain.padEnd(50)} BROKEN  ${rec.content}  ->  ${want}`);
    stats.broken++;
    if (APPLY) {
      const body = { type: "CNAME", name: rec.name, content: want, proxied: rec.proxied, ttl: 1 };
      const upd = await cfPut(`/zones/${zoneId}/dns_records/${rec.id}`, body);
      if (upd.success) { console.log(`    -> updated`); stats.fixed++; }
      else { console.log(`    -> failed: ${JSON.stringify(upd.errors)}`); stats.error++; }
    }
  } catch (e) {
    console.log(`  ${domain.padEnd(50)} ERROR  ${e.message}`);
    stats.error++;
  }
}

console.log("\n--- Summary ---");
for (const [k, v] of Object.entries(stats)) console.log(`  ${k.padEnd(8)} ${v}`);
if (!APPLY && stats.broken) console.log(`\nRerun with --apply to fix the ${stats.broken} broken CNAME(s).`);

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

async function cfPut(path, body) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method: "PUT",
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
