#!/usr/bin/env node
// Brand hub builder.
// Renders a static "brand hub" home page for each sub-clustered root domain
// (shieldx-locksmiths.co.uk, steelok-locksmiths.co.uk, ...) from a per-brand
// config in data/locksmith-fleet/hubs/<brand>.json.
//
// Each hub is a branded parent-site with a branch directory — NOT a ranking
// page. Copy, section order, palette and layout come from the config so no
// two hubs share the same content footprint. Branch cards pull real
// neighbourhood names from the enriched cache (home.areas-covered).
//
// Usage:
//   node scripts/locksmith-fleet/build-hubs.mjs                    # build all hubs
//   node scripts/locksmith-fleet/build-hubs.mjs --brand shieldx    # one brand
//   node scripts/locksmith-fleet/build-hubs.mjs --deploy           # build + wrangler pages deploy
//   node scripts/locksmith-fleet/build-hubs.mjs --brand X --deploy
//
// Output: output/hubs/<domain>/  (index.html, robots.txt, sitemap.xml)
//
// Required env (only with --deploy):
//   CLOUDFLARE_ACCOUNT_ID
//   CLOUDFLARE_API_TOKEN   (scoped token)   OR
//   CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY   (global API key)

import { readFileSync, existsSync, mkdirSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const HUBS_DIR = join(ROOT, "data", "locksmith-fleet", "hubs");
const OUTPUT_ROOT = join(ROOT, "output", "hubs");

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 22).map(l => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(0);
}

const configs = readdirSync(HUBS_DIR)
  .filter(f => f.endsWith(".json"))
  .map(f => JSON.parse(readFileSync(join(HUBS_DIR, f), "utf8")))
  .filter(c => !args.brand || c.slug === args.brand || c.domain === args.brand);

if (configs.length === 0) die(`No hub config matched${args.brand ? `: ${args.brand}` : ""} in ${HUBS_DIR}`);

console.log(`Building ${configs.length} hub(s).${args.deploy ? " Deploying after build." : ""}`);

async function main() {
for (const cfg of configs) {
  const branches = loadBranches(cfg);
  if (branches.length === 0) die(`No branches found in sites.json for ${cfg.domain}`);
  const outDir = join(OUTPUT_ROOT, cfg.domain);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), renderHub(cfg, branches));
  writeFileSync(join(outDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: https://${cfg.domain}/sitemap.xml\n`);
  writeFileSync(join(outDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://${cfg.domain}/</loc></url>\n</urlset>\n`);
  console.log(`  ✓ ${cfg.domain}  (${branches.length} branches → ${outDir})`);

  if (args.deploy) await deployHub(cfg, outDir);
}

console.log("Done.");
}

// ---------------------------------------------------------------- data

function loadBranches(cfg) {
  const fleetDir = cfg.fleet || "locksmith-fleet";
  const sites = JSON.parse(readFileSync(join(ROOT, "data", fleetDir, "sites.json"), "utf8"));
  return sites
    .filter(s => s.domain.endsWith("." + cfg.domain))
    .map(s => {
      const sub = s.domain.slice(0, -(cfg.domain.length + 1));
      let areas = [];
      const cachePath = join(ROOT, "data", fleetDir, "enriched-cache", s.cf_project + ".json");
      if (existsSync(cachePath)) {
        try {
          const cache = JSON.parse(readFileSync(cachePath, "utf8"));
          areas = (cache["home.areas-covered"] || []).slice(0, 3);
        } catch { /* unreadable cache — card just skips the area line */ }
      }
      return { sub, domain: s.domain, location: s.location, phone: s.phone, areas };
    })
    .sort((a, b) => a.location.localeCompare(b.location));
}

// ---------------------------------------------------------------- render

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const MARKS = {
  shield: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>',
  key: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>',
  bolt: '<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
  lock: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>',
  door: '<path stroke-linecap="round" stroke-linejoin="round" d="M8 21V5a2 2 0 012-2h4a2 2 0 012 2v16M4 21h16M13 12h.01"/>',
  cog: '<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>',
  home: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>',
};

const CHECK = '<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clip-rule="evenodd"/></svg>';

function mark(cfg, size = 20) {
  return `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">${MARKS[cfg.mark] || MARKS.key}</svg>`;
}

function areaLine(cfg, b) {
  if (b.areas.length === 0) return `Covering ${esc(b.location)} and surrounding areas`;
  const pattern = cfg.copy.coverage.areaPattern || "Covering {areas} and the wider {town} area";
  return esc(pattern.replace("{areas}", b.areas.join(", ")).replace("{town}", b.location));
}

function jsonLd(cfg, branches) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: cfg.brand,
    url: `https://${cfg.domain}/`,
    description: cfg.copy.description,
    subOrganization: branches.map(b => ({
      "@type": "Locksmith",
      name: `${cfg.brand} ${b.location}`,
      url: `https://${b.domain}/`,
      telephone: b.phone,
      areaServed: [b.location, ...b.areas],
    })),
  }, null, 1);
}

function renderHub(cfg, branches) {
  const t = cfg.theme;
  const c = cfg.copy;
  const sections = {
    hero: renderHero,
    trust: renderTrust,
    about: renderAbout,
    services: renderServices,
    coverage: renderCoverage,
    why: renderWhy,
    cta: renderCta,
  };
  const body = cfg.layout.map(name => {
    const fn = sections[name];
    if (!fn) die(`Unknown section "${name}" in layout for ${cfg.domain}`);
    return fn(cfg, branches);
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.description)}" />
<link rel="canonical" href="https://${cfg.domain}/" />
<script type="application/ld+json">
${jsonLd(cfg, branches)}
</script>
<style>
  :root{
    --ink:${t.ink}; --ink2:${t.ink2}; --primary:${t.primary}; --primary2:${t.primary2};
    --accent:${t.accent}; --surface:${t.surface}; --line:${t.line}; --muted:${t.muted}; --white:#fff;
    --radius:${t.radius || "14px"};
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:${t.font || "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif"};color:var(--ink);background:var(--white);line-height:1.6;-webkit-font-smoothing:antialiased}
  h1,h2,h3{font-family:${t.headingFont || t.font || "inherit"}}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:1140px;margin:0 auto;padding:0 20px}
  .btn{display:inline-flex;align-items:center;gap:.5rem;background:var(--primary);color:#fff;font-weight:600;padding:.9rem 1.6rem;border-radius:calc(var(--radius) - 2px);transition:.2s;font-size:1.05rem}
  .btn:hover{background:var(--ink);transform:translateY(-1px)}
  .btn-lg{padding:1.1rem 2rem;font-size:1.15rem}
  .topbar{background:var(--ink);color:rgba(255,255,255,.75);font-size:.82rem;padding:.5rem 0}
  .topbar .wrap{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.4rem}
  .topbar a{color:#fff;font-weight:600}
  header{position:sticky;top:0;z-index:50;background:#fff;border-bottom:1px solid var(--line);box-shadow:0 1px 3px rgba(0,0,0,.04)}
  header .wrap{display:flex;justify-content:space-between;align-items:center;height:66px}
  .brand{display:flex;align-items:center;gap:.6rem;font-weight:700;font-size:1.22rem;color:var(--ink)}
  .brand .mark{width:36px;height:36px;background:var(--primary);border-radius:calc(var(--radius) - 5px);display:grid;place-items:center;color:#fff}
  nav.main{display:none;gap:1.5rem;align-items:center}
  nav.main a{font-weight:500;font-size:.92rem;color:var(--ink2)}
  nav.main a:hover{color:var(--primary)}
  @media(min-width:900px){nav.main{display:flex}}
  .hero{padding:4.5rem 0 4rem;position:relative;overflow:hidden}
  .hero.dark{background:linear-gradient(160deg,var(--ink) 0%,var(--ink2) 100%);color:#fff}
  .hero.light{background:var(--surface);border-bottom:1px solid var(--line)}
  .hero.dark::after{content:"";position:absolute;right:-120px;top:-120px;width:420px;height:420px;background:radial-gradient(circle,${t.heroGlow || "rgba(255,255,255,.08)"},transparent 70%)}
  .hero .wrap{position:relative;z-index:1;max-width:840px}
  .eyebrow{display:inline-block;font-weight:600;font-size:.8rem;letter-spacing:.05em;text-transform:uppercase;padding:.4rem .9rem;border-radius:999px;margin-bottom:1.2rem}
  .hero.dark .eyebrow{background:rgba(255,255,255,.12);color:var(--accent)}
  .hero.light .eyebrow{background:var(--primary);color:#fff}
  .hero h1{font-size:2.5rem;line-height:1.12;font-weight:700;margin-bottom:1rem}
  @media(min-width:700px){.hero h1{font-size:3.2rem}}
  .hero p.lead{font-size:1.18rem;margin-bottom:2rem;max-width:660px}
  .hero.dark p.lead{color:rgba(255,255,255,.78)}
  .hero.light p.lead{color:var(--muted)}
  .hero-cta{display:flex;gap:1rem;flex-wrap:wrap;align-items:center}
  .hero-cta .ghost{background:rgba(127,127,127,.16)}
  .hero.light .hero-cta .ghost{background:#fff;border:1px solid var(--line);color:var(--ink)}
  .hero-note{font-size:.9rem;margin-top:1.2rem;opacity:.75}
  .trust{background:var(--surface);border-bottom:1px solid var(--line)}
  .trust .wrap{display:flex;flex-wrap:wrap;justify-content:center;gap:1.2rem 2.2rem;padding:1.1rem 20px}
  .trust span{display:flex;align-items:center;gap:.5rem;font-weight:600;font-size:.92rem;color:var(--ink2)}
  .trust svg{width:18px;height:18px;color:var(--primary)}
  section.pad{padding:4rem 0}
  .sec-head{max-width:680px;margin:0 auto 2.6rem;text-align:center}
  .sec-head.left{text-align:left;margin-left:0}
  .sec-head h2{font-size:2rem;font-weight:700;color:var(--ink);margin-bottom:.7rem}
  .sec-head p{color:var(--muted);font-size:1.05rem}
  .about{background:var(--surface)}
  .about .inner{max-width:760px;margin:0 auto}
  .about h2{font-size:2rem;font-weight:700;margin-bottom:1.2rem}
  .about p{color:var(--ink2);font-size:1.05rem;margin-bottom:1rem}
  .svc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem}
  .svc{border:1px solid var(--line);border-radius:var(--radius);padding:1.3rem;transition:.2s;background:#fff}
  .svc:hover{border-color:var(--primary);box-shadow:0 6px 20px rgba(0,0,0,.07);transform:translateY(-2px)}
  .svc .ico{width:42px;height:42px;background:var(--surface);border-radius:calc(var(--radius) - 4px);display:grid;place-items:center;margin-bottom:.8rem;color:var(--primary)}
  .svc h3{font-size:1.05rem;font-weight:600;margin-bottom:.3rem}
  .svc p{font-size:.9rem;color:var(--muted)}
  .svc-more{margin-top:1.6rem;text-align:center;color:var(--muted);font-size:.95rem;max-width:760px;margin-left:auto;margin-right:auto}
  .coverage.dark{background:var(--ink);color:#fff}
  .coverage.dark .sec-head h2{color:#fff}
  .coverage.dark .sec-head p{color:rgba(255,255,255,.7)}
  .branch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem}
  .branch{display:block;border-radius:var(--radius);padding:1.25rem 1.4rem;transition:.2s;border:1px solid var(--line);background:#fff}
  .coverage.dark .branch{background:var(--ink2);border-color:rgba(255,255,255,.14)}
  .branch:hover{border-color:var(--primary);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.12)}
  .branch .town{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:1.08rem;margin-bottom:.35rem}
  .branch .town .arrow{color:var(--accent);transition:.2s}
  .branch:hover .town .arrow{transform:translateX(3px)}
  .branch .areas{font-size:.86rem;line-height:1.5;opacity:.75;margin-bottom:.55rem}
  .branch .tel{font-size:.9rem;font-weight:600;color:var(--primary)}
  .coverage.dark .branch .tel{color:var(--accent)}
  .branch-list{columns:1;column-gap:2.5rem;max-width:900px;margin:0 auto}
  @media(min-width:700px){.branch-list{columns:2}}
  .branch-row{break-inside:avoid;display:block;padding:1.05rem 0;border-bottom:1px solid var(--line)}
  .coverage.dark .branch-row{border-color:rgba(255,255,255,.14)}
  .branch-row .town{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:1.05rem}
  .branch-row .town .arrow{color:var(--primary)}
  .coverage.dark .branch-row .town .arrow{color:var(--accent)}
  .branch-row .areas{font-size:.86rem;opacity:.72;margin-top:.15rem}
  .branch-row .tel{font-size:.88rem;font-weight:600;color:var(--primary);margin-top:.15rem;display:inline-block}
  .coverage.dark .branch-row .tel{color:var(--accent)}
  .why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.6rem}
  .why{display:flex;gap:1rem;align-items:flex-start}
  .why .ico{flex:0 0 46px;width:46px;height:46px;background:var(--primary);border-radius:calc(var(--radius) - 3px);display:grid;place-items:center;color:#fff}
  .why h3{font-size:1.1rem;font-weight:600;margin-bottom:.3rem}
  .why p{font-size:.95rem;color:var(--muted)}
  .cta-band{background:linear-gradient(135deg,var(--primary) 0%,var(--ink) 100%);color:#fff;text-align:center}
  .cta-band h2{font-size:2rem;font-weight:700;margin-bottom:.6rem}
  .cta-band p{opacity:.85;margin-bottom:1.6rem;font-size:1.1rem}
  .cta-band .btn{background:#fff;color:var(--ink)}
  .cta-band .btn:hover{background:var(--accent);color:var(--ink)}
  footer{background:var(--ink);color:rgba(255,255,255,.6);padding:3rem 0 2rem;font-size:.9rem}
  .foot-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;margin-bottom:2rem}
  footer h4{color:#fff;font-size:.95rem;margin-bottom:.9rem;font-weight:600}
  footer ul{list-style:none}
  footer li{margin-bottom:.45rem}
  footer a:hover{color:#fff}
  .foot-bottom{border-top:1px solid rgba(255,255,255,.15);padding-top:1.4rem;display:flex;justify-content:space-between;flex-wrap:wrap;gap:.6rem;font-size:.85rem}
</style>
</head>
<body>

<div class="topbar"><div class="wrap">
  <span>${esc(c.topbar)}</span>
  <a href="#branches">${esc(c.topbarCta || "Find your local branch")}</a>
</div></div>

<header><div class="wrap">
  <a class="brand" href="/">
    <span class="mark">${mark(cfg)}</span>
    ${esc(cfg.brand)}
  </a>
  <nav class="main">
    <a href="#services">Services</a>
    <a href="#branches">${esc(c.navBranches || "Our Branches")}</a>
    ${cfg.layout.includes("why") ? '<a href="#why">Why Us</a>' : ""}
    ${cfg.layout.includes("about") ? '<a href="#about">About</a>' : ""}
    <a class="btn" href="#branches">${esc(c.topbarCta || "Find your branch")}</a>
  </nav>
</div></header>

${body}

<footer><div class="wrap">
  <div class="foot-grid">
    <div>
      <h4>${esc(cfg.brand)}</h4>
      <p>${esc(c.footerBlurb)}</p>
    </div>
    <div><h4>Services</h4><ul>${c.services.featured.slice(0, 7).map(s => `<li>${esc(s[0])}</li>`).join("")}</ul></div>
    <div><h4>Branches</h4><ul>${branches.map(b => `<li><a href="https://${b.domain}/">${esc(b.location)}</a></li>`).join("")}</ul></div>
  </div>
  <div class="foot-bottom">
    <span>&copy; ${new Date().getFullYear()} ${esc(cfg.brand)}. All rights reserved.</span>
    <a href="#branches">${esc(c.topbarCta || "Find your local branch")}</a>
  </div>
</div></footer>

</body>
</html>
`;
}

function renderHero(cfg, branches) {
  const c = cfg.copy;
  return `<div class="hero ${cfg.theme.heroStyle || "dark"}"><div class="wrap">
  <span class="eyebrow">${esc(c.eyebrow)}</span>
  <h1>${esc(c.h1)}</h1>
  <p class="lead">${esc(c.lead)}</p>
  <div class="hero-cta">
    <a class="btn btn-lg" href="#branches">${esc(c.heroCta || "Find your local branch")}</a>
    <a class="btn btn-lg ghost" href="#services">${esc(c.heroCta2 || "What we do")}</a>
  </div>
  <p class="hero-note">${esc(c.heroNote.replaceAll("{n}", String(branches.length)))}</p>
</div></div>`;
}

function renderTrust(cfg) {
  return `<div class="trust"><div class="wrap">
  ${cfg.copy.trust.map(tp => `<span>${CHECK}${esc(tp)}</span>`).join("\n  ")}
</div></div>`;
}

function renderAbout(cfg, branches) {
  const a = cfg.copy.about;
  return `<section class="pad about" id="about"><div class="wrap"><div class="inner">
  <h2>${esc(a.heading)}</h2>
  ${a.body.map(p => `<p>${esc(p.replaceAll("{n}", String(branches.length)))}</p>`).join("\n  ")}
</div></div></section>`;
}

function renderServices(cfg) {
  const s = cfg.copy.services;
  return `<section class="pad" id="services"><div class="wrap">
  <div class="sec-head">
    <h2>${esc(s.heading)}</h2>
    <p>${esc(s.intro)}</p>
  </div>
  <div class="svc-grid">
    ${s.featured.map(([name, desc]) => `<div class="svc"><div class="ico">${mark(cfg, 22)}</div><h3>${esc(name)}</h3><p>${esc(desc)}</p></div>`).join("\n    ")}
  </div>
  ${s.more && s.more.length ? `<p class="svc-more"><strong>Also available at every branch:</strong> ${s.more.map(esc).join(" · ")}.</p>` : ""}
</div></section>`;
}

function renderCoverage(cfg, branches) {
  const cov = cfg.copy.coverage;
  const dark = cfg.theme.coverageDark ? " dark" : "";
  const cards = (cfg.theme.coverageStyle || "cards") === "cards";
  const items = branches.map(b => cards
    ? `<a class="branch" href="https://${b.domain}/">
      <span class="town">${esc(b.location)}<span class="arrow">→</span></span>
      <span class="areas">${areaLine(cfg, b)}</span>
      <span class="tel">${esc(b.phone)}</span>
    </a>`
    : `<a class="branch-row" href="https://${b.domain}/">
      <span class="town">${esc(b.location)}<span class="arrow">→</span></span>
      <span class="areas">${areaLine(cfg, b)}</span>
      <span class="tel">${esc(b.phone)}</span>
    </a>`).join("\n    ");
  return `<section class="pad coverage${dark}" id="branches"><div class="wrap">
  <div class="sec-head">
    <h2>${esc(cov.heading)}</h2>
    <p>${esc(cov.intro)}</p>
  </div>
  <div class="${cards ? "branch-grid" : "branch-list"}">
    ${items}
  </div>
</div></section>`;
}

function renderWhy(cfg) {
  const w = cfg.copy.why;
  return `<section class="pad" id="why"><div class="wrap">
  <div class="sec-head"><h2>${esc(w.heading)}</h2>${w.intro ? `<p>${esc(w.intro)}</p>` : ""}</div>
  <div class="why-grid">
    ${w.points.map(([h, p]) => `<div class="why"><div class="ico">${mark(cfg, 24)}</div><div><h3>${esc(h)}</h3><p>${esc(p)}</p></div></div>`).join("\n    ")}
  </div>
</div></section>`;
}

function renderCta(cfg) {
  const cta = cfg.copy.cta;
  return `<section class="pad cta-band"><div class="wrap">
  <h2>${esc(cta.heading)}</h2>
  <p>${esc(cta.sub)}</p>
  <a class="btn btn-lg" href="#branches">${esc(cta.button)}</a>
</div></section>`;
}

// ---------------------------------------------------------------- deploy

// Full go-live pipeline, mirroring how shield-locksmiths.co.uk is wired up:
//   1. ensure the CF Pages project exists (production_branch=main)
//   2. wrangler pages deploy
//   3. attach the apex custom domain to the project
//   4. proxied CNAMEs: apex -> <project>.pages.dev AND www -> <project>.pages.dev
//   5. ensure the zone-level www -> non-www 301 redirect ruleset exists
// Steps 3-5 are skipped (with a warning) when the zone isn't in the account.
async function deployHub(cfg, outDir) {
  const project = cfg.cf_project || `${cfg.slug}-hub`;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const headers = cfAuthHeaders();
  if (!accountId || !headers) die("CLOUDFLARE_ACCOUNT_ID + credentials required for --deploy");

  const existing = await cfGet(`/accounts/${accountId}/pages/projects/${project}`, headers);
  if (!existing.success) {
    console.log(`  creating CF Pages project '${project}'…`);
    const created = await cfPost(`/accounts/${accountId}/pages/projects`,
      { name: project, production_branch: "main" }, headers);
    if (!created.success) die(`CF project create failed: ${JSON.stringify(created.errors)}`);
  }

  const r = spawnSync("npx", ["wrangler", "pages", "deploy", outDir, "--project-name", project, "--branch", "main", "--commit-dirty=true"], {
    stdio: "inherit", env: process.env, cwd: ROOT,
  });
  if (r.status !== 0) die(`wrangler deploy failed for ${cfg.domain}`);
  console.log(`  ✓ deployed ${cfg.domain} → ${project}.pages.dev`);

  const zones = await cfGet(`/zones?name=${encodeURIComponent(cfg.domain)}`, headers);
  const zone = zones.result && zones.result[0];
  if (!zone) {
    console.log(`  ⚠ no CF zone for ${cfg.domain} — site is live on ${project}.pages.dev only`);
    return;
  }

  const att = await cfPost(`/accounts/${accountId}/pages/projects/${project}/domains`, { name: cfg.domain }, headers);
  const attCode = (att.errors || [])[0]?.code;
  if (att.success || attCode === 8000023 || attCode === 8000007) {
    console.log(`  ✓ custom domain ${cfg.domain} attached to '${project}'`);
  } else {
    die(`domain attach failed for ${cfg.domain}: ${JSON.stringify(att.errors)}`);
  }

  const target = `${project}.pages.dev`;
  for (const name of [cfg.domain, `www.${cfg.domain}`]) {
    const recs = await cfGet(`/zones/${zone.id}/dns_records?name=${encodeURIComponent(name)}&type=CNAME`, headers);
    const rec = recs.result && recs.result[0];
    if (!rec) {
      const created = await cfPost(`/zones/${zone.id}/dns_records`,
        { type: "CNAME", name, content: target, proxied: true, ttl: 1 }, headers);
      if (!created.success) die(`CNAME create failed for ${name}: ${JSON.stringify(created.errors)}`);
      console.log(`  ✓ CNAME ${name} -> ${target} (proxied)`);
    } else if (rec.content !== target || !rec.proxied) {
      const upd = await cfPut(`/zones/${zone.id}/dns_records/${rec.id}`,
        { type: "CNAME", name, content: target, proxied: true, ttl: 1 }, headers);
      if (!upd.success) die(`CNAME update failed for ${name}: ${JSON.stringify(upd.errors)}`);
      console.log(`  ✓ CNAME ${name}: ${rec.content} -> ${target}`);
    } else {
      console.log(`  ✓ CNAME ${name} already correct`);
    }
  }

  await ensureWwwRedirect(zone.id, headers);
}

// Same rule the rest of the estate uses: any www.* host 301s to the bare
// domain, preserving path and query string.
async function ensureWwwRedirect(zoneId, headers) {
  const rulesets = await cfGet(`/zones/${zoneId}/rulesets`, headers);
  const existing = (rulesets.result || []).find(rs => rs.phase === "http_request_dynamic_redirect");
  if (existing) {
    const full = await cfGet(`/zones/${zoneId}/rulesets/${existing.id}`, headers);
    const rules = full.result?.rules || [];
    if (rules.some(rule => (rule.expression || "").includes('starts_with(http.host, "www.")'))) {
      console.log(`  ✓ www -> non-www redirect rule already present`);
      return;
    }
  }
  const rule = {
    expression: 'starts_with(http.host, "www.")',
    description: "www to non-www 301",
    action: "redirect",
    action_parameters: {
      from_value: {
        status_code: 301,
        preserve_query_string: true,
        target_url: { expression: 'concat("https://", substring(http.host, 4), http.request.uri.path)' },
      },
    },
  };
  const res = existing
    ? await cfPost(`/zones/${zoneId}/rulesets/${existing.id}/rules`, rule, headers)
    : await cfPut(`/zones/${zoneId}/rulesets/phases/http_request_dynamic_redirect/entrypoint`,
        { rules: [rule] }, headers);
  if (!res.success) die(`www redirect rule failed: ${JSON.stringify(res.errors)}`);
  console.log(`  ✓ www -> non-www redirect rule created`);
}

function cfAuthHeaders() {
  const email = process.env.CLOUDFLARE_EMAIL;
  const key = process.env.CLOUDFLARE_API_KEY;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (token) return { Authorization: `Bearer ${token}` };
  if (email && key) return { "X-Auth-Email": email, "X-Auth-Key": key };
  return null;
}

async function cfGet(path, headers) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers });
  return r.json();
}

async function cfPost(path, body, headers) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return r.json();
}

async function cfPut(path, body, headers) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return r.json();
}

// ---------------------------------------------------------------- util

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--brand") out.brand = argv[++i];
    else if (a === "--deploy") out.deploy = true;
    else if (a === "--help" || a === "-h") out.help = true;
    else die(`Unknown arg: ${a}`);
  }
  return out;
}

function die(msg) { console.error("ERROR: " + msg); process.exit(1); }

await main();
