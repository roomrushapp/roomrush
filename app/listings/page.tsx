import { createClient } from "@/lib/supabase/server";
import ListingsSection from "@/components/ListingsSection";
import type { Listing } from "@/types";

export const metadata = {
  title: "Rooms for Rent in Munich | RoomRush",
  description: "Browse active sublets, WGs, and furnished rooms in Munich. Direct contact, no noise.",
};

export default async function ListingsPage() {
  const supabase = await createClient();
  // Only the columns the listing cards/filters need — never contact data or user_id
  const { data } = await supabase
    .from("listings")
    .select(
      "id, slug, title, rent, location, available_from, available_until, image_urls, views_count, created_at"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const listings: Listing[] = data ?? [];

  return <ListingsSection initialListings={listings} />;
}
