import { createClient } from "@/lib/supabase/client";

export type EventType =
  | "contact_click"
  | "contact_email"
  | "contact_whatsapp"
  | "contact_phone"
  | "share_copy"
  | "share_whatsapp"
  | "share_telegram";

export async function trackEvent(listing_id: string, event_type: EventType) {
  const supabase = createClient();
  const { error } = await supabase.from("listing_events").insert({ listing_id, event_type });
  if (error) console.error("[trackEvent] failed:", error.message, { listing_id, event_type });
}
