#!/usr/bin/env node
// Build per-location intelligence by combining retrieved facts (Nominatim + OSM Overpass)
// with structured Claude Haiku synthesis. Output: data/locksmith-fleet/local-intelligence/<slug>.json
//
// Usage:
//   ANTHROPIC_API_KEY=... node scripts/locksmith-fleet/build-local-intel.mjs --location Oxford
//   node scripts/locksmith-fleet/build-local-intel.mjs --all
//   node scripts/locksmith-fleet/build-local-intel.mjs --location Oxford --force
//
// Per-location flow:
//   1. Nominatim geocode -> place metadata + bounding box  (free, no key)
//   2. OSM Overpass query within bbox -> named suburbs       (free, no key)
//   3. Claude Haiku synthesises a structured local-intel JSON, grounded on (1) and (2)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FLEET_JSON = join(ROOT, "data", "locksmith-fleet", "sites.json");
const OUT_DIR = join(ROOT, "data", "locksmith-fleet", "local-intelligence");

const args = parseArgs(process.argv.slice(2));
if (!args.location && !args.all) {
  console.error("Usage: --location <Name> | --all  [--force]");
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ERROR: ANTHROPIC_API_KEY not set");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const fleet = JSON.parse(readFileSync(FLEET_JSON, "utf8"));
const locations = args.all
  ? [...new Set(fleet.filter(s => s.logo_present).map(s => s.location))]
  : [args.location];

console.log(`Building local-intel for ${locations.length} location(s)\n`);

for (const loc of locations) {
  const slug = slugify(loc);
  const outPath = join(OUT_DIR, `${slug}.json`);
  if (existsSync(outPath) && !args.force) {
    console.log(`SKIP ${loc} (cached)`);
    continue;
  }
  console.log(`=== ${loc} ===`);
  try {
    const geo = await geocode(loc);
    console.log(`  geocode: ${geo ? `${geo.display_name.slice(0, 60)} (bbox ${geo.bbox.join(",")})` : "FAILED"}`);
    if (!geo) throw new Error("Nominatim returned no result");
    const { names: suburbs, points } = await fetchOsmSuburbs(geo.bbox);
    console.log(`  osm suburbs (${suburbs.length}): ${suburbs.slice(0, 8).join(", ")}${suburbs.length > 8 ? "..." : ""}`);

    const intel = await synthesise(loc, geo, suburbs);
    intel.all_areas = suburbs;
    intel.geo = { latitude: geo.lat, longitude: geo.lon };

    console.log(`  resolving postcode districts via postcodes.io...`);
    const { postcode_districts, postcode_meta, postcode_rejected } = await discoverPostcodes(loc, points);
    intel.postcode_districts = postcode_districts;
    intel.postcode_meta = postcode_meta;
    const rejectedKeys = Object.keys(postcode_rejected);
    console.log(`  ✓ verified ${postcode_districts.length} in-city outcodes: ${postcode_districts.join(", ") || "(none)"}`);
    if (rejectedKeys.length) {
      const sample = Object.entries(postcode_rejected).slice(0, 3)
        .map(([oc, m]) => `${oc} (${m.admin})`).join(", ");
      console.log(`  ✗ rejected ${rejectedKeys.length} outside-city outcodes: ${sample}${rejectedKeys.length > 3 ? "..." : ""}`);
    }

    writeFileSync(outPath, JSON.stringify(intel, null, 2));
    console.log(`  -> wrote ${outPath}\n`);
  } catch (e) {
    console.error(`  FAIL: ${e.message}\n`);
  }
}

// ---------- sources ----------

async function geocode(location) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ", United Kingdom")}&format=json&limit=1&addressdetails=1&extratags=1`;
  const r = await fetch(url, { headers: { "User-Agent": "locksmith-fleet-intel/1.0" } });
  if (!r.ok) return null;
  const arr = await r.json();
  if (!arr.length) return null;
  const it = arr[0];
  // boundingbox is [south, north, west, east]
  const [s, n, w, e] = it.boundingbox.map(Number);
  return {
    display_name: it.display_name,
    type: it.type,
    class: it.class,
    address: it.address || {},
    bbox: [s, w, n, e],   // overpass-friendly order
    lat: parseFloat(it.lat),
    lon: parseFloat(it.lon),
  };
}

async function fetchOsmSuburbs(bbox) {
  const [s, w, n, e] = bbox;
  // `out;` (not `out tags;`) returns lat/lon for each node — needed for postcode lookup.
  const query = `
    [out:json][timeout:25];
    (
      node["place"~"^(suburb|quarter|neighbourhood|village)$"](${s},${w},${n},${e});
    );
    out;
  `;
  const r = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "locksmith-fleet-intel/1.0" },
    body: "data=" + encodeURIComponent(query),
  });
  if (!r.ok) return { names: [], points: [] };
  const d = await r.json();
  const points = d.elements
    .filter(e => e.tags?.name && typeof e.lat === "number" && typeof e.lon === "number")
    .map(e => ({ name: e.tags.name, lat: e.lat, lon: e.lon }));
  // De-dupe by name, keep first occurrence.
  const seen = new Set();
  const unique = points.filter(p => seen.has(p.name) ? false : (seen.add(p.name), true));
  return { names: unique.map(p => p.name).sort(), points: unique };
}

// Reverse-geocode each OSM area centroid via postcodes.io. Only keep postcode districts
// whose admin_district matches the location name — this is the 100% guard against
// "OX5/OX13 type" outcodes that belong to neighbouring councils.
async function discoverPostcodes(location, points) {
  const verified = new Map();
  const rejected = new Map();
  const loc = location.toLowerCase();

  // A postcode point is "in the city" if any of these fields contains the location name:
  // admin_district  (council/unitary)         — works for "Oxford", "Manchester"
  // admin_ward      (electoral ward)          — works for towns inside a borough e.g. "Bebington" in Wirral
  // parish          (civil parish)            — fallback for villages/towns inside a unitary authority
  // parliamentary_constituency                — last-resort fallback, can be looser
  // We exclude county-level matches (e.g. "Oxfordshire" when location is "Oxford").
  function isInCity(pc) {
    const admin = (pc.admin_district || "").toLowerCase();
    const ward  = (pc.admin_ward || "").toLowerCase();
    const par   = (pc.parish || "").toLowerCase();
    const con   = (pc.parliamentary_constituency || "").toLowerCase();

    // Reject pure county-level match
    if (admin === loc + "shire") return { matched: false, via: admin };

    if (admin.includes(loc)) return { matched: true, via: `admin_district=${admin}` };
    if (ward.includes(loc))  return { matched: true, via: `admin_ward=${ward}` };
    if (par.includes(loc))   return { matched: true, via: `parish=${par}` };
    if (con.includes(loc))   return { matched: true, via: `constituency=${con}` };
    return { matched: false, via: `district=${admin}, ward=${ward}` };
  }

  for (const p of points) {
    try {
      const r = await fetch(`https://api.postcodes.io/postcodes?lat=${p.lat}&lon=${p.lon}&limit=1`, {
        headers: { "User-Agent": "locksmith-fleet-intel/1.0" },
      });
      if (!r.ok) continue;
      const d = await r.json();
      if (!d.result?.length) continue;
      const pc = d.result[0];
      const { matched, via } = isInCity(pc);
      const bucket = matched ? verified : rejected;
      const entry = bucket.get(pc.outcode) || { count: 0, sample: pc.postcode, admin: pc.admin_district || "", via };
      entry.count += 1;
      bucket.set(pc.outcode, entry);
    } catch { /* swallow individual failures */ }
    await new Promise(r => setTimeout(r, 30));
  }
  return {
    postcode_districts: [...verified.keys()].sort(),
    postcode_meta: Object.fromEntries(verified),
    postcode_rejected: Object.fromEntries(rejected),
  };
}

async function synthesise(location, geo, suburbs) {
  const facts = [
    `Location: ${location}`,
    `Nominatim place type: ${geo.type} (${geo.class})`,
    `Region: ${geo.address.state || geo.address.region || ""}`.trim(),
    `County: ${geo.address.county || ""}`.trim(),
    `Approx coords: ${geo.lat}, ${geo.lon}`,
    suburbs.length
      ? `OSM-confirmed named areas inside this place (${suburbs.length}): ${suburbs.slice(0, 60).join(", ")}`
      : "No OSM suburb data available — keep neighborhoods array empty.",
  ].filter(Boolean).join("\n");

  const prompt = `You are building a structured "local intelligence" record for a locksmith website serving ${location}, UK.

RETRIEVED FACTS:
${facts}

You may use your general training knowledge about ${location} for era and property type, but every NEIGHBORHOOD name in your output MUST appear in the OSM-confirmed list above. If the OSM list is empty, return an empty neighborhoods array.

Output strict JSON only, no markdown fences:
{
  "location": "${location}",
  "neighborhoods": [
    // up to 20 entries; pick the ones residents/locksmiths would actually name.
    // Each is an object — DO NOT use plain strings. Skip an area if you have nothing real to say about it.
    {
      "name": "exact OSM name",
      "era": "one short label e.g. 'Victorian', 'Edwardian', 'interwar', 'post-war', '1960s', 'modern'",
      "types": ["1-2 short property type labels e.g. 'terrace', 'semi-detached', 'villa', 'council estate', 'student HMO', 'flat', 'new-build'"],
      "notes": "optional 1 short phrase e.g. 'conservation area', 'listed buildings', 'high HMO density', 'student let area' — only if non-obvious"
    }
  ],
  "property_mix": {
    "dominant_types": [2-4 short labels],
    "era": "one short phrase e.g. 'predominantly pre-1945' or 'mixed Victorian and post-war'",
    "notable": "one or two specific city-wide characteristics"
  },
  "locksmith_relevant": [
    3 sentences (max 25 words each) connecting real local property facts to specific locksmith concerns.
    Each must be city-specific, not generic.
  ]
}

Be specific to ${location}. Aim for 15-20 neighborhoods if the OSM list supports it. Keep output shorter rather than fabricating.`;

  const out = await callClaude(prompt, 3000);
  const cleaned = out.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  parsed.sources = {
    nominatim: `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}`,
    overpass: suburbs.length ? `OSM Overpass bbox query, ${suburbs.length} named areas` : null,
    coords: { lat: geo.lat, lon: geo.lon },
  };
  parsed.generated_at = new Date().toISOString();
  return parsed;
}

async function callClaude(prompt, maxTokens = 1024) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`Claude API ${r.status}: ${await r.text()}`);
  const d = await r.json();
  return d.content.filter(b => b.type === "text").map(b => b.text).join("\n");
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (tok.startsWith("--")) {
      const key = tok.slice(2).replace(/-/g, "_");
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) { a[key] = next; i++; } else { a[key] = true; }
    }
  }
  return a;
}
