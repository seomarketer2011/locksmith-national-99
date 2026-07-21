# Domain suggestions — coverage plan rev 3 (final)

All suggested domains were checked via DNS on 2026-07-21 and returned NXDOMAIN (no registration found). DNS is a strong but not perfect signal — the registrar will confirm at purchase time.

All registrations go through **Cloudflare Registrar** (at-cost pricing, ~£4/yr for .co.uk), which keeps registration, DNS and Pages deployment in the same Cloudflare account — subdomain/CNAME setup for the bundle hubs and custom-domain binding for the Pages projects need no external DNS changes.

Naming follows the live fleet conventions: `{brand}{city}locksmiths.co.uk` for individual sites, `{brand}-locksmiths.co.uk` for bundle hubs. Every brand token is unique across the fleet, and second-site brands never match the hub brand of the live subdomain they compete with.

Individual-site domains mix four word orders (`brand+city+locksmiths`, `brand+city+locksmith`, `brand+locksmith+city`, `brand+locksmiths+city`) with four hyphenation styles (none, fully hyphenated, hyphen after brand, hyphen before last word) — 16 shapes spread evenly across the 126 sites so the fleet shares no single footprint. Bundle hubs keep the `{brand}-locksmiths.co.uk` structure.

## A. Individual sites — 126 domains (build-priority order)

| # | Location | Suggested Domain | Note |
|---|----------|------------------|------|
| 1 | Newcastle upon Tyne | `keystarnewcastlelocksmiths.co.uk` |  |
| 2 | Derby | `lockstarderbylocksmith.co.uk` |  |
| 3 | Kingston upon Hull | `boltstarlocksmithhull.co.uk` |  |
| 4 | Stoke-on-Trent | `latchstarlocksmithsstokeontrent.co.uk` | second site vs `stoke-on-trent.surelok-locksmiths.co.uk` |
| 5 | Northampton | `keyzone-northampton-locksmiths.co.uk` |  |
| 6 | Wolverhampton | `lockzone-wolverhampton-locksmith.co.uk` |  |
| 7 | Luton | `boltzone-locksmith-luton.co.uk` |  |
| 8 | Reading | `latchzone-locksmiths-reading.co.uk` |  |
| 9 | Milton Keynes | `keywave-miltonkeyneslocksmiths.co.uk` |  |
| 10 | Bournemouth | `lockwave-bournemouthlocksmith.co.uk` | second site vs `bournemouth.shield-locksmiths.co.uk` |
| 11 | Peterborough | `boltwave-locksmithpeterborough.co.uk` | second site vs `peterborough.shieldx-locksmiths.co.uk` |
| 12 | Bolton | `latchwave-locksmithsbolton.co.uk` |  |
| 13 | Swindon | `keypeakswindon-locksmiths.co.uk` |  |
| 14 | Southend-on-Sea | `lockpeaksouthend-locksmith.co.uk` |  |
| 15 | Warrington | `boltpeaklocksmith-warrington.co.uk` | second site vs `warrington.boltman-locksmiths.co.uk` |
| 16 | Oxford | `latchpeaklocksmiths-oxford.co.uk` | second site vs `oxford.boltfix-locksmiths.co.uk` |
| 17 | Sunderland | `keypointsunderlandlocksmiths.co.uk` | second site vs `sunderland.boltlok-locksmiths.co.uk` |
| 18 | Slough | `lockpointsloughlocksmith.co.uk` | second site vs `slough.boltpro-locksmiths.co.uk` |
| 19 | Brighton | `boltpointlocksmithbrighton.co.uk` |  |
| 20 | Telford | `latchpointlocksmithstelford.co.uk` |  |
| 21 | Cambridge | `keyline-cambridge-locksmiths.co.uk` |  |
| 22 | Ipswich | `lockline-ipswich-locksmith.co.uk` |  |
| 23 | Middlesbrough | `boltline-locksmith-middlesbrough.co.uk` |  |
| 24 | York | `latchline-locksmiths-york.co.uk` |  |
| 25 | Huddersfield | `keylink-huddersfieldlocksmiths.co.uk` |  |
| 26 | Poole | `locklink-poolelocksmith.co.uk` |  |
| 27 | Watford | `boltlink-locksmithwatford.co.uk` |  |
| 28 | Colchester | `latchlink-locksmithscolchester.co.uk` |  |
| 29 | Blackburn | `keymateblackburn-locksmiths.co.uk` |  |
| 30 | Crawley | `lockmatecrawley-locksmith.co.uk` |  |
| 31 | Gloucester | `boltmatelocksmith-gloucester.co.uk` |  |
| 32 | Stockport | `latchmatelocksmiths-stockport.co.uk` |  |
| 33 | Basingstoke | `keymaxbasingstokelocksmiths.co.uk` |  |
| 34 | Cheltenham | `lockmaxcheltenhamlocksmith.co.uk` | second site vs `cheltenham.steelok-locksmiths.co.uk` |
| 35 | Basildon | `boltmaxlocksmithbasildon.co.uk` |  |
| 36 | Gateshead | `latchmaxlocksmithsgateshead.co.uk` | second site vs `gateshead.suresec-locksmiths.co.uk` |
| 37 | Worthing | `keycrew-worthing-locksmiths.co.uk` | second site vs `worthing.trulock-locksmiths.co.uk` |
| 38 | Rochdale | `lockcrew-rochdale-locksmith.co.uk` | second site vs `rochdale.toplock-locksmiths.co.uk` |
| 39 | Oldham | `boltcrew-locksmith-oldham.co.uk` |  |
| 40 | Chelmsford | `latchcrew-locksmiths-chelmsford.co.uk` |  |
| 41 | Birkenhead | `keycraft-birkenheadlocksmiths.co.uk` |  |
| 42 | Maidstone | `lockcraft-maidstonelocksmith.co.uk` |  |
| 43 | Gillingham | `boltcraft-locksmithgillingham.co.uk` |  |
| 44 | Salford | `latchcraft-locksmithssalford.co.uk` |  |
| 45 | Solihull | `keydashsolihull-locksmiths.co.uk` |  |
| 46 | St Helens | `lockdashsthelens-locksmith.co.uk` |  |
| 47 | Worcester | `boltdashlocksmith-worcester.co.uk` |  |
| 48 | West Bromwich | `latchdashlocksmiths-westbromwich.co.uk` |  |
| 49 | Eastbourne | `keyedgeeastbournelocksmiths.co.uk` |  |
| 50 | Wakefield | `lockedgewakefieldlocksmith.co.uk` |  |
| 51 | Wythenshawe | `boltedgelocksmithwythenshawe.co.uk` |  |
| 52 | Bedford | `latchedgelocksmithsbedford.co.uk` |  |
| 53 | Hemel Hempstead | `keycore-hemelhempstead-locksmiths.co.uk` | second site vs `hemelhempstead.surelok-locksmiths.co.uk` |
| 54 | Preston | `lockcore-preston-locksmith.co.uk` |  |
| 55 | Stevenage | `boltcoretevenage-locksmith-stevenage.co.uk` |  |
| 56 | Southport | `latchcore-locksmiths-southport.co.uk` |  |
| 57 | Bath | `keygate-bathlocksmiths.co.uk` |  |
| 58 | Harlow | `lockgate-harlowlocksmith.co.uk` |  |
| 59 | Royal Sutton Coldfield | `boltgateuttoncoldfield-locksmithsuttoncoldfield.co.uk` |  |
| 60 | Darlington | `latchgate-locksmithsdarlington.co.uk` |  |
| 61 | Chester | `keygridchester-locksmiths.co.uk` | second site vs `chester.shield-locksmiths.co.uk` |
| 62 | Hove | `lockgridhove-locksmith.co.uk` |  |
| 63 | Hastings | `boltgridlocksmith-hastings.co.uk` | second site vs `hastings.shieldx-locksmiths.co.uk` |
| 64 | Nuneaton | `latchgridlocksmiths-nuneaton.co.uk` |  |
| 65 | Halifax | `keyhavenhalifaxlocksmiths.co.uk` |  |
| 66 | Hartlepool | `lockhavenhartlepoollocksmith.co.uk` |  |
| 67 | Aylesbury | `bolthavenlocksmithaylesbury.co.uk` | second site vs `aylesbury.boltman-locksmiths.co.uk` |
| 68 | Doncaster | `latchhavenlocksmithsdoncaster.co.uk` | second site vs `doncaster.boltfix-locksmiths.co.uk` |
| 69 | Grimsby | `keyjet-grimsby-locksmiths.co.uk` | second site vs `grimsby.boltlok-locksmiths.co.uk` |
| 70 | Wallasey | `lockjet-wallasey-locksmith.co.uk` | second site vs `wallasey.boltpro-locksmiths.co.uk` |
| 71 | Stockton-on-Tees | `boltjettockton-locksmith-stockton.co.uk` |  |
| 72 | Weston-super-Mare | `latchjet-locksmiths-westonsupermare.co.uk` |  |
| 73 | High Wycombe | `keyking-highwycombelocksmiths.co.uk` |  |
| 74 | Ashford | `lockking-ashfordlocksmith.co.uk` |  |
| 75 | Redditch | `boltking-locksmithredditch.co.uk` |  |
| 76 | Wigan | `latchking-locksmithswigan.co.uk` |  |
| 77 | Scunthorpe | `keynodescunthorpe-locksmiths.co.uk` |  |
| 78 | Bury | `locknodebury-locksmith.co.uk` |  |
| 79 | Bracknell | `boltnodelocksmith-bracknell.co.uk` |  |
| 80 | Burnley | `latchnodelocksmiths-burnley.co.uk` |  |
| 81 | Rugby | `keynestrugbylocksmiths.co.uk` |  |
| 82 | Guildford | `locknestguildfordlocksmith.co.uk` |  |
| 83 | Chatham | `boltnestlocksmithchatham.co.uk` |  |
| 84 | Newcastle-under-Lyme | `latchnestlocksmithsnewcastleunderlyme.co.uk` |  |
| 85 | Chesterfield | `keypulse-chesterfield-locksmiths.co.uk` |  |
| 86 | Burton upon Trent | `lockpulse-burtonontrent-locksmith.co.uk` | second site vs `burtonupontrent.steelok-locksmiths.co.uk` |
| 87 | Tamworth | `boltpulse-locksmith-tamworth.co.uk` | second site vs `tamworth.suresec-locksmiths.co.uk` |
| 88 | Woking | `latchpulse-locksmiths-woking.co.uk` | second site vs `woking.trulock-locksmiths.co.uk` |
| 89 | St Albans | `keyquest-stalbanslocksmiths.co.uk` | second site vs `stalbans.toplock-locksmiths.co.uk` |
| 90 | Harrogate | `lockquest-harrogatelocksmith.co.uk` |  |
| 91 | Crewe | `boltquest-locksmithcrewe.co.uk` |  |
| 92 | South Shields | `latchquest-locksmithssouthshields.co.uk` |  |
| 93 | Stafford | `keyrisestafford-locksmiths.co.uk` |  |
| 94 | Rotherham | `lockriserotherham-locksmith.co.uk` |  |
| 95 | Barnsley | `boltriselocksmith-barnsley.co.uk` |  |
| 96 | Walsall | `latchriselocksmiths-walsall.co.uk` |  |
| 97 | Dartford | `keyrootdartfordlocksmiths.co.uk` |  |
| 98 | Bognor Regis | `lockrootbognorregislocksmith.co.uk` |  |
| 99 | Corby | `boltrootlocksmithcorby.co.uk` |  |
| 100 | Maidenhead | `latchrootlocksmithsmaidenhead.co.uk` |  |
| 101 | Rochester | `keyroute-rochester-locksmiths.co.uk` |  |
| 102 | Ellesmere Port | `lockroute-ellesmereport-locksmith.co.uk` |  |
| 103 | Loughborough | `boltroute-locksmith-loughborough.co.uk` | second site vs `loughborough.surelok-locksmiths.co.uk` |
| 104 | Dudley | `latchroute-locksmiths-dudley.co.uk` |  |
| 105 | Dewsbury | `keyserve-dewsburylocksmiths.co.uk` |  |
| 106 | Mansfield | `lockserve-mansfieldlocksmith.co.uk` |  |
| 107 | Margate | `boltserve-locksmithmargate.co.uk` |  |
| 108 | Kettering | `latchserve-locksmithskettering.co.uk` |  |
| 109 | Cannock | `keysmartcannock-locksmiths.co.uk` |  |
| 110 | Sale | `locksmartsale-locksmith.co.uk` |  |
| 111 | Runcorn | `boltsmartlocksmith-runcorn.co.uk` | second site vs `runcorn.shield-locksmiths.co.uk` |
| 112 | Farnborough | `latchsmartlocksmiths-farnborough.co.uk` | second site vs `farnborough.shieldx-locksmiths.co.uk` |
| 113 | Tynemouth | `keysparktynemouthlocksmiths.co.uk` |  |
| 114 | Halesowen | `locksparkhalesowenlocksmith.co.uk` |  |
| 115 | Canterbury | `boltsparklocksmithcanterbury.co.uk` |  |
| 116 | Wokingham | `latchsparklocksmithswokingham.co.uk` |  |
| 117 | Horsham | `keyspot-horsham-locksmiths.co.uk` |  |
| 118 | Winchester | `lockspot-winchester-locksmith.co.uk` |  |
| 119 | Braintree | `boltspot-locksmith-braintree.co.uk` |  |
| 120 | Fareham | `latchspot-locksmiths-fareham.co.uk` |  |
| 121 | Chorley | `keysprint-chorleylocksmiths.co.uk` |  |
| 122 | Warwick | `locksprint-warwicklocksmith.co.uk` |  |
| 123 | Dover | `boltsprint-locksmithdover.co.uk` |  |
| 124 | Lichfield | `latchsprint-locksmithslichfield.co.uk` |  |
| 125 | Morley | `keysquadmorley-locksmiths.co.uk` |  |
| 126 | Stroud | `locksquadstroud-locksmith.co.uk` |  |

## B. Bundle hubs — 26 domains (bundle order, north → south)

| Bundle | Hub Domain | Subdomains |
|--------|-----------|------------|
| Bundle 01 - Wallsend & Area | `doorfix-locksmiths.co.uk` (already owned) | wallsend, whitley-bay, cramlington, ashington, longbenton, chester-le-street, hebburn |
| Bundle 02 - Durham & Area | `keyfix-locksmiths.co.uk` | durham, redcar, billingham, eston, newton-aycliffe, ingleby-barwick, thornaby-on-tees |
| Bundle 03 - Middleton & Area | `keylok-locksmiths.co.uk` | middleton, bamber-bridge, leyland, accrington, fulwood, nelson, darwen, penwortham |
| Bundle 04 - Keighley & Area | `keypro-locksmiths.co.uk` | keighley, chadderton, heywood, stalybridge, royton, ossett, bingley, bramley, dukinfield |
| Bundle 05 - Worksop & Area | `keysure-locksmiths.co.uk` | worksop, pontefract, beverley, cleethorpes, gainsborough, rothwell, goole, wickersley |
| Bundle 06 - Leigh & Area | `safelok-locksmiths.co.uk` | leigh, urmston, eccles, farnworth, ashton-in-makerfield, little-hulton, golborne, hindley, swinton |
| Bundle 07 - Bootle & Area | `securelok-locksmiths.co.uk` | bootle, crosby, kirkby, prescot, skelmersdale, newton-le-willows, orrell, formby, maghull |
| Bundle 08 - Ashton-under-Lyne & Area | `ironlok-locksmiths.co.uk` | ashton-under-lyne, denton, hyde, prestwich, stretford, droylsden, whitefield, reddish, old-trafford |
| Bundle 09 - Widnes & Area | `steelfix-locksmiths.co.uk` | widnes, altrincham, winsford, congleton, cheadle-hulme, brownhills, hazel-grove |
| Bundle 10 - Macclesfield & Area | `boltsafe-locksmiths.co.uk` | macclesfield, sutton-in-ashfield, rugeley, kirkby-in-ashfield, dronfield, ripley, buxton |
| Bundle 11 - Beeston & Area | `boltsure-locksmiths.co.uk` | beeston, ilkeston, long-eaton, swadlincote, heanor, clifton, coalville |
| Bundle 12 - Grantham & Area | `latchfix-locksmiths.co.uk` | grantham, wigston, spalding, melton-mowbray, wisbech, market-harborough, oadby, stamford |
| Bundle 13 - Kingswinford & Area | `latchlok-locksmiths.co.uk` | kingswinford, willenhall, tipton, bilston, brierley-hill, sedgley, wednesbury |
| Bundle 14 - Smethwick & Area | `durolok-locksmiths.co.uk` | smethwick, carlton, hinckley, oldbury, rowley-regis, bedworth, kenilworth |
| Bundle 15 - Kidderminster & Area | `primelok-locksmiths.co.uk` | kidderminster, stourbridge, evesham, stratford-upon-avon, droitwich-spa, quedgeley-and-hardwicke, stourport-on-severn |
| Bundle 16 - Wellingborough & Area | `truebolt-locksmiths.co.uk` | wellingborough, hitchin, dunstable, letchworth, st-neots, rushden, harpenden, kempston, biggleswade |
| Bundle 17 - Clacton-on-Sea & Area | `surebolt-locksmiths.co.uk` | clacton-on-sea, bury-st-edmunds, rayleigh, wickford, witham, felixstowe, sudbury, maldon, harwich |
| Bundle 18 - Banbury & Area | `boltright-locksmiths.co.uk` | banbury, bletchley, leighton-buzzard, newbury, bicester, didcot, thatcham |
| Bundle 19 - Brentwood & Area | `gatelok-locksmiths.co.uk` | brentwood, cheshunt, hatfield, bishops-stortford, hoddesdon, billericay, loughton, hertford, potters-bar |
| Bundle 20 - Camberley & Area | `guardlok-locksmiths.co.uk` | camberley, windsor, bushey, egham, rickmansworth, ascot, staines-upon-thames, berkhamsted, hazlemere |
| Bundle 21 - Yeovil & Area | `vaultlok-locksmiths.co.uk` | yeovil, christchurch, kingswood, fishponds, chippenham, yate, frome, portishead, clevedon |
| Bundle 22 - Folkestone & Area | `keyguard-locksmiths.co.uk` | folkestone, ramsgate, canvey-island, whitstable, deal, broadstairs, south-benfleet |
| Bundle 23 - West Molesey & Area | `lockguard-locksmiths.co.uk` | west-molesey, epsom, ewell, walton-on-thames, tadworth, epsom-downs, new-haw, west-byfleet, sheerwater |
| Bundle 24 - Royal Tunbridge Wells & Area | `boltguard-locksmiths.co.uk` | royal-tunbridge-wells, tonbridge, redhill, northfleet, horley, sevenoaks, larkfield, reigate, south-ockendon |
| Bundle 25 - Fleet & Area | `sureguard-locksmiths.co.uk` | fleet, chichester, woodley, ash-and-ash-vale, ryde, hedge-end, sandhurst |
| Bundle 26 - Haywards Heath & Area | `latchguard-locksmiths.co.uk` | haywards-heath, rustington, burgess-hill, seaford, hailsham, crowborough, portslade |