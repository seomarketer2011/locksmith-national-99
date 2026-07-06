#!/usr/bin/env node
// Bulk-submit Astro sitemaps to Google Search Console via the Search Console API.
// Auth: service account JSON key (Domain-property owner permission required).
//
// Usage:
//   GSC_KEY=/path/to/sa.json node scripts/locksmith-fleet/gsc-submit-sitemaps.mjs
//   GSC_KEY=/path/to/sa.json node scripts/locksmith-fleet/gsc-submit-sitemaps.mjs --auth-only   (just test auth)
//   GSC_KEY=/path/to/sa.json node scripts/locksmith-fleet/gsc-submit-sitemaps.mjs --dry-run
//
// One sitemap submitted per live site. siteUrl is the GSC Domain property
// (e.g. sc-domain:shield-locksmiths.co.uk); feedpath is the full sitemap URL
// (e.g. https://bournemouth.shield-locksmiths.co.uk/sitemap-index.xml).

import { readFileSync } from "node:fs";
import { createSign, createPrivateKey } from "node:crypto";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const authOnly = args.includes("--auth-only");

const keyPath = process.env.GSC_KEY || "/tmp/gsc-sa.json";
const sa = JSON.parse(readFileSync(keyPath, "utf8"));

// --- 1. Build a JWT and exchange for an access token ---
function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const signingInput = b64url(JSON.stringify(header)) + "." + b64url(JSON.stringify(claim));
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  const sig = b64url(signer.sign(createPrivateKey(sa.private_key)));
  const jwt = signingInput + "." + sig;

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const d = await r.json();
  if (!d.access_token) throw new Error("OAuth failure: " + JSON.stringify(d));
  return d.access_token;
}

const token = await getAccessToken();
console.log(`✓ Auth OK, access token obtained.`);
console.log(`  Service account: ${sa.client_email}`);
if (authOnly) process.exit(0);

// --- 2. Submit sitemaps for every live site ---
const sites = JSON.parse(readFileSync(join(ROOT, "data", "locksmith-fleet", "sites.json"), "utf8"))
  .filter(s => s.logo_present);

// Map each site -> its GSC Domain property (the registered zone)
function gscPropertyFor(domain) {
  const parts = domain.split(".");
  // For 3-part domains like brand-locksmiths.co.uk, the property IS the domain
  // For subdomains like X.brand-locksmiths.co.uk, the property is the parent 3-part zone
  return parts.length >= 4 ? parts.slice(-3).join(".") : domain;
}

async function submitSitemap(siteUrl, feedpath) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`;
  const r = await fetch(url, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
  return { status: r.status, body: r.status === 200 ? "" : await r.text() };
}

let okCount = 0, failCount = 0;
const failures = [];

console.log(`\nSubmitting ${sites.length} sitemaps to Search Console:\n`);

for (const site of sites) {
  const property = gscPropertyFor(site.domain);
  const siteUrl = `sc-domain:${property}`;
  const feedpath = `https://${site.domain}/sitemap-index.xml`;

  if (dryRun) {
    console.log(`  DRY  property=${property.padEnd(38)}  sitemap=${feedpath}`);
    okCount++;
    continue;
  }

  const r = await submitSitemap(siteUrl, feedpath);
  if (r.status === 200 || r.status === 204) {
    console.log(`  ✓ ${site.domain}`);
    okCount++;
  } else {
    console.log(`  ✗ ${site.domain.padEnd(55)} HTTP ${r.status} — ${r.body.slice(0, 100)}`);
    failures.push({ domain: site.domain, status: r.status, body: r.body });
    failCount++;
  }
  // Tiny pause to be gentle with the API
  await new Promise(r => setTimeout(r, 50));
}

console.log(`\n--- Summary ---`);
console.log(`  Submitted: ${okCount}`);
console.log(`  Failed:    ${failCount}`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures.slice(0, 20)) console.log(`  - ${f.domain}: ${f.status} ${f.body.slice(0, 80)}`);
}
