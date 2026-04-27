import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://getroomrush.de";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("id, slug, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const listingUrls: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
    url: l.slug
      ? `${BASE_URL}/sublet/${l.slug}`
      : `${BASE_URL}/listings/${l.id}`,
    lastModified: new Date(l.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...listingUrls,
  ];
}
