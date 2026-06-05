import { createClient } from "@/lib/supabase/server";
import ListingsSection from "@/components/ListingsSection";
import type { Listing } from "@/types";

export const metadata = {
  title: "Rooms for Rent in Munich | RoomRush",
  description: "Browse active sublets, WGs, and furnished rooms in Munich. Direct contact, no noise.",
};

export default async function ListingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const listings: Listing[] = data ?? [];

  return <ListingsSection initialListings={listings} />;
}
