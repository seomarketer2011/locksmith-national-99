# Narrative place-name audit — read-only report

Question: does any site's AI-written copy name places that are not genuinely part of (or adjacent to) its town? Method: extracted every place-name candidate from all 99 sites' narrative copy, kept the 360 site/name pairs naming areas removed by the boundary cleanup, then verified each against (a) every other location's verified area list and (b) proximity geocoding (OS Open Names via postcodes.io) — a name is cleared if a same-named place exists within 10 miles of the site.

## Results

| Verdict | Pairs | Meaning |
|---------|------:|---------|
| Verified real & nearby | 286 | Same-named place within 10 mi — legitimate coverage mention |
| Geocoder found it only far away | 19 | Flagged, but spot-checks show most are real hyper-local places the gazetteer lacks (see below) |
| Not found anywhere | 55 | Mostly real micro-local names below gazetteer granularity (e.g. Katesgrove/Reading, Fairford Leys/Aylesbury, Chalet Estate/Borehamwood) |

## Assessment

The copy is substantially cleaner than the area lists were. The one confirmed misattribution — Castlefields (Runcorn) described as a Warrington regeneration area — was already fixed during the area cleanup. Of the 19 geocoder flags, manual spot-checks show most are false alarms: Castlefield is a famous central-Manchester district, St John's is a well-known Woking village, Little Stoke adjoins Bradley Stoke, Sandyford/Hockley/Silverdale/Priory Estate/Moorend/Highgate all exist within ~2 mi of their sites, and "City Centre" / "Market Place" / "West End" / "Old Town" are ordinary phrases, not place claims.

## Shortlist for a human eyeball (unconfirmed either way)

| Site | Name | Pages |
|------|------|-------|
| Bloxwich | Old Town | broken-key-removal, burglar-repair-service, door-lock-replacement, lock-changes, lock-repairs, safe-opening |
| Farnham | Fairfield | broken-key-removal, burglar-repair-service, lock-changes, locked-out, safe-installation, safe-opening |
| Grimsby | Beacon Hill | home, locked-out, window-lock-repair-replacement |
| Huntingdon | St Johns Park | emergency-locksmith, home, lock-repairs, locked-out, safe-installation, safe-opening |
| Normanton | Moorhouse | safe-opening, window-lock-repair-replacement |
| Rawtenstall | Holme | meta |

Full machine-readable detail: session scratchpad `final-verdicts.json` / `narrative-audit-final.json`. No copy was modified by this audit.