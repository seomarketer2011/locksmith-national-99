#!/usr/bin/env node
// Locksmith fleet redeploy pipeline.
// Reads data/locksmith-fleet/sites.json, substitutes 6 tokens
// ({{name}}, {{phone}}, {{address}}, {{logo_url}}, {{location}}, {{color}})
// into a copy of templates/locksmith-fleet/, builds, and deploys to Cloudflare Pages.
//
// Usage:
//   node scripts/locksmith-fleet/redeploy.mjs --domain lockmanlocksmithsbirmingham.co.uk
//   node scripts/locksmith-fleet/redeploy.mjs --deployable           # all sites with logo present
//   node scripts/locksmith-fleet/redeploy.mjs --all                  # every site (skips missing logos)
//   node scripts/locksmith-fleet/redeploy.mjs --domain X --dry-run   # substitute only, skip build + deploy
//   node scripts/locksmith-fleet/redeploy.mjs --domain X --skip-deploy  # build but don't deploy
//   node scripts/locksmith-fleet/redeploy.mjs --domain X --cf-project foo  # override project name
//   node scripts/locksmith-fleet/redeploy.mjs --domain X --fix-cname       # also fix apex CNAME
//
// Required env (for actual deploys):
//   CLOUDFLARE_ACCOUNT_ID
//   CLOUDFLARE_API_TOKEN   (scoped token)   OR
//   CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY   (global API key)

import { readFileSync, existsSync, mkdirSync, cpSync, readdirSync, statSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TEMPLATE_DIR = join(ROOT, "templates", "locksmith-fleet");
const FLEET_JSON = join(ROOT, "data", "locksmith-fleet", "sites.json");
const OUTPUT_ROOT = join(ROOT, "output", "locksmith-fleet");
// Shared node_modules cache: the dependency tree is identical for every site,
// so install once and copy locally instead of hitting the registry 99 times.
const NM_CACHE = join(OUTPUT_ROOT, ".nm-cache");

const TEXT_EXTS = new Set([
  ".astro", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".json", ".md", ".html", ".css", ".svg", ".txt",
]);

const args = parseArgs(process.argv.slice(2));

if (args.help || (!args.domain && !args.all && !args.deployable)) {
  console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(2, 18).map(l => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(args.help ? 0 : 1);
}

if (!existsSync(TEMPLATE_DIR)) die(`Template not found: ${TEMPLATE_DIR}`);
if (!existsSync(FLEET_JSON)) die(`Fleet manifest not found: ${FLEET_JSON}`);

const fleet = JSON.parse(readFileSync(FLEET_JSON, "utf8"));

let selected;
if (args.domain) {
  selected = fleet.filter(s => s.domain === args.domain);
  if (selected.length === 0) die(`Domain not in fleet: ${args.domain}`);
} else if (args.deployable) {
  selected = fleet.filter(s => s.logo_present);
} else {
  selected = fleet;
}

console.log(`Selected ${selected.length} site(s).`);
if (args.dry_run) console.log("DRY RUN: substitute only, no build/deploy.");
if (args.skip_deploy && !args.dry_run) console.log("SKIP DEPLOY: build only.");

const results = { ok: [], skipped: [], failed: [] };

for (const site of selected) {
  const cfProject = args.cf_project || site.cf_project;
  console.log(`\n=== ${site.domain}  ->  CF project '${cfProject}' ===`);

  if (!site.logo_present) {
    console.log(`  SKIP: logo not in template (${site.logo_url}).`);
    results.skipped.push({ ...site, reason: "logo missing" });
    continue;
  }

  try {
    const scratch = join(OUTPUT_ROOT, cfProject);
    prepareScratch(scratch);
    substituteTokens(scratch, site);
    applyBrandFavicon(scratch, site);
    verifyLogo(scratch, site);
    if (!args.skip_enrich) await maybeEnrich(scratch, site);

    if (!args.dry_run) {
      runBuild(scratch);
      if (!args.skip_deploy) {
        await ensureProductionBranch(cfProject);
        runDeploy(scratch, cfProject);
      }
      if (args.fix_cname && !args.skip_deploy) await fixCname(site.domain, cfProject);
    }
    console.log(`  OK`);
    results.ok.push({ ...site, cfProject });
    // Multi-site runs: drop the heavy build artefacts once deployed so 99
    // scratch dirs don't exhaust the disk (node_modules is ~230 MB per site).
    if (selected.length > 1 && !args.dry_run && !args.skip_deploy) {
      const scratch = join(OUTPUT_ROOT, cfProject);
      for (const dir of ["node_modules", ".astro"]) {
        rmSync(join(scratch, dir), { recursive: true, force: true });
      }
    }
  } catch (err) {
    console.error(`  FAIL: ${err.message}`);
    results.failed.push({ ...site, error: err.message });
  }
}

console.log(`\n--- Summary ---`);
console.log(`  Succeeded: ${results.ok.length}`);
console.log(`  Skipped:   ${results.skipped.length}`);
console.log(`  Failed:    ${results.failed.length}`);
if (results.failed.length) {
  for (const f of results.failed) console.log(`    FAIL ${f.domain}: ${f.error}`);
  process.exit(1);
}

// ---------- helpers ----------

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (tok.startsWith("--")) {
      const key = tok.slice(2).replace(/-/g, "_");
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        a[key] = next;
        i++;
      } else {
        a[key] = true;
      }
    } else {
      a._.push(tok);
    }
  }
  return a;
}

function prepareScratch(scratch) {
  if (existsSync(scratch)) rmSync(scratch, { recursive: true, force: true });
  mkdirSync(scratch, { recursive: true });
  cpSync(TEMPLATE_DIR, scratch, {
    recursive: true,
    filter: (src) => {
      const rel = relative(TEMPLATE_DIR, src);
      if (!rel) return true;
      const first = rel.split("/")[0];
      // skip junk and any local build artefacts
      return !["node_modules", "dist", ".astro", ".vercel", ".turbo"].includes(first)
        && !src.endsWith(".DS_Store");
    },
  });
}

function substituteTokens(scratch, site) {
  // logo_url in template is consumed as: import logo from "../../assets{{logo_url}}"
  // so we substitute with a path that resolves to src/assets/logo/<file>
  const logoPath = `/logo/${site.logo_url}`;
  const tokens = {
    "{{name}}": site.name,
    "{{phone}}": site.phone,
    "{{phone_tel}}": telHref(site.phone),
    "{{address}}": formatAddress(site.address),
    "{{logo_url}}": logoPath,
    "{{location}}": site.location,
    "{{color}}": site.color || "",
    "{{domain}}": site.domain,
    "{{policy_date}}": "January 2026",
  };

  walk(scratch, (file) => {
    const dot = file.lastIndexOf(".");
    const ext = dot === -1 ? "" : file.slice(dot).toLowerCase();
    if (!TEXT_EXTS.has(ext)) return;
    let content = readFileSync(file, "utf8");
    let changed = false;
    for (const [tok, val] of Object.entries(tokens)) {
      if (content.includes(tok)) {
        content = content.split(tok).join(val);
        changed = true;
      }
    }
    if (changed) writeFileSync(file, content);
  });
}

// Swap the template's generic favicon for the brand's own, when the site
// belongs to a sub-clustered brand (<city>.<brand>-locksmiths.co.uk) and a
// favicon set exists in data/locksmith-fleet/favicons/<brand>.{png,ico}.
// Standalone city domains keep the template default.
function applyBrandFavicon(scratch, site) {
  const m = site.domain.match(/\.([a-z0-9]+)-locksmiths\.co\.uk$/);
  if (!m) return;
  const favDir = join(ROOT, "data", "locksmith-fleet", "favicons");
  let applied = false;
  for (const ext of ["png", "ico"]) {
    const src = join(favDir, `${m[1]}.${ext}`);
    if (existsSync(src)) {
      cpSync(src, join(scratch, "public", `favicon.${ext}`));
      applied = true;
    }
  }
  if (applied) console.log(`  favicon: applied ${m[1]} brand favicon`);
}

function walk(dir, fn) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, fn);
    else fn(full);
  }
}

function telHref(phone) {
  // UK national format like "0121 400 0413" -> E.164 "+441214000413"
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
  if (digits.startsWith("44")) return `+${digits}`;
  return `+44${digits}`;
}

function formatAddress(raw) {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return trimmed;
  try {
    const a = JSON.parse(trimmed);
    return [a.street, a.city, a.postcode].filter(Boolean).join(", ");
  } catch {
    return trimmed;
  }
}

function verifyLogo(scratch, site) {
  const logoOnDisk = join(scratch, "src", "assets", "logo", site.logo_url);
  if (!existsSync(logoOnDisk)) {
    throw new Error(`Logo file missing after copy: src/assets/logo/${site.logo_url}`);
  }
  // Per-site OG image: ship the brand logo as /og.png so social shares are on-brand.
  const ogPath = join(scratch, "public", "og.png");
  cpSync(logoOnDisk, ogPath);
}

async function maybeEnrich(scratch, site) {
  // Always write site-meta.json (no AI needed) — schema and visible postcode line depend on it.
  const intelPath = join(ROOT, "data", "locksmith-fleet", "local-intelligence", slugify(site.location) + ".json");
  if (existsSync(intelPath)) {
    const intel = JSON.parse(readFileSync(intelPath, "utf8"));
    // Parse the structured address object (if any) so jsonLD.js can emit a proper
    // PostalAddress with streetAddress / addressLocality / postalCode split cleanly.
    let addressObj = null;
    if (site.address) {
      const raw = String(site.address).trim();
      if (raw.startsWith("{")) {
        try { addressObj = JSON.parse(raw); } catch {}
      }
    }
    const siteMeta = {
      location: site.location,
      name: site.name,
      domain: site.domain,
      phone: site.phone,
      geo: intel.geo || null,
      postcode_districts: intel.postcode_districts || [],
      all_areas: intel.all_areas || [],
      address: addressObj,   // { street, city, postcode, country } or null
    };
    const metaPath = join(scratch, "src", "data", "site-meta.json");
    mkdirSync(dirname(metaPath), { recursive: true });
    writeFileSync(metaPath, JSON.stringify(siteMeta, null, 2));
    console.log(`  site-meta: ${siteMeta.postcode_districts.length} postcodes, ${siteMeta.all_areas.length} areas, geo=${siteMeta.geo ? "yes" : "no"}`);
  }

  const outPath = join(scratch, "src", "data", "enriched.json");
  const cachePath = join(ROOT, "data", "locksmith-fleet", "enriched-cache", site.cf_project + ".json");

  // Cache hit: reuse the previous enrichment instead of paying for re-generation.
  // Use --force-enrich to bypass the cache when prompts or local-intel change.
  if (existsSync(cachePath) && !args.force_enrich) {
    cpSync(cachePath, outPath);
    console.log(`  enrich: reused cached enriched.json (use --force-enrich to regenerate)`);
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("  enrich: skipped (ANTHROPIC_API_KEY not set, using template fallbacks)");
    return;
  }
  if (!existsSync(intelPath)) {
    console.log(`  enrich: skipped (no local-intel at ${intelPath})`);
    return;
  }
  console.log("  enrich: generating per-site content via Claude Haiku…");
  const res = spawnSync("node", [
    join(ROOT, "scripts", "locksmith-fleet", "enrich-site.mjs"),
    "--domain", site.domain,
    "--out", outPath,
  ], { stdio: "inherit", env: process.env });
  if (res.status !== 0) throw new Error("enrich-site.mjs exited " + res.status);

  // Save freshly-generated enrichment to the cache for next time.
  mkdirSync(dirname(cachePath), { recursive: true });
  cpSync(outPath, cachePath);
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function runBuild(scratch) {
  const nm = join(scratch, "node_modules");
  if (existsSync(NM_CACHE)) {
    console.log("  reusing cached node_modules…");
    cpSync(NM_CACHE, nm, { recursive: true, verbatimSymlinks: true });
  } else {
    console.log("  installing deps (npm install --no-audit --no-fund)…");
    sh("npm", ["install", "--no-audit", "--no-fund", "--no-package-lock"], scratch);
    cpSync(nm, NM_CACHE, { recursive: true, verbatimSymlinks: true });
  }
  console.log("  building (astro build)…");
  sh("npx", ["astro", "build"], scratch);
  const dist = join(scratch, "dist");
  if (!existsSync(dist)) throw new Error("dist/ not produced by build");
}

function runDeploy(scratch, project) {
  console.log(`  deploying to CF Pages project '${project}'…`);
  sh("npx", ["wrangler", "pages", "deploy", "dist",
    "--project-name", project,
    "--branch", "main",
    "--commit-dirty=true"], scratch);
}

function sh(cmd, args, cwd) {
  const res = spawnSync(cmd, args, { cwd, stdio: "inherit", env: process.env });
  if (res.status !== 0) throw new Error(`${cmd} ${args.join(" ")} exited with ${res.status}`);
}

async function fixCname(domain, project) {
  const email = process.env.CLOUDFLARE_EMAIL;
  const key = process.env.CLOUDFLARE_API_KEY;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!email || !key) {
    if (!token) {
      console.log(`  fix-cname: skipped (no CF creds in env)`);
      return;
    }
  }
  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : { "X-Auth-Email": email, "X-Auth-Key": key };
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  // Attach the custom domain to the CF Pages project (idempotent — CF returns "already exists" if attached).
  // This is required for SSL/HTTPS to be provisioned on first-time deploys.
  if (accountId) {
    const att = await cfPost(`/accounts/${accountId}/pages/projects/${project}/domains`,
      { name: domain }, authHeaders);
    if (att.success) {
      console.log(`  attached custom domain ${domain} -> CF project '${project}'`);
    } else {
      const err = (att.errors || [])[0];
      const code = err?.code;
      // 8000023 = "already exists" — fine, ignore. Other codes worth surfacing.
      if (code !== 8000023 && code !== 8000007) {
        console.log(`  domain attach: ${err?.message || JSON.stringify(att.errors)}`);
      }
    }
  }

  // Find zone — try apex domain first, then parent (for subdomain custom domains).
  let zoneId = null;
  const parts = domain.split(".");
  const candidates = parts.length >= 3
    ? [domain, parts.slice(-3).join("."), parts.slice(-2).join(".")]
    : [domain];
  for (const cand of candidates) {
    const r = await cfGet(`/zones?name=${encodeURIComponent(cand)}`, authHeaders);
    if (r.result && r.result.length) { zoneId = r.result[0].id; break; }
  }
  if (!zoneId) throw new Error(`cname-fix: no zone found for ${domain}`);

  // Resolve the project's real pages.dev subdomain — CF appends a suffix
  // (e.g. project-3em.pages.dev) when the plain name is taken globally,
  // so `${project}.pages.dev` can point at someone else's project.
  let want = `${project}.pages.dev`;
  if (accountId) {
    const proj = await cfGet(`/accounts/${accountId}/pages/projects/${project}`, authHeaders);
    const sub = proj?.result?.subdomain;
    if (sub) want = sub.includes(".") ? sub : `${sub}.pages.dev`;
  }

  // Find or create the apex CNAME.
  const recs = await cfGet(`/zones/${zoneId}/dns_records?name=${encodeURIComponent(domain)}&type=CNAME`, authHeaders);
  if (!recs.result || !recs.result.length) {
    // First-time deploy with no DNS record yet — create the CNAME proxied through CF.
    const created = await cfPost(`/zones/${zoneId}/dns_records`,
      { type: "CNAME", name: domain, content: want, proxied: true, ttl: 1 }, authHeaders);
    if (created.success) {
      console.log(`  fix-cname: created CNAME ${domain} -> ${want}`);
      return;
    } else {
      console.log(`  fix-cname: CNAME create failed: ${JSON.stringify(created.errors)}`);
      return;
    }
  }
  const rec = recs.result[0];
  if (rec.content === want) {
    console.log(`  fix-cname: already correct (${rec.content})`);
    return;
  }
  const body = { type: "CNAME", name: rec.name, content: want, proxied: rec.proxied, ttl: 1 };
  const upd = await cfPut(`/zones/${zoneId}/dns_records/${rec.id}`, body, authHeaders);
  if (upd.success) {
    console.log(`  fix-cname: ${rec.content}  ->  ${want}`);
  } else {
    throw new Error(`cname-fix failed: ${JSON.stringify(upd.errors)}`);
  }
}

function cfAuthHeaders() {
  const email = process.env.CLOUDFLARE_EMAIL;
  const key = process.env.CLOUDFLARE_API_KEY;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (token) return { Authorization: `Bearer ${token}` };
  if (email && key) return { "X-Auth-Email": email, "X-Auth-Key": key };
  return null;
}

async function ensureProductionBranch(project) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const headers = cfAuthHeaders();
  if (!accountId || !headers) return; // no creds, skip silently
  const data = await cfGet(`/accounts/${accountId}/pages/projects/${project}`, headers);
  if (!data.success) {
    // Project doesn't exist — create it with production_branch=main so the first deploy lands in production.
    console.log(`  CF Pages project '${project}' not found, creating…`);
    const created = await cfPost(`/accounts/${accountId}/pages/projects`,
      { name: project, production_branch: "main" }, headers);
    if (!created.success) {
      throw new Error(`CF project create failed: ${JSON.stringify(created.errors)}`);
    }
    return;
  }
  if (data.result?.production_branch === "main") return;
  console.log(`  setting production_branch=main on CF Pages project '${project}'…`);
  await cfPatch(`/accounts/${accountId}/pages/projects/${project}`, { production_branch: "main" }, headers);
}

async function cfPost(path, body, headers) {
  const url = `https://api.cloudflare.com/client/v4${path}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function cfGet(path, headers) {
  const url = `https://api.cloudflare.com/client/v4${path}`;
  const r = await fetch(url, { headers });
  return r.json();
}

async function cfPut(path, body, headers) {
  const url = `https://api.cloudflare.com/client/v4${path}`;
  const r = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function cfPatch(path, body, headers) {
  const url = `https://api.cloudflare.com/client/v4${path}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

function die(msg) {
  console.error("ERROR:", msg);
  process.exit(1);
}
