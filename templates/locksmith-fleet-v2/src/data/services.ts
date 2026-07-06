// The 13 fleet services. Slugs are the network-wide canonical page routes and
// must match the enriched.json key prefixes produced by enrich-site.mjs.
export type Service = {
  slug: string;
  name: string;
  short: string;
  image: string; // filename inside src/assets/services/
};

export const SERVICES: Service[] = [
  { slug: "emergency-locksmith", name: "Emergency Locksmith", short: "Round-the-clock call-out for urgent lock and door problems.", image: "emergnecy boarding.png" },
  { slug: "locked-out", name: "Locked Out", short: "Careful, non-destructive entry when keys are lost or left inside.", image: "Locked out of house image.png" },
  { slug: "broken-key-removal", name: "Broken Key Removal", short: "Snapped keys extracted without damaging the lock.", image: "broken key in euro lock.png" },
  { slug: "burglar-repair-service", name: "Burglar Repair Service", short: "Doors and locks made safe and restored after a break-in.", image: "burglar repairs.png" },
  { slug: "emergency-boarding-up", name: "Emergency Boarding Up", short: "Temporary boarding to secure damaged doors and windows.", image: "Emergency boarding up.png" },
  { slug: "lock-changes", name: "Lock Changes", short: "Fresh locks and full key control after moving or losing keys.", image: "Broken lock repair.png" },
  { slug: "lock-repairs", name: "Lock Repairs", short: "Stiff, worn or failing locks diagnosed and put right.", image: "Broken lock repair.png" },
  { slug: "door-lock-installation", name: "Door Lock Installation", short: "New locks specified and fitted to insurance standards.", image: "Door lock installation 1.png" },
  { slug: "door-lock-replacement", name: "Door Lock Replacement", short: "Like-for-like swaps and security upgrades for tired hardware.", image: "door handle repair.png" },
  { slug: "door-repairs", name: "Door Repairs", short: "Alignment, hinges and frames corrected so doors lock properly.", image: "door repairs.png" },
  { slug: "window-lock-repair-replacement", name: "Window Lock Repair & Replacement", short: "Window locks and handles repaired or upgraded.", image: "window lock repair.png" },
  { slug: "safe-installation", name: "Safe Installation", short: "Home and business safes positioned and anchored properly.", image: "Safe installation.png" },
  { slug: "safe-opening", name: "Safe Opening", short: "Locked safes opened with proof of ownership, damage kept minimal.", image: "Safe opening.png" },
];
