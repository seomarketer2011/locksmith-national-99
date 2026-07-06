#!/usr/bin/env node
// Submit all live URLs to IndexNow (Bing + Yandex pick it up via this one endpoint).
//
// For each deployable site:
//   1. Verify https://<host>/<key>.txt exists and returns the key (IndexNow protocol check).
//   2. Build the URL list: every page in the Astro template (18 per site).
//   3. POST { host, key, keyLocation, urlList } to https://api.indexnow.org/indexnow.
//
// Usage:
//   node scripts/locksmith-fleet/indexnow-submit.mjs           # all deployable sites
//   node scripts/locksmith-fleet/indexnow-submit.mjs --domain X
//   node scripts/locksmith-fleet/indexnow-submit.mjs --dry-run
//
// Requires the key file to already be live on each site (templates/locksmith-fleet/public/<key>.txt).

import { readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const KEY = readFileSync(join(ROOT, "data", "locksmith-fleet", "indexnow-key.txt"), "utf8").trim();
const FLEET = JSON.parse(readFileSync(join(ROOT, "data", "locksmith-fleet", "sites.json"), "utf8"));

// Pages on every site (homepage + 17 sub-pages, from the Astro template's pages dir).
const PATHS = [
  "/", "/contact/", "/cookie/", "/privacy/",
  "/emergency-locksmith/", "/locked-out/", "/broken-key-removal/",
  "/burglar-repair-service/", "/emergency-boarding-up/",
  "/lock-changes/", "/lock-repairs/",
  "/door-lock-installation/", "/door-lock-replacement/", "/door-repairs/",
  "/window-lock-repair-replacement/",
  "/safe-installation/", "/safe-opening/",
];

const args = parseArgs(process.argv.slice(2));
const targets = args.domain
  ? FLEET.filter(s => s.domain === args.domain)
  : FLEET.filter(s => s.logo_present);

console.log(`Submitting ${targets.length} site(s) × ${PATHS.length} URLs = ${targets.length * PATHS.length} URLs to IndexNow.\n`);
console.log(`Key: ${KEY}\n`);

let okCount = 0, failCount = 0, keyMissing = 0;
const failures = [];

for (const site of targets) {
  const host = site.domain;
  const keyUrl = `https://${host}/${KEY}.txt`;
  process.stdout.write(`${host.padEnd(55)} `);

  // 1. Confirm key file is reachable on this host (IndexNow protocol prerequisite)
  try {
    const kr = await fetch(keyUrl, { method: "HEAD" });
    if (!kr.ok) { console.log(`key-file ${kr.status} — skipping`); keyMissing++; failures.push({ host, reason: `key file ${kr.status}` }); continue; }
  } catch (e) {
    console.log(`key-file ERR (${e.message?.slice(0,30)}) — skipping`); keyMissing++; failures.push({ host, reason: "key file fetch error" }); continue;
  }

  // 2. Build URL list + POST
  const urlList = PATHS.map(p => `https://${host}${p}`);
  if (args.dry_run) { console.log(`DRY (${urlList.length} URLs)`); continue; }

  try {
    const r = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key: KEY, keyLocation: keyUrl, urlList }),
    });
    const status = r.status;
    // IndexNow returns: 200 (success), 202 (accepted), 400/403/422 (errors)
    if (status === 200 || status === 202) {
      console.log(`✓ submitted ${urlList.length} URLs (${status})`);
      okCount++;
    } else {
      const body = await r.text();
      console.log(`✗ ${status}: ${body.slice(0, 80)}`);
      failCount++;
      failures.push({ host, reason: `HTTP ${status} ${body.slice(0,80)}` });
    }
  } catch (e) {
    console.log(`✗ network error: ${e.message?.slice(0,40)}`);
    failCount++;
    failures.push({ host, reason: e.message?.slice(0, 80) });
  }
  // Small pause to be courteous
  await new Promise(r => setTimeout(r, 100));
}

console.log(`\n--- Summary ---`);
console.log(`  Submitted OK:    ${okCount}`);
console.log(`  Key file missing: ${keyMissing}`);
console.log(`  Failed:          ${failCount}`);
if (failures.length) {
  console.log(`\nFailures:`);
  for (const f of failures) console.log(`  - ${f.host}  ${f.reason}`);
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i]; if (!t.startsWith("--")) continue;
    const k = t.slice(2).replace(/-/g, "_"); const n = argv[i+1];
    if (n && !n.startsWith("--")) { a[k] = n; i++; } else { a[k] = true; }
  }
  return a;
}
