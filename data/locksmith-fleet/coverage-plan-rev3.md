# Coverage plan rev 3 — master build list

Source: `locksmithcoverageplanrev2withpopulation.xlsx` cross-referenced against `data/locksmith-fleet/sites.json` (99 live sites, zero drift).

## Decision rule

- **Threshold: population ≥ 70,000 gets its own website**, applied across all 407 locations regardless of current status.
- **Individual website (new market)**: every unbuilt `city`/`major-city` from rev 2, plus any town ≥ 70,000 (23 towns promoted out of the old bundles).
- **Individual website (second site)**: the 22 live *subdomain* sites in 70k+ towns each also get a brand-new individual-domain site — fresh brand, completely different content, distinct NAP — while the existing subdomain site **stays live** and competes alongside it.
- **Subdomain bundles**: the remaining 221 sub-70k towns re-clustered from scratch **by geographic locality** (geocoded, distance-based clustering — not the rev-2 bundles) into 27 bundles of 7–9. Average bundle spread ~32 miles. Each bundle = one new hub brand domain; bundles are numbered north → south. The idle `doorfix-locksmiths.co.uk` hub can serve as the first bundle's brand.

**Totals: 109 individual sites to build (87 new-market + 22 second-site) + 221 bundle subdomains in 27 bundles = 330 builds.**

## A. Individual websites — 109 sites, in build-priority order (population desc)

| # | Location | Region | Type | Population | Note |
|---|----------|--------|------|-----------:|------|
| 1 | Newcastle upon Tyne | North East | major-city | 286,472 |  |
| 2 | Derby | East Midlands | major-city | 275,561 |  |
| 3 | Kingston upon Hull | Yorkshire and The Humber | major-city | 270,816 |  |
| 4 | Stoke-on-Trent | West Midlands | city | 260,560 | SECOND SITE — keep `stoke-on-trent.surelok-locksmiths.co.uk` live; new brand, all-new content |
| 5 | Northampton | East Midlands | major-city | 243,527 |  |
| 6 | Wolverhampton | West Midlands | major-city | 234,029 |  |
| 7 | Luton | East of England | city | 233,524 |  |
| 8 | Reading | South East | city | 203,789 |  |
| 9 | Milton Keynes | South East | major-city | 197,328 |  |
| 10 | Bournemouth | South West | major-city | 196,453 | SECOND SITE — keep `bournemouth.shield-locksmiths.co.uk` live; new brand, all-new content |
| 11 | Peterborough | East of England | town | 190,592 | SECOND SITE — keep `peterborough.shieldx-locksmiths.co.uk` live; new brand, all-new content |
| 12 | Bolton | North West | major-city | 184,077 |  |
| 13 | Swindon | South West | town | 183,687 | promoted from old Bundle 19 |
| 14 | Southend-on-Sea | East of England | city | 182,295 |  |
| 15 | Warrington | North West | major-city | 174,968 | SECOND SITE — keep `warrington.boltman-locksmiths.co.uk` live; new brand, all-new content |
| 16 | Oxford | South East | city | 170,799 | SECOND SITE — keep `oxford.boltfix-locksmiths.co.uk` live; new brand, all-new content |
| 17 | Sunderland | North East | major-city | 168,323 | SECOND SITE — keep `sunderland.boltlok-locksmiths.co.uk` live; new brand, all-new content |
| 18 | Slough | South East | town | 166,868 | SECOND SITE — keep `slough.boltpro-locksmiths.co.uk` live; new brand, all-new content |
| 19 | Brighton | South East | town | 165,275 | promoted from old Bundle 25 |
| 20 | Telford | West Midlands | suburb | 156,890 | promoted from old Bundle 13 |
| 21 | Cambridge | East of England | city | 152,742 |  |
| 22 | Ipswich | East of England | city | 151,566 |  |
| 23 | Middlesbrough | North East | city | 148,232 |  |
| 24 | York | Yorkshire and The Humber | major-city | 141,696 |  |
| 25 | Huddersfield | Yorkshire and The Humber | town | 141,683 | promoted from old Bundle 06 |
| 26 | Poole | South West | major-city | 141,009 |  |
| 27 | Watford | East of England | town | 131,336 | promoted from old Bundle 16 |
| 28 | Colchester | East of England | major-city | 130,259 |  |
| 29 | Blackburn | North West | town | 124,958 | promoted from old Bundle 03 |
| 30 | Crawley | South East | city | 120,567 |  |
| 31 | Gloucester | South West | city | 118,562 |  |
| 32 | Stockport | North West | major-city | 117,925 |  |
| 33 | Basingstoke | South East | suburb | 117,211 | promoted from old Bundle 19 |
| 34 | Cheltenham | South West | city | 115,941 | SECOND SITE — keep `cheltenham.steelok-locksmiths.co.uk` live; new brand, all-new content |
| 35 | Basildon | East of England | city | 115,935 |  |
| 36 | Gateshead | North East | town | 115,278 | SECOND SITE — keep `gateshead.suresec-locksmiths.co.uk` live; new brand, all-new content |
| 37 | Worthing | South East | town | 111,635 | SECOND SITE — keep `worthing.trulock-locksmiths.co.uk` live; new brand, all-new content |
| 38 | Rochdale | North West | major-city | 111,258 | SECOND SITE — keep `rochdale.toplock-locksmiths.co.uk` live; new brand, all-new content |
| 39 | Oldham | North West | major-city | 110,722 |  |
| 40 | Chelmsford | East of England | city | 110,612 |  |
| 41 | Birkenhead | North West | town | 109,854 | promoted from old Bundle 08 |
| 42 | Maidstone | South East | city | 109,503 |  |
| 43 | Gillingham | South East | city | 108,485 |  |
| 44 | Salford | North West | major-city | 108,431 |  |
| 45 | Solihull | West Midlands | major-city | 107,754 |  |
| 46 | St Helens | North West | town | 107,684 | promoted from old Bundle 08 |
| 47 | Worcester | West Midlands | city | 105,439 |  |
| 48 | West Bromwich | West Midlands | town | 103,099 | promoted from old Bundle 12 |
| 49 | Eastbourne | South East | city | 99,171 |  |
| 50 | Wakefield | Yorkshire and The Humber | major-city | 97,871 |  |
| 51 | Wythenshawe | North West | town | 97,665 | promoted from old Bundle 09 |
| 52 | Bedford | East of England | major-city | 97,226 |  |
| 53 | Hemel Hempstead | East of England | town | 95,995 | SECOND SITE — keep `hemelhempstead.surelok-locksmiths.co.uk` live; new brand, all-new content |
| 54 | Preston | North West | major-city | 94,502 |  |
| 55 | Stevenage | East of England | city | 94,462 |  |
| 56 | Southport | North West | town | 94,438 | promoted from old Bundle 04 |
| 57 | Bath | South West | city | 94,080 |  |
| 58 | Harlow | East of England | city | 93,570 |  |
| 59 | Royal Sutton Coldfield | West Midlands | city | 93,392 |  |
| 60 | Darlington | North East | city | 93,022 |  |
| 61 | Chester | North West | town | 92,756 | SECOND SITE — keep `chester.shield-locksmiths.co.uk` live; new brand, all-new content |
| 62 | Hove | South East | town | 91,900 | promoted from old Bundle 25 |
| 63 | Hastings | South East | city | 91,497 | SECOND SITE — keep `hastings.shieldx-locksmiths.co.uk` live; new brand, all-new content |
| 64 | Nuneaton | West Midlands | town | 88,818 | promoted from old Bundle 12 |
| 65 | Halifax | Yorkshire and The Humber | town | 88,111 | promoted from old Bundle 03 |
| 66 | Hartlepool | North East | city | 88,001 |  |
| 67 | Aylesbury | South East | town | 87,966 | SECOND SITE — keep `aylesbury.boltman-locksmiths.co.uk` live; new brand, all-new content |
| 68 | Doncaster | Yorkshire and The Humber | major-city | 87,440 | SECOND SITE — keep `doncaster.boltfix-locksmiths.co.uk` live; new brand, all-new content |
| 69 | Grimsby | Yorkshire and The Humber | town | 85,915 | SECOND SITE — keep `grimsby.boltlok-locksmiths.co.uk` live; new brand, all-new content |
| 70 | Wallasey | North West | town | 85,619 | SECOND SITE — keep `wallasey.boltpro-locksmiths.co.uk` live; new brand, all-new content |
| 71 | Stockton-on-Tees | North East | city | 84,824 |  |
| 72 | Weston-super-Mare | South West | city | 84,600 |  |
| 73 | High Wycombe | South East | town | 83,541 | promoted from old Bundle 19 |
| 74 | Ashford | South East | city | 82,143 |  |
| 75 | Redditch | West Midlands | city | 81,634 |  |
| 76 | Wigan | North West | major-city | 81,580 |  |
| 77 | Scunthorpe | Yorkshire and The Humber | town | 81,286 | promoted from old Bundle 05 |
| 78 | Bury | North West | town | 81,115 | promoted from old Bundle 03 |
| 79 | Bracknell | South East | town | 78,662 | promoted from old Bundle 21 |
| 80 | Burnley | North West | town | 78,266 | promoted from old Bundle 03 |
| 81 | Rugby | West Midlands | city | 78,130 |  |
| 82 | Guildford | South East | city | 77,870 |  |
| 83 | Chatham | South East | town | 76,956 | promoted from old Bundle 20 |
| 84 | Newcastle-under-Lyme | West Midlands | city | 76,511 |  |
| 85 | Chesterfield | East Midlands | city | 76,394 |  |
| 86 | Burton upon Trent | West Midlands | suburb | 76,264 | SECOND SITE — keep `burtonupontrent.steelok-locksmiths.co.uk` live; new brand, all-new content |
| 87 | Tamworth | West Midlands | city | 76,074 | SECOND SITE — keep `tamworth.suresec-locksmiths.co.uk` live; new brand, all-new content |
| 88 | Woking | South East | city | 75,655 | SECOND SITE — keep `woking.trulock-locksmiths.co.uk` live; new brand, all-new content |
| 89 | St Albans | East of England | town | 75,544 | SECOND SITE — keep `stalbans.toplock-locksmiths.co.uk` live; new brand, all-new content |
| 90 | Harrogate | Yorkshire and The Humber | city | 75,522 |  |
| 91 | Crewe | North West | town | 74,116 | promoted from old Bundle 09 |
| 92 | South Shields | North East | town | 73,326 | promoted from old Bundle 01 |
| 93 | Stafford | West Midlands | city | 71,695 |  |
| 94 | Rotherham | Yorkshire and The Humber | major-city | 71,535 |  |
| 95 | Barnsley | Yorkshire and The Humber | major-city | 71,394 |  |
| 96 | Walsall | West Midlands | major-city | 70,777 |  |
| 97 | Dudley | West Midlands | major-city | 64,277 |  |
| 98 | Canterbury | South East | city | 55,107 |  |
| 99 | Wokingham | South East | city | 50,320 |  |
| 100 | Horsham | South East | city | 50,211 |  |
| 101 | Winchester | South East | city | 48,486 |  |
| 102 | Braintree | East of England | city | 43,179 |  |
| 103 | Fareham | South East | city | 42,633 |  |
| 104 | Chorley | North West | city | 39,539 | borderline — small, could demote to a bundle |
| 105 | Warwick | West Midlands | city | 36,673 | borderline — small, could demote to a bundle |
| 106 | Dover | South East | city | 36,349 | borderline — small, could demote to a bundle |
| 107 | Lichfield | West Midlands | city | 32,586 | borderline — small, could demote to a bundle |
| 108 | Morley | Yorkshire and The Humber | city | 32,562 | borderline — small, could demote to a bundle |
| 109 | Stroud | South West | city | 26,073 | borderline — small, could demote to a bundle |

## B. Subdomain bundles — 27 hub domains, numbered north → south

### Bundle 01 - Tynemouth & Area — 8 subdomains, combined pop 271,740, max spread 22 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Tynemouth | North East | suburb | 60,611 |
| Wallsend | North East | town | 45,351 |
| Whitley Bay | North East | town | 36,876 |
| Cramlington | North East | suburb | 28,846 |
| Ashington | North East | town | 28,279 |
| Longbenton | North East | town | 26,882 |
| Chester-le-Street | North East | town | 23,554 |
| Hebburn | North East | suburb | 21,341 |

### Bundle 02 - Durham & Area — 7 subdomains, combined pop 224,202, max spread 23 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Durham | North East | town | 50,502 |
| Redcar | North East | suburb | 37,666 |
| Billingham | North East | town | 33,917 |
| Eston | North East | suburb | 29,625 |
| Newton Aycliffe | North East | town | 25,760 |
| Ingleby Barwick | North East | suburb | 23,380 |
| Thornaby-on-Tees | North East | suburb | 23,352 |

### Bundle 03 - Middleton & Area — 8 subdomains, combined pop 278,041, max spread 30 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Middleton | North West | town | 46,617 |
| Bamber Bridge | North West | suburb | 40,359 |
| Leyland | North West | suburb | 39,281 |
| Accrington | North West | suburb | 34,897 |
| Fulwood | North West | town | 34,693 |
| Nelson | North West | town | 33,808 |
| Darwen | North West | town | 27,897 |
| Penwortham | North West | town | 20,489 |

### Bundle 04 - Dewsbury & Area — 9 subdomains, combined pop 293,476, max spread 29 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Dewsbury | Yorkshire and The Humber | town | 63,730 |
| Keighley | Yorkshire and The Humber | town | 48,754 |
| Chadderton | North West | town | 37,602 |
| Heywood | North West | town | 29,724 |
| Stalybridge | North West | town | 26,850 |
| Royton | North West | suburb | 22,997 |
| Bingley | Yorkshire and The Humber | town | 21,334 |
| Bramley | Yorkshire and The Humber | town | 21,334 |
| Dukinfield | North West | town | 21,151 |

### Bundle 05 - Pontefract & Area — 8 subdomains, combined pop 185,857, max spread 64 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Pontefract | Yorkshire and The Humber | town | 32,982 |
| Beverley | Yorkshire and The Humber | town | 30,933 |
| Cleethorpes | Yorkshire and The Humber | town | 29,660 |
| Gainsborough | East Midlands | town | 21,899 |
| Ossett | Yorkshire and The Humber | town | 21,854 |
| Rothwell | Yorkshire and The Humber | town | 20,964 |
| Goole | Yorkshire and The Humber | town | 20,173 |
| Wickersley | Yorkshire and The Humber | town | 7,392 |

### Bundle 06 - Leigh & Area — 9 subdomains, combined pop 282,229, max spread 12 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Leigh | North West | town | 45,499 |
| Urmston | North West | town | 41,728 |
| Eccles | North West | town | 41,116 |
| Farnworth | North West | town | 28,761 |
| Ashton-in-Makerfield | North West | suburb | 26,367 |
| Little Hulton | North West | town | 25,824 |
| Golborne | North West | town | 25,563 |
| Hindley | North West | town | 24,485 |
| Swinton | North West | town | 22,886 |

### Bundle 07 - Bootle & Area — 9 subdomains, combined pop 314,969, max spread 18 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Bootle | North West | town | 53,722 |
| Crosby | North West | town | 50,218 |
| Kirkby | North West | town | 45,559 |
| Prescot | North West | suburb | 39,227 |
| Skelmersdale | North West | town | 34,921 |
| Newton-le-Willows | North West | town | 24,651 |
| Orrell | North West | suburb | 23,412 |
| Formby | North West | town | 22,892 |
| Maghull | North West | town | 20,367 |

### Bundle 08 - Ashton-under-Lyne & Area — 9 subdomains, combined pop 269,761, max spread 11 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Ashton-under-Lyne | North West | town | 48,595 |
| Denton | North West | town | 36,005 |
| Hyde | North West | town | 35,902 |
| Prestwich | North West | town | 31,509 |
| Stretford | North West | town | 28,010 |
| Droylsden | North West | town | 23,916 |
| Whitefield | North West | town | 22,193 |
| Reddish | North West | town | 22,189 |
| Old Trafford | North West | town | 21,442 |

### Bundle 09 - Ellesmere Port & Area — 9 subdomains, combined pop 366,286, max spread 36 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Ellesmere Port | North West | town | 65,425 |
| Sale | North West | town | 62,545 |
| Widnes | North West | town | 59,938 |
| Altrincham | North West | town | 49,672 |
| Winsford | North West | town | 32,522 |
| Congleton | North West | town | 30,001 |
| Cheadle Hulme | North West | town | 24,782 |
| Brownhills | West Midlands | town | 21,238 |
| Hazel Grove | North West | suburb | 20,163 |

### Bundle 10 - Mansfield & Area — 7 subdomains, combined pop 260,141, max spread 42 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Mansfield | East Midlands | town | 63,448 |
| Macclesfield | North West | town | 54,352 |
| Worksop | East Midlands | town | 43,435 |
| Sutton in Ashfield | East Midlands | town | 36,435 |
| Kirkby-in-Ashfield | East Midlands | town | 21,262 |
| Dronfield | East Midlands | town | 21,161 |
| Buxton | East Midlands | suburb | 20,048 |

### Bundle 11 - Beeston & Area — 8 subdomains, combined pop 252,832, max spread 23 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Beeston | East Midlands | suburb | 52,359 |
| Ilkeston | East Midlands | town | 38,723 |
| Long Eaton | East Midlands | suburb | 37,815 |
| Swadlincote | East Midlands | suburb | 34,569 |
| Heanor | East Midlands | town | 24,264 |
| Clifton | East Midlands | town | 22,936 |
| Coalville | East Midlands | suburb | 21,975 |
| Ripley | East Midlands | suburb | 20,191 |

### Bundle 12 - Grantham & Area — 8 subdomains, combined pop 233,383, max spread 53 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Grantham | East Midlands | town | 44,906 |
| Wigston | East Midlands | suburb | 34,728 |
| Spalding | East Midlands | suburb | 30,552 |
| Melton Mowbray | East Midlands | suburb | 27,451 |
| Wisbech | East of England | suburb | 26,800 |
| Market Harborough | East Midlands | suburb | 24,162 |
| Oadby | East Midlands | suburb | 24,039 |
| Stamford | East Midlands | town | 20,745 |

### Bundle 13 - Cannock & Area — 7 subdomains, combined pop 303,155, max spread 33 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Cannock | West Midlands | suburb | 63,057 |
| Smethwick | West Midlands | town | 56,343 |
| Carlton | East Midlands | suburb | 53,555 |
| Hinckley | East Midlands | suburb | 50,729 |
| Bedworth | West Midlands | suburb | 31,083 |
| Rugeley | West Midlands | town | 26,149 |
| Kenilworth | West Midlands | town | 22,239 |

### Bundle 14 - Kingswinford & Area — 9 subdomains, combined pop 352,163, max spread 8 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Kingswinford | West Midlands | suburb | 51,900 |
| Willenhall | West Midlands | town | 49,582 |
| Tipton | West Midlands | town | 47,202 |
| Oldbury | West Midlands | town | 45,188 |
| Rowley Regis | West Midlands | town | 39,052 |
| Bilston | West Midlands | town | 34,631 |
| Brierley Hill | West Midlands | town | 32,311 |
| Sedgley | West Midlands | town | 31,976 |
| Wednesbury | West Midlands | town | 20,321 |

### Bundle 15 - Corby & Area — 7 subdomains, combined pop 295,409, max spread 33 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Corby | East Midlands | town | 68,164 |
| Kettering | East Midlands | town | 63,149 |
| Wellingborough | East Midlands | town | 54,421 |
| St Neots | East of England | town | 33,262 |
| Rushden | East Midlands | town | 31,689 |
| Kempston | East of England | suburb | 22,779 |
| Biggleswade | East of England | town | 21,945 |

### Bundle 16 - Halesowen & Area — 9 subdomains, combined pop 350,880, max spread 45 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Halesowen | West Midlands | town | 60,103 |
| Kidderminster | West Midlands | town | 57,567 |
| Stourbridge | West Midlands | town | 56,961 |
| Banbury | South East | town | 52,041 |
| Evesham | West Midlands | town | 28,256 |
| Stratford-upon-Avon | West Midlands | town | 28,112 |
| Droitwich Spa | West Midlands | town | 26,413 |
| Quedgeley and Hardwicke | South West | suburb | 21,125 |
| Stourport-on-Severn | West Midlands | town | 20,302 |

### Bundle 17 - Clacton-on-Sea & Area — 8 subdomains, combined pop 245,995, max spread 46 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Clacton-on-Sea | East of England | suburb | 53,190 |
| Bury St Edmunds | East of England | town | 41,279 |
| Rayleigh | East of England | suburb | 32,383 |
| Witham | East of England | suburb | 27,395 |
| Felixstowe | East of England | town | 24,218 |
| Sudbury | East of England | suburb | 23,922 |
| Maldon | East of England | suburb | 23,389 |
| Harwich | East of England | town | 20,219 |

### Bundle 18 - Bletchley & Area — 9 subdomains, combined pop 313,653, max spread 29 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Bletchley | South East | town | 45,018 |
| Leighton Buzzard | East of England | town | 42,736 |
| Hatfield | East of England | town | 41,561 |
| Hitchin | East of England | suburb | 35,220 |
| Dunstable | East of England | town | 34,498 |
| Letchworth | East of England | suburb | 33,993 |
| Harpenden | East of England | town | 30,964 |
| Bushey | East of England | suburb | 28,427 |
| Berkhamsted | East of England | town | 21,236 |

### Bundle 19 - Brentwood & Area — 9 subdomains, combined pop 327,704, max spread 31 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Brentwood | East of England | town | 55,339 |
| Cheshunt | East of England | suburb | 43,694 |
| Bishop's Stortford | East of England | town | 40,916 |
| Hoddesdon | East of England | suburb | 40,615 |
| Billericay | East of England | town | 34,068 |
| Loughton | East of England | town | 33,338 |
| Hertford | East of England | town | 28,807 |
| Wickford | East of England | town | 27,533 |
| Potters Bar | East of England | suburb | 23,394 |

### Bundle 20 - Maidenhead & Area — 7 subdomains, combined pop 253,834, max spread 40 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Maidenhead | South East | town | 67,391 |
| Newbury | South East | town | 42,262 |
| Bicester | South East | town | 37,748 |
| Didcot | South East | town | 34,600 |
| Rickmansworth | East of England | suburb | 26,290 |
| Thatcham | South East | suburb | 25,537 |
| Hazlemere | South East | suburb | 20,006 |

### Bundle 21 - Yeovil & Area — 9 subdomains, combined pop 317,227, max spread 60 mi

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

### Bundle 22 - Camberley & Area — 9 subdomains, combined pop 176,895, max spread 14 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Camberley | South East | suburb | 36,787 |
| Windsor | South East | town | 31,569 |
| Egham | South East | suburb | 28,003 |
| Ascot | South East | town | 24,003 |
| Staines-upon-Thames | South East | town | 21,327 |
| Sandhurst | South East | town | 20,220 |
| New Haw | South East | suburb | 5,757 |
| West Byfleet | South East | town | 5,626 |
| Sheerwater | South East | suburb | 3,603 |

### Bundle 23 - Dartford & Area — 9 subdomains, combined pop 345,676, max spread 32 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Dartford | South East | suburb | 69,131 |
| Rochester | South East | town | 67,279 |
| Royal Tunbridge Wells | South East | town | 51,215 |
| Tonbridge | South East | suburb | 36,136 |
| Northfleet | South East | town | 29,892 |
| Sevenoaks | South East | town | 26,474 |
| Larkfield | South East | suburb | 26,147 |
| South Ockendon | East of England | suburb | 22,441 |
| South Benfleet | East of England | suburb | 16,961 |

### Bundle 24 - Margate & Area — 7 subdomains, combined pop 282,294, max spread 41 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Margate | South East | town | 63,315 |
| Folkestone | South East | town | 51,987 |
| Ramsgate | South East | town | 42,031 |
| Canvey Island | East of England | town | 38,004 |
| Whitstable | South East | town | 32,185 |
| Deal | South East | town | 28,992 |
| Broadstairs | South East | suburb | 25,780 |

### Bundle 25 - West Molesey & Area — 9 subdomains, combined pop 237,679, max spread 18 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| West Molesey | South East | suburb | 47,144 |
| Epsom | South East | town | 35,857 |
| Redhill | South East | town | 32,516 |
| Ewell | South East | suburb | 27,509 |
| Horley | South East | town | 27,067 |
| Walton-on-Thames | South East | town | 27,016 |
| Reigate | South East | town | 23,774 |
| Tadworth | South East | suburb | 9,522 |
| Epsom Downs | South East | suburb | 7,274 |

### Bundle 26 - Bognor Regis & Area — 7 subdomains, combined pop 237,544, max spread 42 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Bognor Regis | South East | suburb | 68,443 |
| Fleet | South East | town | 37,800 |
| Chichester | South East | town | 31,709 |
| Woodley | South East | suburb | 28,019 |
| Ash and Ash Vale | South East | suburb | 24,284 |
| Ryde | South East | town | 24,094 |
| Hedge End | South East | town | 23,195 |

### Bundle 27 - Haywards Heath & Area — 7 subdomains, combined pop 195,759, max spread 34 mi

| Location | Region | Type | Population |
|----------|--------|------|-----------:|
| Haywards Heath | South East | town | 40,186 |
| Rustington | South East | town | 33,885 |
| Burgess Hill | South East | town | 33,352 |
| Seaford | South East | suburb | 23,865 |
| Hailsham | South East | suburb | 22,560 |
| Crowborough | South East | town | 21,990 |
| Portslade | South East | town | 19,921 |
