# Locksmith fleet redeploy

Standalone pipeline for redeploying the locksmith fleet to Cloudflare Pages
with the correct per-site logo. Independent of the content-engine work in
the rest of this repo.

## What it does

For each row in `data/locksmith-fleet/sites.json`:

1. Copies `templates/locksmith-fleet/` into `output/locksmith-fleet/<cf_project>/`
2. Replaces 6 tokens in every text file:
   - `{{name}}` — business name (e.g. "Lockman Locksmiths Birmingham")
   - `{{phone}}` — phone number
   - `{{address}}` — formatted address (parses JSON to "Street, City, Postcode")
   - `{{logo_url}}` — path to logo, becomes `/logo/<filename>` so the `assets{{logo_url}}` import resolves correctly
   - `{{location}}` — city/town name
   - `{{color}}` — colour string; if it contains "black" the header renders dark
3. Verifies the logo file is in place at `src/assets/logo/<filename>`
4. Runs `npm install` then `astro build`
5. Deploys `dist/` to Cloudflare Pages with `wrangler pages deploy`

## Required env (for actual deploys)

Set in your local `.env` or shell:

```
CLOUDFLARE_ACCOUNT_ID=...
# Option A — scoped token
CLOUDFLARE_API_TOKEN=...
# Option B — global API key
CLOUDFLARE_EMAIL=...
CLOUDFLARE_API_KEY=...
```

## Usage

```bash
# Birmingham proof-of-concept — substitute only, no build/deploy
node scripts/locksmith-fleet/redeploy.mjs --domain lockmanlocksmithsbirmingham.co.uk --dry-run

# Build but don't deploy (inspect dist/ first)
node scripts/locksmith-fleet/redeploy.mjs --domain lockmanlocksmithsbirmingham.co.uk --skip-deploy

# Full deploy of Birmingham
node scripts/locksmith-fleet/redeploy.mjs --domain lockmanlocksmithsbirmingham.co.uk

# All 42 sites where the logo is bundled in the template
node scripts/locksmith-fleet/redeploy.mjs --deployable

# All 99 sites — fails on missing logos but logs them as skipped
node scripts/locksmith-fleet/redeploy.mjs --all

# Override the auto-derived CF project name
node scripts/locksmith-fleet/redeploy.mjs --domain X --cf-project some-existing-project
```

## Cloudflare project name convention

By default, `cf_project` is derived from the domain:
- `lockmanlocksmithsbirmingham.co.uk` → `lockmanlocksmithsbirmingham`
- `bournemouth.shield-locksmiths.co.uk` → `bournemouth-shield-locksmiths`

If the existing CF Pages project on your account uses a different name
(check the dashboard), edit the `cf_project` column in
`data/locksmith-fleet/sites.csv` and regenerate `sites.json`, OR pass
`--cf-project <name>` for one-off overrides.

## Fleet status

- **99 sites** in the manifest — all deployable and verified live (July 2026)
- **0 blocked** — every logo is bundled in `templates/locksmith-fleet/src/assets/logo/`. If a future site is added without its logo, it will appear in `data/locksmith-fleet/blocked.csv` again; drop the missing PNG into the logo dir (filename must match the `logo_url` column) and run `refresh-logo-presence.mjs` to unblock it.

## The CNAME problem (important)

Audit of the CF account (May 2026) found that **94 of 95 custom domains had broken CNAMEs**: they all pointed at `main.<project>.pages.dev` (preview branch alias) instead of `<project>.pages.dev` (production alias). This is why redeploys "didn't take" — every deploy went to the production environment but DNS was serving stale preview deploys.

Symptom: site shows stale logo / business name / phone, even right after a deploy.

Fix per-site:

```bash
node scripts/locksmith-fleet/audit-cnames.mjs --domain X            # audit only
node scripts/locksmith-fleet/audit-cnames.mjs --domain X --apply    # actually rewrite DNS
```

Across the fleet:

```bash
node scripts/locksmith-fleet/audit-cnames.mjs                # audit all 99
node scripts/locksmith-fleet/audit-cnames.mjs --apply        # apply fixes
```

Or as part of redeploy:

```bash
node scripts/locksmith-fleet/redeploy.mjs --domain X --fix-cname
```

## Files

```
templates/locksmith-fleet/         # The Astro template (extracted from Locksmith 1.zip)
data/locksmith-fleet/
  sites.csv                        # Human-readable manifest
  sites.json                       # Script input (same data, JSON)
  blocked.csv                      # Sites missing a logo file
scripts/locksmith-fleet/
  redeploy.mjs                     # The pipeline
  README.md                        # This file
output/locksmith-fleet/<cf_project>/  # Per-site scratch builds (gitignored)
```
