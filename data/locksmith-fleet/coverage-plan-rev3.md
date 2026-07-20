# Coverage plan rev 3 — build list for the 308 unbuilt locations

Source: `locksmithcoverageplanrev2withpopulation.xlsx` cross-referenced against `data/locksmith-fleet/sites.json` (99 live sites, zero drift as of 2026-07-20).

## Decision rule

- **Individual website**: every `city`/`major-city` from rev 2, **plus any bundled town with population ≥ 100,000** (10 towns promoted — population is a better signal of search volume than the type label; rev 2 had Swindon at 184k in a bundle while 26k Stroud got its own site).
- **Subdomain bundle**: everything else — 234 towns/suburbs across the same 25 geographic bundles from rev 2 (now 7–10 members each). Each bundle = one new hub brand domain, same model as the 12 live hubs (~7–8 subdomains each today). The idle `doorfix-locksmiths.co.uk` hub can serve as the first bundle's brand.
- Bundles 06 and 16 lost their anchor to promotion and are re-anchored: **06 → Ashton-under-Lyne**, **16 → Bletchley**.

**Totals: 74 individual sites + 234 bundled towns in 25 bundles = 308.**

## A. Individual websites — 74 sites, in build-priority order (population desc)

| # | Location | Region | Type | Population | Note |
|---|----------|--------|------|-----------:|------|
| 1 | Newcastle upon Tyne | North East | major-city | 286,472 |  |
| 2 | Derby | East Midlands | major-city | 275,561 |  |
| 3 | Kingston upon Hull | Yorkshire and The Humber | major-city | 270,816 |  |
| 4 | Northampton | East Midlands | major-city | 243,527 |  |
| 5 | Wolverhampton | West Midlands | major-city | 234,029 |  |
| 6 | Luton | East of England | city | 233,524 |  |
| 7 | Reading | South East | city | 203,789 |  |
| 8 | Milton Keynes | South East | major-city | 197,328 |  |
| 9 | Bolton | North West | major-city | 184,077 |  |
| 10 | Swindon | South West | town | 183,687 | promoted from Bundle 19 |
| 11 | Southend-on-Sea | East of England | city | 182,295 |  |
| 12 | Brighton | South East | town | 165,275 | promoted from Bundle 25 |
| 13 | Telford | West Midlands | suburb | 156,890 | promoted from Bundle 13 |
| 14 | Cambridge | East of England | city | 152,742 |  |
| 15 | Ipswich | East of England | city | 151,566 |  |
| 16 | Middlesbrough | North East | city | 148,232 |  |
| 17 | York | Yorkshire and The Humber | major-city | 141,696 |  |
| 18 | Huddersfield | Yorkshire and The Humber | town | 141,683 | promoted from Bundle 06 |
| 19 | Poole | South West | major-city | 141,009 |  |
| 20 | Watford | East of England | town | 131,336 | promoted from Bundle 16 |
| 21 | Colchester | East of England | major-city | 130,259 |  |
| 22 | Blackburn | North West | town | 124,958 | promoted from Bundle 03 |
| 23 | Crawley | South East | city | 120,567 |  |
| 24 | Gloucester | South West | city | 118,562 |  |
| 25 | Stockport | North West | major-city | 117,925 |  |
| 26 | Basingstoke | South East | suburb | 117,211 | promoted from Bundle 19 |
| 27 | Basildon | East of England | city | 115,935 |  |
| 28 | Oldham | North West | major-city | 110,722 |  |
| 29 | Chelmsford | East of England | city | 110,612 |  |
| 30 | Birkenhead | North West | town | 109,854 | promoted from Bundle 08 |
| 31 | Maidstone | South East | city | 109,503 |  |
| 32 | Gillingham | South East | city | 108,485 |  |
| 33 | Salford | North West | major-city | 108,431 |  |
| 34 | Solihull | West Midlands | major-city | 107,754 |  |
| 35 | St Helens | North West | town | 107,684 | promoted from Bundle 08 |
| 36 | Worcester | West Midlands | city | 105,439 |  |
| 37 | West Bromwich | West Midlands | town | 103,099 | promoted from Bundle 12 |
| 38 | Eastbourne | South East | city | 99,171 |  |
| 39 | Wakefield | Yorkshire and The Humber | major-city | 97,871 |  |
| 40 | Bedford | East of England | major-city | 97,226 |  |
| 41 | Preston | North West | major-city | 94,502 |  |
| 42 | Stevenage | East of England | city | 94,462 |  |
| 43 | Bath | South West | city | 94,080 |  |
| 44 | Harlow | East of England | city | 93,570 |  |
| 45 | Royal Sutton Coldfield | West Midlands | city | 93,392 |  |
| 46 | Darlington | North East | city | 93,022 |  |
| 47 | Hartlepool | North East | city | 88,001 |  |
| 48 | Stockton-on-Tees | North East | city | 84,824 |  |
| 49 | Weston-super-Mare | South West | city | 84,600 |  |
| 50 | Ashford | South East | city | 82,143 |  |
| 51 | Redditch | West Midlands | city | 81,634 |  |
| 52 | Wigan | North West | major-city | 81,580 |  |
| 53 | Rugby | West Midlands | city | 78,130 |  |
| 54 | Guildford | South East | city | 77,870 |  |
| 55 | Newcastle-under-Lyme | West Midlands | city | 76,511 |  |
| 56 | Chesterfield | East Midlands | city | 76,394 |  |
| 57 | Harrogate | Yorkshire and The Humber | city | 75,522 |  |
| 58 | Stafford | West Midlands | city | 71,695 |  |
| 59 | Rotherham | Yorkshire and The Humber | major-city | 71,535 |  |
| 60 | Barnsley | Yorkshire and The Humber | major-city | 71,394 |  |
| 61 | Walsall | West Midlands | major-city | 70,777 |  |
| 62 | Dudley | West Midlands | major-city | 64,277 |  |
| 63 | Canterbury | South East | city | 55,107 |  |
| 64 | Wokingham | South East | city | 50,320 |  |
| 65 | Horsham | South East | city | 50,211 |  |
| 66 | Winchester | South East | city | 48,486 |  |
| 67 | Braintree | East of England | city | 43,179 |  |
| 68 | Fareham | South East | city | 42,633 |  |
| 69 | Chorley | North West | city | 39,539 | borderline — small, could demote to a bundle |
| 70 | Warwick | West Midlands | city | 36,673 | borderline — small, could demote to a bundle |
| 71 | Dover | South East | city | 36,349 | borderline — small, could demote to a bundle |
| 72 | Lichfield | West Midlands | city | 32,586 | borderline — small, could demote to a bundle |
| 73 | Morley | Yorkshire and The Humber | city | 32,562 | borderline — small, could demote to a bundle |
| 74 | Stroud | South West | city | 26,073 | borderline — small, could demote to a bundle |

## B. Subdomain bundles — 25 hub domains, in priority order (combined population desc)

### 1. Bundle 09 - Macclesfield & Area — 10 subdomains, combined pop 465,866

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Wythenshawe | North West | town | 97,665 |
| Crewe | North West | town | 74,116 |
| Sale | North West | town | 62,545 |
| Macclesfield | North West | town | 54,352 |
| Altrincham | North West | town | 49,672 |
| Winsford | North West | town | 32,522 |
| Congleton | North West | town | 30,001 |
| Cheadle Hulme | North West | town | 24,782 |
| Hazel Grove | North West | suburb | 20,163 |
| Buxton | East Midlands | suburb | 20,048 |

### 2. Bundle 03 - Burnley & Area — 9 subdomains, combined pop 442,628

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Halifax | Yorkshire and The Humber | town | 88,111 |
| Bury | North West | town | 81,115 |
| Burnley | North West | town | 78,266 |
| Middleton | North West | town | 46,617 |
| Accrington | North West | suburb | 34,897 |
| Nelson | North West | town | 33,808 |
| Heywood | North West | town | 29,724 |
| Darwen | North West | town | 27,897 |
| Whitefield | North West | town | 22,193 |

### 3. Bundle 01 - Ashington & Area — 10 subdomains, combined pop 395,568

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| South Shields | North East | town | 73,326 |
| Tynemouth | North East | suburb | 60,611 |
| Durham | North East | town | 50,502 |
| Wallsend | North East | town | 45,351 |
| Whitley Bay | North East | town | 36,876 |
| Cramlington | North East | suburb | 28,846 |
| Ashington | North East | town | 28,279 |
| Longbenton | North East | town | 26,882 |
| Chester-le-Street | North East | town | 23,554 |
| Hebburn | North East | suburb | 21,341 |

### 4. Bundle 12 - Rugeley & Area — 9 subdomains, combined pop 392,307

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Nuneaton | West Midlands | town | 88,818 |
| Cannock | West Midlands | suburb | 63,057 |
| Smethwick | West Midlands | town | 56,343 |
| Hinckley | East Midlands | suburb | 50,729 |
| Swadlincote | East Midlands | suburb | 34,569 |
| Bedworth | West Midlands | suburb | 31,083 |
| Rugeley | West Midlands | town | 26,149 |
| Brownhills | West Midlands | town | 21,238 |
| Wednesbury | West Midlands | town | 20,321 |

### 5. Bundle 13 - Sedgley & Area — 9 subdomains, combined pop 388,803

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Stourbridge | West Midlands | town | 56,961 |
| Kingswinford | West Midlands | suburb | 51,900 |
| Willenhall | West Midlands | town | 49,582 |
| Tipton | West Midlands | town | 47,202 |
| Oldbury | West Midlands | town | 45,188 |
| Rowley Regis | West Midlands | town | 39,052 |
| Bilston | West Midlands | town | 34,631 |
| Brierley Hill | West Midlands | town | 32,311 |
| Sedgley | West Midlands | town | 31,976 |

### 6. Bundle 20 - Chatham & Area — 9 subdomains, combined pop 373,285

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Chatham | South East | town | 76,956 |
| Dartford | South East | suburb | 69,131 |
| Rochester | South East | town | 67,279 |
| Canvey Island | East of England | town | 38,004 |
| Northfleet | South East | town | 29,892 |
| Sevenoaks | South East | town | 26,474 |
| Larkfield | South East | suburb | 26,147 |
| South Ockendon | East of England | suburb | 22,441 |
| South Benfleet | East of England | suburb | 16,961 |

### 7. Bundle 17 - Brentwood & Area — 10 subdomains, combined pop 369,265

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Brentwood | East of England | town | 55,339 |
| Cheshunt | East of England | suburb | 43,694 |
| Hatfield | East of England | town | 41,561 |
| Bishop's Stortford | East of England | town | 40,916 |
| Hoddesdon | East of England | suburb | 40,615 |
| Billericay | East of England | town | 34,068 |
| Loughton | East of England | town | 33,338 |
| Hertford | East of England | town | 28,807 |
| Wickford | East of England | town | 27,533 |
| Potters Bar | East of England | suburb | 23,394 |

### 8. Bundle 10 - Dronfield & Area — 10 subdomains, combined pop 369,213

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Mansfield | East Midlands | town | 63,448 |
| Carlton | East Midlands | suburb | 53,555 |
| Beeston | East Midlands | suburb | 52,359 |
| Ilkeston | East Midlands | town | 38,723 |
| Long Eaton | East Midlands | suburb | 37,815 |
| Sutton in Ashfield | East Midlands | town | 36,435 |
| Heanor | East Midlands | town | 24,264 |
| Kirkby-in-Ashfield | East Midlands | town | 21,262 |
| Dronfield | East Midlands | town | 21,161 |
| Ripley | East Midlands | suburb | 20,191 |

### 9. Bundle 04 - Fulwood & Area — 10 subdomains, combined pop 363,096

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Southport | North West | town | 94,438 |
| Bamber Bridge | North West | suburb | 40,359 |
| Leyland | North West | suburb | 39,281 |
| Skelmersdale | North West | town | 34,921 |
| Fulwood | North West | town | 34,693 |
| Ashton-in-Makerfield | North West | suburb | 26,367 |
| Newton-le-Willows | North West | town | 24,651 |
| Hindley | North West | town | 24,485 |
| Orrell | North West | suburb | 23,412 |
| Penwortham | North West | town | 20,489 |

### 10. Bundle 08 - Widnes & Area — 8 subdomains, combined pop 357,348

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Ellesmere Port | North West | town | 65,425 |
| Widnes | North West | town | 59,938 |
| Bootle | North West | town | 53,722 |
| Crosby | North West | town | 50,218 |
| Kirkby | North West | town | 45,559 |
| Prescot | North West | suburb | 39,227 |
| Formby | North West | town | 22,892 |
| Maghull | North West | town | 20,367 |

### 11. Bundle 15 - Kidderminster & Area — 10 subdomains, combined pop 353,906

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Halesowen | West Midlands | town | 60,103 |
| Kidderminster | West Midlands | town | 57,567 |
| Banbury | South East | town | 52,041 |
| Bicester | South East | town | 37,748 |
| Evesham | West Midlands | town | 28,256 |
| Stratford-upon-Avon | West Midlands | town | 28,112 |
| Droitwich Spa | West Midlands | town | 26,413 |
| Kenilworth | West Midlands | town | 22,239 |
| Quedgeley and Hardwicke | South West | suburb | 21,125 |
| Stourport-on-Severn | West Midlands | town | 20,302 |

### 12. Bundle 14 - Wellingborough & Area — 10 subdomains, combined pop 353,239

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Kettering | East Midlands | town | 63,149 |
| Wellingborough | East Midlands | town | 54,421 |
| Bury St Edmunds | East of England | town | 41,279 |
| Letchworth | East of England | suburb | 33,993 |
| St Neots | East of England | town | 33,262 |
| Rushden | East Midlands | town | 31,689 |
| Wisbech | East of England | suburb | 26,800 |
| Sudbury | East of England | suburb | 23,922 |
| Kempston | East of England | suburb | 22,779 |
| Biggleswade | East of England | town | 21,945 |

### 13. Bundle 18 - Felixstowe & Area — 10 subdomains, combined pop 344,105

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Margate | South East | town | 63,315 |
| Clacton-on-Sea | East of England | suburb | 53,190 |
| Ramsgate | South East | town | 42,031 |
| Rayleigh | East of England | suburb | 32,383 |
| Whitstable | South East | town | 32,185 |
| Witham | East of England | suburb | 27,395 |
| Broadstairs | South East | suburb | 25,780 |
| Felixstowe | East of England | town | 24,218 |
| Maldon | East of England | suburb | 23,389 |
| Harwich | East of England | town | 20,219 |

### 14. Bundle 02 - Keighley & Area — 10 subdomains, combined pop 328,852

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Dewsbury | Yorkshire and The Humber | town | 63,730 |
| Keighley | Yorkshire and The Humber | town | 48,754 |
| Redcar | North East | suburb | 37,666 |
| Billingham | North East | town | 33,917 |
| Eston | North East | suburb | 29,625 |
| Newton Aycliffe | North East | town | 25,760 |
| Ingleby Barwick | North East | suburb | 23,380 |
| Thornaby-on-Tees | North East | suburb | 23,352 |
| Bramley | Yorkshire and The Humber | town | 21,334 |
| Bingley | Yorkshire and The Humber | town | 21,334 |

### 15. Bundle 25 - Hove & Area — 8 subdomains, combined pop 326,499

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Hove | South East | town | 91,900 |
| Bognor Regis | South East | suburb | 68,443 |
| Rustington | South East | town | 33,885 |
| Burgess Hill | South East | town | 33,352 |
| Chichester | South East | town | 31,709 |
| Ryde | South East | town | 24,094 |
| Hedge End | South East | town | 23,195 |
| Portslade | South East | town | 19,921 |

### 16. Bundle 21 - Bracknell & Area — 10 subdomains, combined pop 321,255

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Bracknell | South East | town | 78,662 |
| Maidenhead | South East | town | 67,391 |
| Camberley | South East | suburb | 36,787 |
| Windsor | South East | town | 31,569 |
| Egham | South East | suburb | 28,003 |
| Ash and Ash Vale | South East | suburb | 24,284 |
| Ascot | South East | town | 24,003 |
| Staines-upon-Thames | South East | town | 21,327 |
| West Byfleet | South East | town | 5,626 |
| Sheerwater | South East | suburb | 3,603 |

### 17. Bundle 11 - Grantham & Area — 10 subdomains, combined pop 319,658

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Corby | East Midlands | town | 68,164 |
| Grantham | East Midlands | town | 44,906 |
| Wigston | East Midlands | suburb | 34,728 |
| Spalding | East Midlands | suburb | 30,552 |
| Melton Mowbray | East Midlands | suburb | 27,451 |
| Market Harborough | East Midlands | suburb | 24,162 |
| Oadby | East Midlands | suburb | 24,039 |
| Clifton | East Midlands | town | 22,936 |
| Coalville | East Midlands | suburb | 21,975 |
| Stamford | East Midlands | town | 20,745 |

### 18. Bundle 23 - Yate & Area — 9 subdomains, combined pop 317,227

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Yeovil | South West | town | 50,170 |
| Christchurch | South West | suburb | 48,973 |
| Kingswood | South West | town | 40,734 |
| Fishponds | South West | town | 37,575 |
| Chippenham | South West | town | 36,084 |
| Yate | South West | town | 28,352 |
| Frome | South West | town | 27,904 |
| Portishead | South West | town | 26,351 |
| Clevedon | South West | town | 21,084 |

### 19. Bundle 07 - Prestwich & Area — 10 subdomains, combined pop 312,338

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Leigh | North West | town | 45,499 |
| Urmston | North West | town | 41,728 |
| Eccles | North West | town | 41,116 |
| Prestwich | North West | town | 31,509 |
| Farnworth | North West | town | 28,761 |
| Stretford | North West | town | 28,010 |
| Little Hulton | North West | town | 25,824 |
| Golborne | North West | town | 25,563 |
| Swinton | North West | town | 22,886 |
| Old Trafford | North West | town | 21,442 |

### 20. Bundle 05 - Beverley & Area — 10 subdomains, combined pop 310,578

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Scunthorpe | Yorkshire and The Humber | town | 81,286 |
| Worksop | East Midlands | town | 43,435 |
| Pontefract | Yorkshire and The Humber | town | 32,982 |
| Beverley | Yorkshire and The Humber | town | 30,933 |
| Cleethorpes | Yorkshire and The Humber | town | 29,660 |
| Gainsborough | East Midlands | town | 21,899 |
| Ossett | Yorkshire and The Humber | town | 21,854 |
| Rothwell | Yorkshire and The Humber | town | 20,964 |
| Goole | Yorkshire and The Humber | town | 20,173 |
| Wickersley | Yorkshire and The Humber | town | 7,392 |

### 21. Bundle 24 - Folkestone & Area — 9 subdomains, combined pop 303,998

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Folkestone | South East | town | 51,987 |
| Royal Tunbridge Wells | South East | town | 51,215 |
| Haywards Heath | South East | town | 40,186 |
| Tonbridge | South East | suburb | 36,136 |
| Deal | South East | town | 28,992 |
| Horley | South East | town | 27,067 |
| Seaford | South East | suburb | 23,865 |
| Hailsham | South East | suburb | 22,560 |
| Crowborough | South East | town | 21,990 |

### 22. Bundle 16 - Bletchley & Area — 9 subdomains, combined pop 284,395

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Bletchley | South East | town | 45,018 |
| Leighton Buzzard | East of England | town | 42,736 |
| Hitchin | East of England | suburb | 35,220 |
| Dunstable | East of England | town | 34,498 |
| Harpenden | East of England | town | 30,964 |
| Bushey | East of England | suburb | 28,427 |
| Rickmansworth | East of England | suburb | 26,290 |
| Berkhamsted | East of England | town | 21,236 |
| Hazlemere | South East | suburb | 20,006 |

### 23. Bundle 06 - Ashton-under-Lyne & Area — 9 subdomains, combined pop 275,207

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Ashton-under-Lyne | North West | town | 48,595 |
| Chadderton | North West | town | 37,602 |
| Denton | North West | town | 36,005 |
| Hyde | North West | town | 35,902 |
| Stalybridge | North West | town | 26,850 |
| Droylsden | North West | town | 23,916 |
| Royton | North West | suburb | 22,997 |
| Reddish | North West | town | 22,189 |
| Dukinfield | North West | town | 21,151 |

### 24. Bundle 19 - Didcot & Area — 7 subdomains, combined pop 271,979

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| High Wycombe | South East | town | 83,541 |
| Newbury | South East | town | 42,262 |
| Fleet | South East | town | 37,800 |
| Didcot | South East | town | 34,600 |
| Woodley | South East | suburb | 28,019 |
| Thatcham | South East | suburb | 25,537 |
| Sandhurst | South East | town | 20,220 |

### 25. Bundle 22 - Walton-on-Thames & Area — 9 subdomains, combined pop 216,369

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| West Molesey | South East | suburb | 47,144 |
| Epsom | South East | town | 35,857 |
| Redhill | South East | town | 32,516 |
| Ewell | South East | suburb | 27,509 |
| Walton-on-Thames | South East | town | 27,016 |
| Reigate | South East | town | 23,774 |
| Tadworth | South East | suburb | 9,522 |
| Epsom Downs | South East | suburb | 7,274 |
| New Haw | South East | suburb | 5,757 |
