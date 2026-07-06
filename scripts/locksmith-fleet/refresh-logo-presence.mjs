#!/usr/bin/env node
// Scans templates/locksmith-fleet/src/assets/logo/ for newly-added PNGs and flips
// `logo_present: true` for any site whose expected logo_url now exists on disk.
// Prints the list of newly-unblocked sites so you can redeploy them.
//
// Usage:
//   node scripts/locksmith-fleet/refresh-logo-presence.mjs            # apply changes
//   node scripts/locksmith-fleet/refresh-logo-presence.mjs --dry-run  # show without saving

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FLEET_JSON = join(ROOT, "data", "locksmith-fleet", "sites.json");
const LOGO_DIR = join(ROOT, "templates", "locksmith-fleet", "src", "assets", "logo");

const dryRun = process.argv.includes("--dry-run");
const fleet = JSON.parse(readFileSync(FLEET_JSON, "utf8"));

const newlyUnblocked = [];
const stillMissing = [];

for (const site of fleet) {
  const expected = join(LOGO_DIR, site.logo_url);
  const onDisk = existsSync(expected);
  if (onDisk && !site.logo_present) {
    site.logo_present = true;
    newlyUnblocked.push(site);
  } else if (!onDisk && site.logo_present) {
    // file deleted — flag but don't auto-flip
    console.log(`WARN ${site.domain}: marked present but file missing (${site.logo_url})`);
  } else if (!onDisk) {
    stillMissing.push(site);
  }
}

console.log(`\n${newlyUnblocked.length} newly unblocked site(s):`);
for (const s of newlyUnblocked) console.log(`  ✓ ${s.domain}  (${s.logo_url})`);

console.log(`\n${stillMissing.length} still missing logo(s).`);

if (!dryRun && newlyUnblocked.length > 0) {
  writeFileSync(FLEET_JSON, JSON.stringify(fleet, null, 2) + "\n");
  console.log(`\nUpdated ${FLEET_JSON}.`);
  const domains = newlyUnblocked.map(s => s.domain).join(",");
  console.log(`\nTo deploy the newly-unblocked sites in one go, run:`);
  console.log(`  for d in ${newlyUnblocked.map(s => s.domain).join(" ")}; do \\`);
  console.log(`    ANTHROPIC_API_KEY=... CLOUDFLARE_API_KEY=... CLOUDFLARE_EMAIL=... CLOUDFLARE_ACCOUNT_ID=... \\`);
  console.log(`    node scripts/locksmith-fleet/redeploy.mjs --domain "$d" --fix-cname; \\`);
  console.log(`  done`);
  console.log(`\nOr the simpler option (deploys everything that has a logo, skipping already-up-to-date):`);
  console.log(`  node scripts/locksmith-fleet/redeploy.mjs --deployable --fix-cname`);
} else if (dryRun && newlyUnblocked.length > 0) {
  console.log(`\nDRY RUN — sites.json not updated. Remove --dry-run to apply.`);
}
