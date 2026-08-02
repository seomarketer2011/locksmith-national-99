import { slugify } from "./slugify";
import siteMeta from "../data/site-meta.json";

const SITE_URL = "https://{{domain}}";
const BUSINESS_NAME = "{{name}}";
const PHONE = "{{phone}}";
const ADDRESS = "{{address}}";
const LOCATION = "{{location}}";

// Service-page metadata for BreadcrumbList + Service schema. Map slug -> human label.
const SERVICE_LABELS = {
  "emergency-locksmith": "Emergency Locksmith",
  "locked-out": "Locked Out",
  "broken-key-removal": "Broken Key Removal",
  "burglar-repair-service": "Burglar Repair Service",
  "emergency-boarding-up": "Emergency Boarding Up",
  "lock-changes": "Lock Changes",
  "lock-repairs": "Lock Repairs",
  "door-lock-installation": "Door Lock Installation",
  "door-lock-replacement": "Door Lock Replacement",
  "door-repairs": "Door Repairs",
  "window-lock-repair-replacement": "Window Lock Repair & Replacement",
  "safe-installation": "Safe Installation",
  "safe-opening": "Safe Opening",
  "contact": "Contact",
  "privacy": "Privacy",
  "cookie": "Cookie Policy",
};

function localBusinessNode() {
  const meta = siteMeta || {};
  const node = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: BUSINESS_NAME,
    url: SITE_URL,
    telephone: PHONE,
    image: `${SITE_URL}/og.png`,
    priceRange: "££",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  };

  // geo coordinates (from Nominatim, via build-local-intel)
  if (meta.geo?.latitude && meta.geo?.longitude) {
    node.geo = {
      "@type": "GeoCoordinates",
      latitude: meta.geo.latitude,
      longitude: meta.geo.longitude,
    };
  }

  // areaServed: array of named Place nodes, plus the city as the parent Place
  const areas = Array.isArray(meta.all_areas) ? meta.all_areas : [];
  if (areas.length > 0) {
    node.areaServed = [
      { "@type": "City", name: LOCATION },
      ...areas.map(a => ({ "@type": "Place", name: a, containedInPlace: { "@type": "City", name: LOCATION } })),
    ];
  } else {
    node.areaServed = LOCATION;
  }

  // postcode coverage as service area metadata
  const postcodes = Array.isArray(meta.postcode_districts) ? meta.postcode_districts : [];
  if (postcodes.length > 0) {
    node.serviceArea = {
      "@type": "AdministrativeArea",
      name: `${LOCATION} postcode districts ${postcodes.join(", ")}`,
    };
  }

  // Prefer the structured address from site-meta.json (proper fields per Schema.org spec).
  // Falls back to the legacy comma-joined ADDRESS string when no structured data exists.
  if (siteMeta?.address?.street) {
    node.address = {
      "@type": "PostalAddress",
      streetAddress: siteMeta.address.street,
      addressLocality: siteMeta.address.city || LOCATION,
      postalCode: siteMeta.address.postcode,
      addressCountry: "GB",
    };
  } else if (ADDRESS) {
    node.address = {
      "@type": "PostalAddress",
      streetAddress: ADDRESS,
      addressLocality: LOCATION,
      addressCountry: "GB",
    };
  }
  return node;
}

function breadcrumbNode(url) {
  const path = (() => {
    try { return new URL(url).pathname; } catch { return String(url); }
  })();
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return null;  // homepage — no breadcrumb
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
  ];
  let acc = SITE_URL;
  segments.forEach((seg, i) => {
    acc += "/" + seg;
    const label = SERVICE_LABELS[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    items.push({ "@type": "ListItem", position: i + 2, name: label, item: acc + "/" });
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

function serviceNode(url) {
  const path = (() => {
    try { return new URL(url).pathname; } catch { return String(url); }
  })();
  const slug = path.split("/").filter(Boolean)[0];
  const label = SERVICE_LABELS[slug];
  if (!label || ["contact", "privacy", "cookie"].includes(slug)) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}${path}#service`,
    name: `${label} in ${LOCATION}`,
    serviceType: label,
    areaServed: { "@type": "City", name: LOCATION },
    provider: { "@id": `${SITE_URL}/#business` },
    url: `${SITE_URL}${path}`,
  };
}

function faqNode(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export default function jsonLDGenerator({ type, post, url, faqs }) {
  if (type === "post" && post) {
    const payload = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      headline: post.title,
      description: post.description,
      image: post.image?.src,
      author: {
        "@type": "Person",
        name: post.author,
        url: `${SITE_URL}/author/${slugify(post.author)}`,
      },
      datePublished: post.date,
    };
    return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
  }

  // Emit a graph of nodes: LocalBusiness, Service (if applicable), BreadcrumbList, FAQPage.
  const nodes = [localBusinessNode()];
  const svc = serviceNode(url); if (svc) nodes.push(svc);
  const bc = breadcrumbNode(url); if (bc) nodes.push(bc);
  const fq = faqNode(faqs); if (fq) nodes.push(fq);

  return nodes.map(n => `<script type="application/ld+json">${JSON.stringify(n)}</script>`).join("\n");
}
