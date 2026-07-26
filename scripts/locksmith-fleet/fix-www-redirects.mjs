#!/usr/bin/env node
// Ensure every apex fleet domain has a working www. setup:
//   1. A proxied dummy A record (www -> 192.0.2.1) so Cloudflare answers for the host.
//   2. A dynamic redirect rule sending any www.* request straight to https://apex
//      in a single 301 hop (fires before Always Use HTTPS, so even http://www is one hop).
// This mirrors the setup already live on the 5 apex zones that have www working.
// Subdomain sites (x.brand.co.uk) are skipped — www does not apply to them.
//
// Without flags: audit only. With --apply: create what's missing.
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

const RULE_EXPRESSION = `starts_with(http.host, "www.")`;
const RULE_TARGET = `concat("https://", substring(http.host, 4), http.request.uri.path)`;

const apex = SITES.filter(s => s.domain.split(".").length === 3 && (!ONLY || s.domain === ONLY));
console.log(`Checking www setup on ${apex.length} apex domain(s).  apply=${APPLY}\n`);

const stats = { ok: 0, fixed: 0, missing: 0, no_zone: 0, error: 0 };

for (const site of apex) {
  const { domain } = site;
  try {
    const zone = await cfGet(`/zones?name=${encodeURIComponent(domain)}`);
    const zoneId = zone.result?.[0]?.id;
    if (!zoneId) { console.log(`  ${domain.padEnd(45)} no-zone`); stats.no_zone++; continue; }

    // 1. DNS record for www
    const recs = await cfGet(`/zones/${zoneId}/dns_records?name=${encodeURIComponent("www." + domain)}`);
    const hasDns = (recs.result || []).length > 0;

    // 2. www redirect rule in the dynamic redirect ruleset
    const rulesets = await cfGet(`/zones/${zoneId}/rulesets`);
    const redirectSet = (rulesets.result || []).find(r => r.phase === "http_request_dynamic_redirect");
    let hasRule = false;
    if (redirectSet) {
      const detail = await cfGet(`/zones/${zoneId}/rulesets/${redirectSet.id}`);
      hasRule = (detail.result?.rules || []).some(r => (r.expression || "").includes(`starts_with(http.host, "www.")`));
    }

    if (hasDns && hasRule) { console.log(`  ${domain.padEnd(45)} OK`); stats.ok++; continue; }
    console.log(`  ${domain.padEnd(45)} dns=${hasDns ? "yes" : "MISSING"} rule=${hasRule ? "yes" : "MISSING"}`);
    stats.missing++;
    if (!APPLY) continue;

    if (!hasDns) {
      const created = await cfPost(`/zones/${zoneId}/dns_records`,
        { type: "A", name: `www.${domain}`, content: "192.0.2.1", proxied: true, ttl: 1,
          comment: "dummy target; www redirect rule answers" });
      if (!created.success) throw new Error(`DNS create failed: ${JSON.stringify(created.errors)}`);
      console.log(`    -> created proxied A www.${domain} -> 192.0.2.1`);
    }

    if (!hasRule) {
      const rule = {
        expression: RULE_EXPRESSION,
        description: "www to apex, single 301 hop",
        action: "redirect",
        action_parameters: {
          from_value: {
            status_code: 301,
            preserve_query_string: true,
            target_url: { expression: RULE_TARGET },
          },
        },
      };
      let res;
      if (redirectSet) {
        res = await cfPost(`/zones/${zoneId}/rulesets/${redirectSet.id}/rules`, rule);
      } else {
        res = await cfPost(`/zones/${zoneId}/rulesets`, {
          name: "default", kind: "zone", phase: "http_request_dynamic_redirect", rules: [rule],
        });
      }
      if (!res.success) throw new Error(`rule create failed: ${JSON.stringify(res.errors)}`);
      console.log(`    -> added www->apex redirect rule`);
    }
    stats.fixed++;
  } catch (e) {
    console.log(`  ${domain.padEnd(45)} ERROR  ${e.message}`);
    stats.error++;
  }
}

console.log("\n--- Summary ---");
for (const [k, v] of Object.entries(stats)) console.log(`  ${k.padEnd(8)} ${v}`);

async function cfGet(path) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers: H });
  return r.json();
}
async function cfPost(path, body) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method: "POST",
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
      if (next && !next.startsWith("--")) { a[k] = next; i++; } else a[k] = true;
    }
  }
  return a;
}
