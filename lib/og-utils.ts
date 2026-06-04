// Utility functions for Open Graph metadata and image generation

// ─── Location cleaning ────────────────────────────────────────────────────────

const USELESS_LOCATIONS = new Set([
  "other", "select location", "unknown", "n/a", "null", "undefined", "",
]);

// Ordered by priority: districts first, then suburbs/nearby towns.
// Matching is attempted in order so the first (most specific) match wins.
const LOCATION_CANDIDATES = [
  // Inner districts
  "Altstadt", "Lehel", "Maxvorstadt", "Schwabing", "Glockenbachviertel",
  "Ludwigsvorstadt", "Isarvorstadt", "Haidhausen", "Au",
  "Bogenhausen", "Neuhausen", "Nymphenburg", "Laim",
  "Sendling", "Giesing", "Harlaching", "Obergiesing", "Untergiesing",
  "Berg am Laim", "Ramersdorf", "Trudering", "Riem",
  "Milbertshofen", "Moosach", "Feldmoching", "Allach",
  "Solln", "Forstenried", "Großhadern", "Hadern",
  "Olympiadorf", "Olympiapark", "Schwabing-West", "Schwabing-Freimann",
  // Nearby towns
  "Freising", "Germering", "Dachau", "Unterschleißheim", "Garching",
  "Fürstenfeldbruck", "Starnberg", "Eching", "Oberschleißheim",
];

export function cleanLocation(
  location: string,
  title: string,
  description: string,
): string {
  const loc = (location ?? "").trim();
  if (loc && !USELESS_LOCATIONS.has(loc.toLowerCase())) return loc;

  // Scan title first (highest confidence), then description
  for (const source of [title, description]) {
    const lower = source.toLowerCase();
    for (const candidate of LOCATION_CANDIDATES) {
      if (lower.includes(candidate.toLowerCase())) return candidate;
    }
  }

  return "Munich";
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatRent(rent: number | null | undefined): string {
  if (!rent) return "";
  return `€${rent.toLocaleString("de-DE")}/mo`;
}

export function formatAvailableFrom(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function monthsBetween(from: Date, until: Date): number {
  return (
    (until.getFullYear() - from.getFullYear()) * 12 +
    (until.getMonth() - from.getMonth())
  );
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

function textContains(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

// ─── Badge extraction ─────────────────────────────────────────────────────────

export type Badge = { label: string; key: string };

export function extractBadges(listing: {
  available_from: string | null;
  available_until: string | null;
  description: string | null;
  title: string | null;
}): Badge[] {
  const badges: Badge[] = [];
  const searchText = `${listing.title ?? ""} ${listing.description ?? ""}`;

  // Room size — patterns: "12 m²", "12m2", "12 qm", "12sqm"
  const sizeMatch = searchText.match(/(\d{1,3})\s*(?:m²|m2|qm|sqm)/i);
  if (sizeMatch) {
    badges.push({ label: `${sizeMatch[1]} m²`, key: "size" });
  }

  // Furnished — only explicit mentions
  if (
    textContains(searchText, [
      "furnished", "möbliert", "möbliertes", "möbliertem", "möblierte",
    ])
  ) {
    badges.push({ label: "Furnished", key: "furnished" });
  }

  // Anmeldung — only explicit phrases
  if (
    textContains(searchText, [
      "anmeldung möglich", "anmeldung possible", "registration possible",
      "anmeldung: ja", "anmeldung:ja", "anmeldung: yes",
    ])
  ) {
    badges.push({ label: "Anmeldung ok", key: "anmeldung" });
  }

  // Available from
  if (listing.available_from) {
    const fromDate = new Date(listing.available_from);
    const now = new Date();
    if (fromDate <= now) {
      badges.push({ label: "Available now", key: "from" });
    } else {
      badges.push({
        label: `From ${formatAvailableFrom(listing.available_from)}`,
        key: "from",
      });
    }
  }

  // Duration badge:
  // - "Short term" only if both dates exist and span ≤ 4 months
  // - "Long term" only if both dates exist and span ≥ 12 months,
  //   OR if the listing explicitly says so in text
  // - No duration badge when available_until is blank (open-ended is implied)
  if (listing.available_from && listing.available_until) {
    const from = new Date(listing.available_from);
    const until = new Date(listing.available_until);
    const months = monthsBetween(from, until);
    if (months <= 4) {
      badges.push({ label: "Short term", key: "term" });
    } else if (months >= 12) {
      badges.push({ label: "Long term", key: "term" });
    }
  } else if (
    textContains(searchText, [
      "long term", "langfristig", "unbefristet", "long-term",
    ])
  ) {
    badges.push({ label: "Long term", key: "term" });
  }
  // No duration badge when available_until is simply absent — avoid assuming.

  // Gender preference — only when explicitly stated
  if (
    textContains(searchText, [
      "female wg", "women only", "nur frauen", "girls wg", "mädchen wg",
      "only women", "female only",
    ])
  ) {
    badges.push({ label: "Female WG", key: "gender" });
  } else if (
    textContains(searchText, [
      "male wg", "men only", "nur männer", "only men", "male only",
    ])
  ) {
    badges.push({ label: "Male WG", key: "gender" });
  }

  // Transport — strict: only explicit station/line mentions
  if (
    textContains(searchText, [
      "u-bahn", "ubahn", "u bahn",
      "s-bahn", "sbahn", "s bahn",
      "subway", "metro",
      "tram", "straßenbahn",
      "bus stop", "busstation", "bushaltestelle",
    ])
  ) {
    badges.push({ label: "Near U/S-Bahn", key: "transport" });
  }

  // Deduplicate by key, cap at 4 total
  const seen = new Set<string>();
  const unique: Badge[] = [];
  for (const b of badges) {
    if (!seen.has(b.key)) {
      seen.add(b.key);
      unique.push(b);
    }
  }
  return unique.slice(0, 4);
}

// ─── OG title ─────────────────────────────────────────────────────────────────

export function generateOgTitle(listing: {
  title: string | null;
  rent: number | null;
  location: string | null;
  description: string | null;
}): string {
  const title = (listing.title ?? "").trim();
  const location = cleanLocation(
    listing.location ?? "",
    title,
    listing.description ?? "",
  );
  const rentStr = listing.rent
    ? `€${listing.rent.toLocaleString("de-DE")}`
    : null;

  // Build the cleanest possible title
  if (rentStr && title && title.length <= 50) {
    return `${rentStr} ${title} | RoomRush`;
  }
  if (rentStr && location) {
    return `${rentStr} Room in ${location} | RoomRush`;
  }
  if (title) {
    return `${title} | RoomRush Munich`;
  }
  return "Room Available | RoomRush Munich";
}

// ─── OG description ───────────────────────────────────────────────────────────

export function generateOgDescription(listing: {
  title: string | null;
  rent: number | null;
  location: string | null;
  available_from: string | null;
  available_until: string | null;
  description: string | null;
}): string {
  const title = listing.title ?? "";
  const description = listing.description ?? "";
  const location = cleanLocation(listing.location ?? "", title, description);
  const searchText = `${title} ${description}`;

  const isFurnished = textContains(searchText, [
    "furnished", "möbliert", "möbliertes", "möblierte", "möbliertem",
  ]);
  const roomWord = isFurnished ? "Furnished room" : "Room";

  const parts: string[] = [];

  parts.push(`${roomWord} in ${location}.`);

  if (listing.available_from) {
    const fromDate = new Date(listing.available_from);
    if (fromDate <= new Date()) {
      parts.push("Available now.");
    } else {
      parts.push(`Available from ${formatAvailableFrom(listing.available_from)}.`);
    }
  }

  // Deliberate CTA wording — never "contact the lister on RoomRush"
  parts.push("View photos, rent details and contact options on RoomRush.");

  return parts.join(" ");
}
