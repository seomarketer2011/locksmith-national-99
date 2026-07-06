#!/usr/bin/env node
// Enrich a single locksmith site's content using local-intelligence data + Claude Haiku.
// Reads site config from sites.json, intel from local-intelligence/<slug>.json, and writes
// per-site enriched.json that the Astro template consumes at build time.
//
// Usage:
//   ANTHROPIC_API_KEY=... node scripts/locksmith-fleet/enrich-site.mjs --domain oxford.boltfix-locksmiths.co.uk
//   ... --domain X --out /custom/path/enriched.json
//   ... --domain X --force                       # ignore cache

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FLEET_JSON = join(ROOT, "data", "locksmith-fleet", "sites.json");
const INTEL_DIR = join(ROOT, "data", "locksmith-fleet", "local-intelligence");
const OUT_ROOT = join(ROOT, "output", "locksmith-fleet");

const args = parseArgs(process.argv.slice(2));
if (!args.domain) {
  console.error("Usage: --domain <domain>  [--out PATH] [--force]");
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ERROR: ANTHROPIC_API_KEY not set");
  process.exit(1);
}

const fleet = JSON.parse(readFileSync(FLEET_JSON, "utf8"));
const site = fleet.find(s => s.domain === args.domain);
if (!site) { console.error(`Domain not in fleet: ${args.domain}`); process.exit(1); }

const intelPath = join(INTEL_DIR, `${slugify(site.location)}.json`);
if (!existsSync(intelPath)) {
  console.error(`Local intel not found: ${intelPath}\nRun: node scripts/locksmith-fleet/build-local-intel.mjs --location "${site.location}"`);
  process.exit(1);
}
const intel = JSON.parse(readFileSync(intelPath, "utf8"));

console.log(`Enriching ${site.domain} (${site.location}, ${site.name})`);

const regions = await buildRegions();
const enriched = {};
// Track openings already used in any local-context-body region so later regions
// can be told what NOT to start with. Keyed by the first 50 chars.
const usedOpenings = [];

for (const [id, region] of Object.entries(regions)) {
  process.stdout.write(`  ${id.padEnd(40)} `);
  try {
    // Per-region neighborhood allocation: each region gets a different rotating slice.
    const picks = allocateNeighborhoods(id, intel.neighborhoods || [], 3);
    const avoidOpenings = id.endsWith(".local-context-body") || id === "home.local-context-body"
      ? usedOpenings.slice(-6)
      : [];

    const prompt = region.prompt({ site, intel, seed: region.seed, picks, avoidOpenings });
    const raw = await callClaude(prompt, region.maxTokens || 400);
    const parsed = region.parse ? region.parse(raw) : sanitise(raw);

    if (id.endsWith(".local-context-body") || id === "home.local-context-body") {
      const opening = (typeof parsed === "string" ? parsed : "").slice(0, 50);
      if (opening) usedOpenings.push(opening);
    }

    enriched[id] = parsed;
    const preview = typeof parsed === "string" ? parsed.slice(0, 50) : JSON.stringify(parsed).slice(0, 50);
    const allocated = picks.length ? `[${picks.map(p => p.name).join("/")}]` : "";
    console.log(`OK   ${allocated} ${preview}...`);
  } catch (e) {
    console.log(`FAIL ${e.message}`);
  }
}

// ---------- Areas-covered allocation (no AI, deterministic) ----------
// Goal: every OSM-confirmed area appears on ≥1 page across the site.
// Homepage shows ALL areas; each service page shows a rotated slice of 8.
const allAreas = Array.isArray(intel.all_areas) ? intel.all_areas : [];
const primaryAreas = (intel.neighborhoods || []).map(n => typeof n === "string" ? n : n.name).filter(Boolean);

const serviceSlugs = getServices(site).map(s => s.slug);
const slotsPerPage = 8;

// Deterministic shuffle seeded on the site domain so re-runs are stable.
function seededShuffle(arr, seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = (h >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const allocation = Object.fromEntries(serviceSlugs.map(s => [s, []]));
const shuffled = seededShuffle(allAreas, site.domain);

// Round-robin: every area gets assigned to exactly one service page first.
shuffled.forEach((area, i) => {
  const page = serviceSlugs[i % serviceSlugs.length];
  allocation[page].push(area);
});

// Top up each page to slotsPerPage using primary areas (which may already be present).
const primaryPool = seededShuffle(primaryAreas, site.domain + ":primary");
for (const slug of serviceSlugs) {
  let i = 0;
  while (allocation[slug].length < slotsPerPage && i < primaryPool.length * 2) {
    const candidate = primaryPool[i % primaryPool.length];
    if (!allocation[slug].includes(candidate)) allocation[slug].push(candidate);
    i++;
  }
}

// Inject into enriched JSON. Homepage gets ALL areas; service pages get their slot.
enriched["home.areas-covered"] = allAreas;
for (const slug of serviceSlugs) {
  enriched[`${slug}.areas-covered`] = allocation[slug];
}

// Coverage report
const everyAreaCovered = allAreas.every(a => serviceSlugs.some(s => allocation[s].includes(a)));
const totalMentions = serviceSlugs.reduce((sum, s) => sum + allocation[s].length, 0);
console.log(`\nAreas coverage:`);
console.log(`  total OSM areas:          ${allAreas.length}`);
console.log(`  every area on ≥1 service: ${everyAreaCovered ? "YES" : "NO"}`);
console.log(`  total service-page slots: ${totalMentions} (${(totalMentions/allAreas.length).toFixed(1)}× redundancy)`);
console.log(`  homepage shows:           ${allAreas.length} areas (dense)`);

const outPath = args.out || join(OUT_ROOT, site.cf_project, "src", "data", "enriched.json");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(enriched, null, 2));
console.log(`\nWrote ${outPath} (${Object.keys(enriched).length} regions)`);

// ---------- region registry ----------

// Each service page: the human-facing service label, a one-line description
// for the prompt, and the seed title/description currently in the template.
function getServices(site) { return [
  { slug: "emergency-locksmith",        label: "Emergency Locksmith",         desc: "24/7 urgent lockouts, snapped keys, doors that won't lock, post-break-in security",
    titleSeed: `Emergency Locksmith in ${site.location} – 24/7 Urgent Call-Outs`,
    descSeed:  `24/7 emergency locksmith in ${site.location}. Locked out? Key snapped? Urgent lock repairs and replacements. Fast response, non-destructive entry. Available 24 hours.` },
  { slug: "locked-out",                 label: "Locked Out",                  desc: "non-destructive entry when keys are lost, snapped, or left inside",
    titleSeed: `Locked Out in ${site.location}? | Fast, Damage-Minimising Emergency Lockout Service`,
    descSeed:  `Emergency lockout service in ${site.location}. Lost keys? Locked out? We provide fast, non-destructive entry to get you back inside quickly. 24/7 emergency locksmith service for homes, flats & businesses.` },
  { slug: "broken-key-removal",         label: "Broken Key Removal",          desc: "extracting snapped keys from euro cylinders, mortice locks and night latches",
    titleSeed: `Broken Key Removal ${site.location} | Emergency Snapped Key Extraction`,
    descSeed:  `Emergency broken key removal in ${site.location}. Key snapped in lock? Locked out? Professional extraction for uPVC, mortice & night latch locks. Non-destructive methods, 24/7 service.` },
  { slug: "burglar-repair-service",     label: "Burglar Repair Service",      desc: "post-break-in lock and door repair, insurance-quality reinstatement",
    titleSeed: `Burglar Repair Service ${site.location} | Post-Break-in Lock Repair`,
    descSeed:  `Burglar repair service in ${site.location}. Post-break-in lock changes, door repairs and security upgrades. Insurance-compliant work, fast response.` },
  { slug: "emergency-boarding-up",      label: "Emergency Boarding Up",       desc: "boarding up smashed doors and windows after break-ins or storm damage",
    titleSeed: `Emergency Boarding Up ${site.location} | 24/7 Property Securing`,
    descSeed:  `Emergency boarding up in ${site.location}. Smashed doors and windows boarded the same day to secure your property after break-ins or accidents.` },
  { slug: "lock-changes",               label: "Lock Changes",                desc: "replacing locks after moving home, key loss, or for security upgrades",
    titleSeed: `Door Lock Change ${site.location} | Fast, Professional Lock Replacement`,
    descSeed:  `Emergency door lock change in ${site.location}. Lost keys? Moving home? Need lock replacement fast? Professional lock change service for uPVC, timber & composite doors.` },
  { slug: "lock-repairs",               label: "Lock Repairs",                desc: "repairing failed locks: gearbox, multipoint, mortice, night latch",
    titleSeed: `Door Lock Repair ${site.location} | Professional Lock Repair Services`,
    descSeed:  `Expert door lock repair in ${site.location}. Fix jammed locks, broken keys, uPVC multipoint locks, mortice locks & security upgrades. 24/7 emergency service available.` },
  { slug: "door-lock-installation",     label: "Door Lock Installation",      desc: "fitting new locks: BS3621 mortice, TS007 anti-snap cylinders, multipoint",
    titleSeed: `Door Lock Installation ${site.location} | New Lock Fitting Service`,
    descSeed:  `Door lock installation in ${site.location}. New mortice locks, anti-snap cylinders, multipoint replacements. BS3621 and TS007 compliant fitting for homes and businesses.` },
  { slug: "door-lock-replacement",      label: "Door Lock Replacement",       desc: "swapping like-for-like or upgrading a failed/insecure lock",
    titleSeed: `Door Lock Replacement ${site.location} | Like-for-Like or Upgrade`,
    descSeed:  `Door lock replacement in ${site.location}. Like-for-like swaps or security upgrades for uPVC, timber and composite doors. Same-day service available.` },
  { slug: "door-repairs",               label: "Door Repairs",                desc: "fixing misaligned, dropped or damaged doors and hardware",
    titleSeed: `Door Repairs ${site.location} | uPVC, Composite & Timber Repair`,
    descSeed:  `Door repairs in ${site.location}. uPVC alignment, gearbox replacement, composite door realignment, timber door easing and handle repair.` },
  { slug: "window-lock-repair-replacement", label: "Window Lock Repair & Replacement", desc: "fixing or replacing failed window espagnolette and shootbolt locks",
    titleSeed: `Window Lock Repair & Replacement ${site.location}`,
    descSeed:  `Window lock repair and replacement in ${site.location}. Failed espagnolette, shootbolt and handle locks fixed or replaced on uPVC, aluminium and timber windows.` },
  { slug: "safe-installation",          label: "Safe Installation",           desc: "fitting wall, floor and freestanding safes with proper anchoring and insurance documentation",
    titleSeed: `Safe Installation ${site.location} | Professional Safe Fitting & Anchoring`,
    descSeed:  `Professional safe installation in ${site.location}. Secure anchoring, anti-leverage positioning, insurance compliance. Wall, floor and freestanding safes.` },
  { slug: "safe-opening",               label: "Safe Opening",                desc: "non-destructive safe opening: lost combinations, lost keys, lockouts",
    titleSeed: `Safe Opening ${site.location} | Non-Destructive Safe Unlocking`,
    descSeed:  `Safe opening service in ${site.location}. Lost combinations, lost keys, jammed safes opened non-destructively where possible. Domestic and commercial safes.` },
];}

async function buildRegions() {
  // Each region: a prompt builder + max tokens + optional parser for non-string outputs.
  // The prompt receives: { site, intel, seed }.
  const regions = {};

  // homepage regions
  regions["meta.title"] = {
    seed: `Locksmith in ${site.location}`,
    maxTokens: 80,
    prompt: ({ site, intel, seed, picks, avoidOpenings }) => commonContext(site, intel, picks, avoidOpenings) + `

TASK: Rewrite this homepage <title>. Must be 50-60 chars. Style: clean, direct, action-oriented like a Google Ad headline. Must mention "${site.location}" and a service signal (locksmith / 24/7 / emergency / call-out / same-day / trusted local). NO property types in the title. NO words like "Specialists", "Experts", "Period", "Victorian", "Listed", "HMO". NO clickbait or all-caps. Output only the title — no surrounding quotes, no count notation like "(60 chars)".

Good examples:
  "Local Locksmith in ${site.location} | 24/7 Call-Out"
  "Trusted ${site.location} Locksmith – Same-Day Service"
  "Emergency Locksmith ${site.location} | No Call-Out Fee"

Current seed: "${seed}"`,
  };
  regions["meta.description"] = {
    seed: `Trusted local locksmith in ${site.location}. Emergency call-outs, lock changes, repairs, and security upgrades for homes and businesses.`,
    maxTokens: 140,
    prompt: ({ site, intel, seed, picks, avoidOpenings }) => commonContext(site, intel, picks, avoidOpenings) + `

TASK: Rewrite this homepage meta description. Must be 145-160 chars. Mention "${site.location}" and at least one locally-specific signal. Plain factual register. Output only the description.

Current seed: "${seed}"`,
  };
  regions["home.hero-paragraph"] = {
    seed: `24/7 Local Locksmith in ${site.location} • Rapid Arrival 30–60 Mins • Damage-Free First • Quote Confirmed Before Work • Parts Carried • DBS Checked, Fully Insured.`,
    maxTokens: 220,
    prompt: ({ site, intel, seed, picks, avoidOpenings }) => commonContext(site, intel, picks, avoidOpenings) + `

TASK: Rewrite the homepage hero paragraph. 35-60 words. Plain register, no clichés.
- Mention ${site.location} once
- Reference at least one locally-specific anchor (a named area or property/lock type from the intel)
- Cover the points the seed covers (24/7, rapid arrival, damage-free entry, transparent pricing) but reword
- Output one paragraph only. No bullets, no labels, no quotes.

Current seed: "${seed}"`,
  };
  regions["home.local-context-heading"] = {
    seed: `Locksmith work across ${site.location}`,
    maxTokens: 40,
    prompt: ({ site, intel, seed, picks, avoidOpenings }) => commonContext(site, intel, picks, avoidOpenings) + `

TASK: Produce a H2 heading for a "local context" section on the homepage. 4-7 words. No quotes, no labels.

Current seed: "${seed}"`,
  };
  regions["home.local-context-body"] = {
    seed: "",
    maxTokens: 500,
    prompt: ({ site, intel, picks, avoidOpenings }) => commonContext(site, intel, picks, avoidOpenings) + `

TASK: 2 short paragraphs (70-110 words total). Audience: homeowner/landlord in ${site.location}.
- Para 1: connect local property mix/era to lock work commonly needed. Name at least one neighborhood from intel.
- Para 2: a practical note about a local concern (HMO rules, conservation, common door types).
- Plain factual register. No "we" voice. No marketing. No exclamations. No bullets.

Output two paragraphs separated by blank line. No labels, no quotes, no markdown.`,
  };
  regions["home.local-faqs"] = {
    seed: "",
    maxTokens: 500,
    prompt: ({ site, intel, picks, avoidOpenings }) => commonContext(site, intel, picks, avoidOpenings) + `

TASK: 2 city-specific FAQ entries for the locksmith homepage. Each FAQ must reference something specific to ${site.location} from the intel.

Output strict JSON only, no markdown fences:
[
  { "q": "Question referencing a named area from intel?", "a": "1-2 sentences, practical." },
  { "q": "Question about a locally-specific concern (HMO standards, listed buildings, common door type)", "a": "1-2 sentences." }
]`,
    parse: (raw) => JSON.parse(raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()),
  };

  // service page regions — 5 per service × 13 services
  for (const svc of getServices(site)) {
    const ctx = `Service: ${svc.label} (${svc.desc}). Page slug: ${svc.slug}.`;

    regions[`${svc.slug}.meta.title`] = {
      seed: svc.titleSeed,
      maxTokens: 80,
      prompt: ({ site, intel, seed, picks, avoidOpenings }) => commonContext(site, intel, picks, avoidOpenings) + `\n\n${ctx}\n\nTASK: Rewrite the page <title> for the ${svc.label} service page. 50-60 chars. Style: clean, direct, like a Google Ad headline. Must mention ${site.location} and "${svc.label}". Add ONE simple trust/action signal where natural (e.g. "24/7", "fast", "same-day", "no call-out fee", "trusted local"). NO property types. NO words like "Specialists", "Experts", "Period", "Victorian", "Listed", "HMO", "Heritage". NO clickbait, NO all-caps, NO surrounding quotes, NO count notation like "(60 chars)". Output only the title.\n\nGood examples for context:\n  "Emergency Locksmith ${site.location} – 24/7 Call-Out"\n  "Lock Changes in ${site.location} | Same-Day Service"\n  "Door Repairs ${site.location} | Trusted Local Locksmith"\n\nCurrent seed: "${seed}"`,
    };

    regions[`${svc.slug}.meta.description`] = {
      seed: svc.descSeed,
      maxTokens: 140,
      prompt: ({ site, intel, seed, picks, avoidOpenings }) => commonContext(site, intel, picks, avoidOpenings) + `\n\n${ctx}\n\nTASK: Rewrite the meta description. 145-160 chars. Mention ${site.location} and the ${svc.label} service. Include one local anchor (neighborhood, property type, or local rule). Plain factual register. Output description only.\n\nCurrent seed: "${seed}"`,
    };

    regions[`${svc.slug}.hero-paragraph`] = {
      seed: "",
      maxTokens: 220,
      prompt: ({ site, intel, picks, avoidOpenings }) => commonContext(site, intel, picks, avoidOpenings) + `\n\n${ctx}\n\nTASK: Write the hero paragraph that appears below the H1 on the ${svc.label} service page. 35-60 words.\n- Mention ${site.location} once\n- Reference one local anchor (named neighborhood or property type from intel) where natural for this service\n- Cover the practical promise: what we do, how fast, non-destructive where possible, transparent pricing\n- Plain register, no clichés, no marketing exclamations\n- Output one paragraph only. No bullets, no labels, no quotes.`,
    };

    regions[`${svc.slug}.local-context-body`] = {
      seed: "",
      maxTokens: 500,
      prompt: ({ site, intel, picks, avoidOpenings }) => commonContext(site, intel, picks, avoidOpenings) + `\n\n${ctx}\n\nTASK: 2 short paragraphs (70-110 words total) for a "Local context" section on the ${svc.label} page in ${site.location}.\n- Para 1: how this service plays out specifically in ${site.location}'s housing stock. Name at least one neighborhood AND one property type from intel relevant to ${svc.label}.\n- Para 2: a practical local consideration that affects ${svc.label} work specifically (e.g. listed-building rules, HMO standards, common door material, lock type prevalence).\n- Plain factual register. No "we" voice. No marketing. No bullets.\n\nOutput two paragraphs separated by blank line. No labels, no quotes, no markdown.`,
    };

    regions[`${svc.slug}.local-faqs`] = {
      seed: "",
      maxTokens: 500,
      prompt: ({ site, intel, picks, avoidOpenings }) => commonContext(site, intel, picks, avoidOpenings) + `\n\n${ctx}\n\nTASK: 2 FAQ entries for the ${svc.label} page that are BOTH specific to ${svc.label} AND specific to ${site.location}. Each must reference something concrete from the intel (a named area, property type, or local rule).\n\nOutput strict JSON only, no markdown fences:\n[\n  { "q": "Service-specific question with a local hook", "a": "1-2 sentences, practical." },\n  { "q": "Different service-specific question with a different local hook", "a": "1-2 sentences." }\n]`,
      parse: (raw) => JSON.parse(raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()),
    };
  }

  return regions;
}

// Deterministic neighborhood allocator: hash regionKey to pick a starting offset,
// then return `count` neighborhoods in rotation. Same input -> same output every run.
// Handles both the new {name,era,types,notes} format and legacy string-array format.
function allocateNeighborhoods(regionKey, all, count = 3) {
  if (!Array.isArray(all) || all.length === 0) return [];
  // Normalise to object form
  const objs = all.map(n => typeof n === "string" ? { name: n } : n);
  let h = 0;
  for (let i = 0; i < regionKey.length; i++) h = ((h * 31) + regionKey.charCodeAt(i)) >>> 0;
  const start = h % objs.length;
  const picks = [];
  const want = Math.min(count, objs.length);
  for (let i = 0; i < want; i++) picks.push(objs[(start + i) % objs.length]);
  return picks;
}

function commonContext(site, intel, picks = [], avoidOpenings = []) {
  // Show ONLY the allocated picks if provided — keeps each region focused on different
  // neighborhoods so the site as a whole references far more places.
  const neighborhoodList = picks.length > 0
    ? picks.map(n => `  • ${n.name} (${n.era || "?"}; ${(n.types || []).join("/")}) ${n.notes ? "— " + n.notes : ""}`).join("\n")
    : (intel.neighborhoods || []).slice(0, 6).map(n => {
        const o = typeof n === "string" ? { name: n } : n;
        return `  • ${o.name}`;
      }).join("\n");

  const allocation = picks.length > 0
    ? `\nIMPORTANT FOR THIS REGION ONLY: reference these neighborhoods (one or two of them, as natural), no other neighborhood names from elsewhere:\n${neighborhoodList}\n`
    : `\nNeighborhoods you may reference:\n${neighborhoodList}\n`;

  const avoid = avoidOpenings.length > 0
    ? `\nDO NOT start your output with any of these openings (already used elsewhere on the site):\n${avoidOpenings.map(o => `  - "${o}..."`).join("\n")}\n`
    : "";

  return `Site: ${site.name} (${site.domain})
Phone: ${site.phone}
Location: ${site.location}

Local intelligence (use these facts; do not contradict them):
- Property mix (city-wide): ${(intel.property_mix?.dominant_types || []).join(", ") || "(unknown)"}
- Era (city-wide): ${intel.property_mix?.era || "(unknown)"}
- Notable (city-wide): ${intel.property_mix?.notable || ""}
- Locksmith-relevant context:
${(intel.locksmith_relevant || []).map(l => "  • " + l).join("\n")}
${allocation}${avoid}`;
}

async function callClaude(prompt, maxTokens = 400) {
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
  if (!r.ok) throw new Error(`Claude API ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const d = await r.json();
  return d.content.filter(b => b.type === "text").map(b => b.text).join("\n");
}

function sanitise(text) {
  let t = text.trim();
  t = t.replace(/^#+\s*/, "");                                              // markdown header
  t = t.replace(/^["'`]|["'`]$/g, "");                                      // wrapping quotes
  t = t.replace(/^(Title|Description|Heading|Output|Answer|Hero|Hero Paragraph|Paragraph):\s*/i, "");
  // If first line is short (< 60 chars) and followed by blank line, it's a label/heading Claude prepended.
  const lines = t.split("\n");
  if (lines.length >= 3 && lines[0].length < 60 && lines[1].trim() === "" && lines[0].trim().length > 0) {
    t = lines.slice(2).join("\n").trim();
  }
  t = t.trim();
  // Reject obviously-broken outputs (Claude returning char-count notation instead of the content).
  if (/^\(\s*\d+\s*(chars|characters)\s*\)$/i.test(t)) return "";
  return t;
}

function postCleanCachedFile(obj) {
  // Run sanitise() over every string-valued region. Used to clean cached output.
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === "string") obj[k] = sanitise(obj[k]);
  }
  return obj;
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
