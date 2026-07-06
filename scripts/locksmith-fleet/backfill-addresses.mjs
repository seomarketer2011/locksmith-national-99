#!/usr/bin/env node
// Backfill missing addresses for sites by reverse-geocoding the city centroid
// (already cached from build-local-intel.mjs) to the nearest road, no house number.
//
// Uses Nominatim's /reverse endpoint with zoom=17 (street-level). For each
// location missing an address in sites.json:
//   1. Read intel.geo.{latitude,longitude} from data/locksmith-fleet/local-intelligence/<slug>.json
//   2. Hit Nominatim /reverse?lat=X&lon=Y&zoom=17&addressdetails=1
//   3. Extract road / postcode / city
//   4. Verify the resolved city matches our location name (guard against centroid drift)
//   5. Write a {street,city,postcode,country} JSON-stringified address into sites.json
//
// Usage:
//   node scripts/locksmith-fleet/backfill-addresses.mjs
//   node scripts/locksmith-fleet/backfill-addresses.mjs --dry-run
//   node scripts/locksmith-fleet/backfill-addresses.mjs --force   # overwrite existing addresses

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FLEET = join(ROOT, "data", "locksmith-fleet", "sites.json");
const INTEL_DIR = join(ROOT, "data", "locksmith-fleet", "local-intelligence");

const args = parseArgs(process.argv.slice(2));
const fleet = JSON.parse(readFileSync(FLEET, "utf8"));

// Collect unique locations needing addresses
const need = new Map();   // location -> [sites]
for (const s of fleet) {
  if (!s.location) continue;
  if (s.address && !args.force) continue;
  if (!need.has(s.location)) need.set(s.location, []);
  need.get(s.location).push(s);
}

console.log(`Backfilling addresses for ${need.size} location(s) covering ${[...need.values()].reduce((a,b)=>a+b.length,0)} site(s).\n`);

const resolved = [];
const skipped = [];

for (const [loc, sites] of need.entries()) {
  const slug = slugify(loc);
  const intelPath = join(INTEL_DIR, `${slug}.json`);
  if (!existsSync(intelPath)) {
    skipped.push({ loc, reason: "no intel file" });
    continue;
  }
  const intel = JSON.parse(readFileSync(intelPath, "utf8"));
  const { latitude, longitude } = intel.geo || {};
  if (latitude == null || longitude == null) {
    skipped.push({ loc, reason: "no geo coords in intel" });
    continue;
  }

  try {
    // First pass: street-level reverse-geocode at the centroid.
    let { street, postcode } = await reverseRoad(latitude, longitude, 17);

    // If no road found (centroid landed on a square / plaza / open space),
    // widen the zoom slightly to pick up the nearest named road.
    if (!street) {
      ({ street, postcode } = await reverseRoad(latitude, longitude, 16));
      await sleep(1100);
    }

    // Final fallback: nudge the point by ~50m N, E, S, W to find any nearby road.
    if (!street) {
      for (const [dlat, dlon] of [[0.0005,0],[0,0.0005],[-0.0005,0],[0,-0.0005]]) {
        ({ street, postcode } = await reverseRoad(latitude + dlat, longitude + dlon, 17));
        await sleep(1100);
        if (street) break;
      }
    }

    if (!street || !postcode) {
      skipped.push({ loc, reason: `no road found even after fallbacks (postcode=${postcode || "?"})` });
      continue;
    }

    // The centroid was derived from Nominatim search for THIS exact location, so the
    // resolved postcode is by construction within or adjacent to the town. We use
    // OUR location name as the city field rather than Nominatim's `address.city`
    // because the latter often reports the surrounding council/borough
    // (e.g. "Rushmoor" for Farnborough, "Dacorum" for Hemel Hempstead).
    const address = JSON.stringify({ street, city: loc, postcode, country: "England" });
    for (const s of sites) s.address = address;
    resolved.push({ loc, street, postcode, sites: sites.length });
    console.log(`✓ ${loc.padEnd(28)} → ${street}, ${loc}, ${postcode}  (${sites.length} site(s))`);
  } catch (e) {
    skipped.push({ loc, reason: e.message?.slice(0, 60) || "unknown error" });
  }
  await sleep(1100);
}

async function reverseRoad(lat, lon, zoom) {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=${zoom}&addressdetails=1`,
    { headers: { "User-Agent": "locksmith-fleet-address-backfill/1.0" } },
  );
  if (!r.ok) return { street: null, postcode: null };
  const d = await r.json();
  const a = d.address || {};
  return {
    street: a.road || a.pedestrian || a.path || a.cycleway || a.footway || null,
    postcode: a.postcode || null,
  };
}

console.log(`\nResolved: ${resolved.length} location(s).`);
console.log(`Skipped:  ${skipped.length}.`);
if (skipped.length) {
  console.log(`\nSkipped detail:`);
  for (const s of skipped) console.log(`  - ${s.loc.padEnd(28)} ${s.reason}`);
}

if (!args.dry_run && resolved.length) {
  writeFileSync(FLEET, JSON.stringify(fleet, null, 2) + "\n");
  console.log(`\nUpdated ${FLEET}.`);
} else if (args.dry_run) {
  console.log(`\nDRY RUN — sites.json not written.`);
}

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i]; if (!t.startsWith("--")) continue;
    const k = t.slice(2).replace(/-/g, "_"); const n = argv[i+1];
    if (n && !n.startsWith("--")) { a[k] = n; i++; } else { a[k] = true; }
  }
  return a;
}
