import { createClient } from "@/lib/supabase/client";

// All event types that represent a user contacting a lister, including legacy names
// (contact_click, facebook_click) kept for historical row coverage.
export const CONTACT_EVENT_TYPES = [
  "contact_email",
  "contact_whatsapp",
  "contact_phone",
  "contact_facebook",
  "facebook_click", // legacy name used before contact_facebook was introduced
  "contact_click",  // legacy generic Facebook fallback
] as const;

const SHARE_EVENT_TYPES = ["share_copy", "share_whatsapp", "share_telegram"] as const;

export type EventType =
  | (typeof CONTACT_EVENT_TYPES)[number]
  | (typeof SHARE_EVENT_TYPES)[number];

export async function trackEvent(listing_id: string, event_type: EventType) {
  const supabase = createClient();
  const { error } = await supabase.from("listing_events").insert({ listing_id, event_type });
  if (error) console.error("[trackEvent] failed:", error.message, { listing_id, event_type });
}
