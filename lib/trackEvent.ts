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
  | (typeof SHARE_EVENT_TYPES)[number]
  | "contact_unique";

export async function trackEvent(listing_id: string, event_type: EventType) {
  const supabase = createClient();
  const { error } = await supabase.from("listing_events").insert({ listing_id, event_type });
  if (error) console.error("[trackEvent] failed:", error.message, { listing_id, event_type });
}

const LS_CONTACT_PREFIX = "roomrush_contacted_listing_";

/**
 * Fires the raw contact event, then fires contact_unique once per browser per listing.
 * localStorage is only written after a successful contact_unique insert, so a failed
 * insert can be retried on the next contact click rather than being silently lost.
 * Navigation to the contact URL always proceeds regardless of analytics outcome.
 */
export async function trackContact(listing_id: string, event_type: (typeof CONTACT_EVENT_TYPES)[number]) {
  // Raw event — always fire, every click.
  await trackEvent(listing_id, event_type);

  try {
    const key = `${LS_CONTACT_PREFIX}${listing_id}`;
    if (!localStorage.getItem(key)) {
      const supabase = createClient();
      const { error } = await supabase
        .from("listing_events")
        .insert({ listing_id, event_type: "contact_unique" });
      if (error) {
        console.error("[trackContact] contact_unique insert failed:", error.message);
        // Do NOT set localStorage — allow retry on next click.
        return;
      }
      // Only mark as counted after confirmed DB insert.
      localStorage.setItem(key, String(Date.now()));
    }
  } catch {
    // localStorage unavailable (e.g. strict private browsing) — skip silently.
  }
}
