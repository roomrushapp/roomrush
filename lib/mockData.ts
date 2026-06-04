// Utility helpers — kept here for backwards compatibility

/**
 * Format a move-in date for display.
 * Handles both YYYY-MM values (from <input type="month">) and legacy free-text.
 */
export function formatMoveInDate(value: string): string {
  if (!value) return "";
  // YYYY-MM from <input type="month">
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, 1);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return value; // e.g. "ASAP", "flexible", "From August"
}

/**
 * Resolve the primary display photo for a Room Seeker profile.
 * Prefers the first URL from photo_urls (v2), falls back to photo_url (v1 legacy), then null.
 */
export function resolveMainSeekerPhoto(
  photoUrls: string[] | null | undefined,
  photoUrl: string | null | undefined
): string | null {
  if (Array.isArray(photoUrls) && photoUrls.length > 0) return photoUrls[0];
  if (photoUrl) return photoUrl;
  return null;
}
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
