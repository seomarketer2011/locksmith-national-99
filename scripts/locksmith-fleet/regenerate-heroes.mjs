#!/usr/bin/env node
// Regenerate hero paragraphs (homepage + 13 service pages) for each site.
// Also sets the homepage meta.title to the deterministic entity-hub pattern.
// Cost: ~14 AI calls × ~$0.001 = ~$0.014 per site.
//
// Hero first sentence rule (every page):
//   MUST contain: service name + location + "locksmith" + "locksmithing"
//
// Homepage title pattern (deterministic, no AI):
//   "Locksmith {Location} | Local Locksmithing Service 24/7"
//   With char-budget fallback: drop "Service", then "Local" — never drop
//   "Locksmithing" or the trust signal.
//
// Usage:
//   ANTHROPIC_API_KEY=... node scripts/locksmith-fleet/regenerate-heroes.mjs --domain X
//   ANTHROPIC_API_KEY=... node scripts/locksmith-fleet/regenerate-heroes.mjs       (all)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CACHE = join(ROOT, "data", "locksmith-fleet", "enriched-cache");
const INTEL_DIR = join(ROOT, "data", "locksmith-fleet", "local-intelligence");
const FLEET = JSON.parse(readFileSync(join(ROOT, "data", "locksmith-fleet", "sites.json"), "utf8"));

const args = parseArgs(process.argv.slice(2));
if (!process.env.ANTHROPIC_API_KEY) { console.error("ANTHROPIC_API_KEY required"); process.exit(1); }

// Per-service entity package — used to load each hero with topical signals
// beyond just the service+location+entity-pair requirement.
const SERVICES = [
  { slug: "emergency-locksmith", label: "emergency locksmith",
    tech: ["non-destructive entry","snap-key extraction","lockpicking"],
    symptoms: ["lockouts","snapped keys","doors that won't lock","post-break-in repairs"],
    standards: ["DBS checked","24/7 response"] },
  { slug: "locked-out", label: "locked out",
    tech: ["non-destructive entry","lockpicking","key impressioning"],
    symptoms: ["lost keys","keys locked inside","door slammed shut","snapped key"],
    standards: ["damage-free entry"] },
  { slug: "broken-key-removal", label: "broken key removal",
    tech: ["key extractor tools","broken-key probes","euro cylinders","mortice locks"],
    symptoms: ["snapped keys","sheared keys","keys stuck in the lock"],
    standards: ["non-destructive method"] },
  { slug: "burglar-repair-service", label: "burglar repair",
    tech: ["door reinforcement","TS007 anti-snap cylinders","BS3621 mortice locks"],
    symptoms: ["damaged doors","smashed locks","forced entry repairs"],
    standards: ["insurance-compliant","BS3621","TS007"] },
  { slug: "emergency-boarding-up", label: "emergency boarding up",
    tech: ["plywood boards","security screws","weatherproof temporary seal"],
    symptoms: ["smashed windows","damaged doors","broken glazing"],
    standards: ["24/7","insurance-compliant"] },
  { slug: "lock-changes", label: "lock changes",
    tech: ["BS3621 mortice","TS007 anti-snap cylinders","euro cylinders","multipoint mechanisms"],
    symptoms: ["moving home","lost keys","tenancy turnover","security upgrade"],
    standards: ["BS3621","TS007"] },
  { slug: "lock-repairs", label: "lock repairs",
    tech: ["gearbox repair","multipoint servicing","mortice maintenance"],
    symptoms: ["stiff locks","jammed locks","dropped handles","key won't turn"],
    standards: ["manufacturer warranty"] },
  { slug: "door-lock-installation", label: "door lock installation",
    tech: ["BS3621 mortice","TS007 anti-snap cylinders","multipoint mechanisms"],
    symptoms: ["new fittings","security upgrades","insurance requirements"],
    standards: ["BS3621","TS007"] },
  { slug: "door-lock-replacement", label: "door lock replacement",
    tech: ["like-for-like cylinder swaps","anti-snap upgrades"],
    symptoms: ["failed locks","lost keys","moving home"],
    standards: ["BS3621","TS007"] },
  { slug: "door-repairs", label: "door repairs",
    tech: ["hinge adjustment","frame alignment","gearbox repair","multipoint realignment"],
    symptoms: ["dropped doors","catching doors","doors that won't close","draughts"],
    standards: ["uPVC, composite and timber doors"] },
  { slug: "window-lock-repair-replacement", label: "window lock repair and replacement",
    tech: ["espagnolette mechanisms","shootbolt locks","child restrictors"],
    symptoms: ["windows that won't lock","broken handles","failed mechanisms"],
    standards: ["insurance-compliant fitting"] },
  { slug: "safe-installation", label: "safe installation",
    tech: ["floor anchoring","wall mounting","anti-leverage positioning"],
    symptoms: ["new safes","insurance approval"],
    standards: ["cash rating","Eurograde","AiS approved"] },
  { slug: "safe-opening", label: "safe opening",
    tech: ["non-destructive opening","combination dial manipulation"],
    symptoms: ["lost combinations","lost keys","jammed mechanisms","flat batteries"],
    standards: ["non-destructive method"] },
];

function homepageTitle(loc) {
  const tryPatterns = [
    `Locksmith ${loc} | Local Locksmithing Service 24/7`,
    `Locksmith ${loc} | Local Locksmithing 24/7`,
    `Locksmith ${loc} | Locksmithing 24/7`,
  ];
  for (const t of tryPatterns) if (t.length <= 60) return t;
  return tryPatterns[2];   // last-resort, may exceed for v.long locations
}

function homepageHeroPrompt(loc) {
  return `Write the hero paragraph for a UK locksmith website homepage serving ${loc}.

NON-NEGOTIABLE — the FIRST SENTENCE must contain all four of:
  1. The word "${loc}"
  2. The word "locksmith" or "locksmiths"
  3. The word "locksmithing"
  4. A service signal (locksmith service / locksmith help / lock services etc.)

After the first sentence: mention 2-3 specific services (lockouts, lock changes, lock repairs, security upgrades, emergency call-outs) and at least one trust signal (24/7, DBS checked, fully insured, non-destructive entry, no call-out fee).

Style: plain factual register. 40-65 words total. No exclamations. No clickbait. No surrounding quotes. Don't use the phrase "we provide". UK ENGLISH ONLY — use "specialise", "colour", "centre", "organisation" etc. Do NOT use "specialize", "color", "center". The word "locksmithing" must appear EXACTLY ONCE in the first sentence — never twice.

Output the paragraph only.`;
}

function servicePageHeroPrompt(loc, svc) {
  return `Write the hero paragraph for the "${svc.label}" service page on a UK locksmith website serving ${loc}.

NON-NEGOTIABLE — the FIRST SENTENCE must contain all four of:
  1. The phrase "${svc.label}" (or natural variant)
  2. The word "${loc}"
  3. The word "locksmith" or "locksmiths"
  4. The word "locksmithing"

After the first sentence: weave 2-3 of these service-specific entities into the rest, naturally:
  Technical methods: ${svc.tech.join(", ")}
  Common triggers: ${svc.symptoms.join(", ")}
  Standards/quality: ${svc.standards.join(", ")}

Pick the most relevant ones for this service. Don't list them; write complete grammatical sentences.

Style: plain factual register. 40-65 words total. No exclamations. No clickbait. No surrounding quotes. Don't use the phrase "we provide". UK ENGLISH ONLY — use "specialise", "colour", "centre", "organisation" etc. Do NOT use "specialize", "color", "center". The word "locksmithing" must appear EXACTLY ONCE in the first sentence — never twice.

Output the paragraph only.`;
}

function sanitise(t) {
  t = (t || "").trim().replace(/^["'`]|["'`]$/g, "").replace(/^#+\s*/, "");
  t = t.replace(/^(Hero|Output|Answer|Paragraph):\s*/i, "").trim();
  return americanToBritish(t);
}

// Common US→UK spelling normalisations. Applied AFTER Claude's output so we
// don't need to rely on the model getting UK English right every time.
function americanToBritish(s) {
  const pairs = [
    [/\b(special|recogn|organ|analy|maxim|minim|standard|emphas|critic|emphas|categor|optim|util|moder|symbol|capit|sympath|patron|memor|fertil|colon|fertil|legal)ize\b/g, "$1ise"],
    [/\b(special|recogn|organ|analy|maxim|minim|standard|emphas|critic|emphas|categor|optim|util|moder|symbol|capit|sympath|patron|memor|fertil|colon|fertil|legal)izes\b/g, "$1ises"],
    [/\b(special|recogn|organ|analy|maxim|minim|standard|emphas|critic|emphas|categor|optim|util|moder|symbol|capit|sympath|patron|memor|fertil|colon|fertil|legal)ized\b/g, "$1ised"],
    [/\b(special|recogn|organ|analy|maxim|minim|standard|emphas|critic|emphas|categor|optim|util|moder|symbol|capit|sympath|patron|memor|fertil|colon|fertil|legal)izing\b/g, "$1ising"],
    [/\b(special|recogn|organ|analy|maxim|minim|standard|emphas|critic|emphas|categor|optim|util|moder|symbol|capit|sympath|patron|memor|fertil|colon|fertil|legal)ization\b/g, "$1isation"],
    [/\bcolor\b/gi, m => m[0] === 'C' ? "Colour" : "colour"],
    [/\bcolors\b/gi, m => m[0] === 'C' ? "Colours" : "colours"],
    [/\bcolored\b/gi, "coloured"],
    [/\bfavor\b/gi, "favour"],
    [/\bfavors\b/gi, "favours"],
    [/\bfavorite\b/gi, "favourite"],
    [/\bhonor\b/gi, "honour"],
    [/\blabor\b/gi, "labour"],
    [/\bbehavior\b/gi, "behaviour"],
    [/\bcenter\b/gi, m => m[0] === 'C' ? "Centre" : "centre"],
    [/\bcenters\b/gi, "centres"],
    [/\bcentered\b/gi, "centred"],
    [/\banaly(z|ze)\b/gi, "analyse"],
    [/\bcatalog\b/gi, "catalogue"],
    [/\bgray\b/gi, "grey"],
    [/\bdefense\b/gi, "defence"],
    [/\bdefenses\b/gi, "defences"],
    [/\boffense\b/gi, "offence"],
    [/\binstallment\b/gi, "instalment"],
    [/\bjewelry\b/gi, "jewellery"],
    [/\btraveling\b/gi, "travelling"],
    [/\btraveled\b/gi, "travelled"],
    [/\bcanceled\b/gi, "cancelled"],
    [/\bcanceling\b/gi, "cancelling"],
    [/\benrolled\b/gi, "enrolled"],   // both ok but ensure consistency
    [/\bfulfill\b/gi, "fulfil"],
  ];
  for (const [re, sub] of pairs) s = s.replace(re, sub);
  return s;
}

function validateHero(text, requirements) {
  const firstSentence = (text.match(/^[^.!?]+[.!?]/) || [text])[0].toLowerCase();
  const issues = [];
  for (const req of requirements) {
    if (!firstSentence.includes(req.toLowerCase())) issues.push(`missing:${req}`);
  }
  // No-duplicate-locksmithing rule: "locksmithing" must appear at most once in the first sentence
  const locksmithingCount = (firstSentence.match(/\blocksmithing\b/g) || []).length;
  if (locksmithingCount > 1) issues.push("dup:locksmithing-x" + locksmithingCount);
  return issues;
}

async function callClaude(prompt, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version":"2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 300, messages: [{ role:"user", content: prompt }] }),
    });
    if (r.ok) {
      const d = await r.json();
      return d.content.filter(b => b.type === "text").map(b => b.text).join("\n");
    }
    // Retry on 529 (overloaded), 503, 502, and 429 (rate-limit)
    if ([429, 502, 503, 529].includes(r.status) && attempt < maxRetries) {
      const wait = Math.min(2000 * Math.pow(2, attempt - 1), 30000);
      await new Promise(rs => setTimeout(rs, wait));
      continue;
    }
    throw new Error(`Claude ${r.status}: ${(await r.text()).slice(0,100)}`);
  }
  throw new Error("Claude failed after retries");
}

async function generateWithRetry(prompt, requirements, label, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    const raw = await callClaude(prompt);
    const clean = sanitise(raw);
    const issues = validateHero(clean, requirements);
    if (issues.length === 0) return clean;
    // On retry, prepend an even stricter reminder
    if (i < maxAttempts - 1) {
      prompt = `RETRY — fix these issues: ${issues.join(", ")}. Requirements are non-negotiable — ALL must be true. "locksmithing" appears exactly once in the first sentence.\n\n${prompt}`;
    } else {
      console.log(`  [${label}] still has issues after ${maxAttempts} tries: ${issues.join(",")} — accepting`);
      return clean;
    }
  }
}

const targets = (args.domain ? [FLEET.find(s => s.domain === args.domain)] : FLEET.filter(s => s.logo_present)).filter(Boolean);
console.log(`Regenerating heroes + homepage title for ${targets.length} site(s).\n`);

for (const site of targets) {
  const cachePath = join(CACHE, site.cf_project + ".json");
  if (!existsSync(cachePath)) { console.log(`SKIP ${site.domain} (no cache)`); continue; }
  const cache = JSON.parse(readFileSync(cachePath, "utf8"));
  console.log(`\n=== ${site.domain} ===`);

  // 1. Homepage title — deterministic
  const newHomeTitle = homepageTitle(site.location);
  cache["meta.title"] = newHomeTitle;
  console.log(`  meta.title (${newHomeTitle.length} chars): ${newHomeTitle}`);

  // Save title now (no AI risk on this one)
  if (!args.dry_run) writeFileSync(cachePath, JSON.stringify(cache, null, 2));

  // 2. Homepage hero paragraph
  const homeReq = [site.location, "locksmith", "locksmithing"];
  const homeHero = await generateWithRetry(homepageHeroPrompt(site.location), homeReq, "home.hero-paragraph");
  cache["home.hero-paragraph"] = homeHero;
  if (!args.dry_run) writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  console.log(`  home.hero-paragraph: ${homeHero.slice(0,140)}...`);

  // 3. Each service hero paragraph — save after each so a crash mid-run doesn't lose progress
  for (const svc of SERVICES) {
    const req = [site.location, svc.label.split(" ")[0], "locksmith", "locksmithing"];
    const hero = await generateWithRetry(servicePageHeroPrompt(site.location, svc), req, `${svc.slug}.hero-paragraph`);
    cache[`${svc.slug}.hero-paragraph`] = hero;
    if (!args.dry_run) writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    console.log(`  ${svc.slug}.hero-paragraph: ${hero.slice(0,110)}...`);
  }
  console.log(`  → cache complete`);
}
console.log("\nDone.");

function parseArgs(a){ const o={}; for(let i=0;i<a.length;i++){const t=a[i];if(!t.startsWith("--"))continue;const k=t.slice(2).replace(/-/g,"_");const n=a[i+1];if(n&&!n.startsWith("--")){o[k]=n;i++;}else o[k]=true;}return o; }
