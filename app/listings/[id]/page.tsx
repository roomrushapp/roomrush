import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatDate } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MapPin, Calendar, ArrowLeft, Eye, Users } from "lucide-react";
import ImageLightbox from "@/components/ImageLightbox";
import ShareButtons from "@/components/ShareButtons";
import ContactButtons from "@/components/ContactButtons";
import ViewTracker from "@/components/ViewTracker";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("title, description, image_urls, location, rent")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!listing) {
    return { title: "Listing not found | RoomRush Munich" };
  }

  const title = `${listing.title} – €${listing.rent}/mo · ${listing.location} | RoomRush Munich`;
  const rawDesc = listing.description ?? "";
  const description =
    rawDesc.length > 140 ? rawDesc.slice(0, 137).trimEnd() + "…" : rawDesc;
  const image = listing.image_urls?.[0] ?? null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image && { images: [{ url: image, width: 1200, height: 800, alt: listing.title }] }),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!listing) notFound();

  const { count: contactedCount } = await createAdminClient()
    .from("listing_events")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", id)
    .in("event_type", ["contact_email", "contact_whatsapp", "contact_phone", "facebook_click"]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ViewTracker listingId={listing.id} />
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-black mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to listings
      </Link>

      {/* Image gallery */}
      <ImageLightbox images={listing.image_urls} title={listing.title} />

      {/* Two-column layout */}
      <div className="grid md:grid-cols-3 gap-10">
        {/* Left: content */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-rose-600 text-white text-xs font-medium px-3 py-1 uppercase tracking-wide">
              {listing.location}
            </span>
            {listing.available_from && (
              <div className="flex items-center gap-1 text-sm text-zinc-500">
                <Calendar size={14} />
                <span>
                  {formatDate(listing.available_from)}
                  {listing.available_until ? ` – ${formatDate(listing.available_until)}` : " (open end)"}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-zinc-500">
              <MapPin size={14} />
              <span>{listing.location}, Munich</span>
            </div>
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-black leading-tight mb-6">
            {listing.title}
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 p-4 bg-zinc-50 border border-zinc-200">
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Rent / month</p>
              <p className="font-display font-bold text-2xl text-rose-600">€{listing.rent.toLocaleString()}</p>
            </div>
            {listing.available_from && (
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Available from</p>
                <p className="font-semibold text-black">{formatDate(listing.available_from)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Available until</p>
              <p className="font-semibold text-black">
                {listing.available_until ? formatDate(listing.available_until) : "Open end"}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Eye size={12} className="text-zinc-400" />
                <p className="text-xs text-zinc-400 uppercase tracking-wide">Views</p>
              </div>
              <p className="font-display font-semibold text-xl text-zinc-800">{listing.views_count ?? 0}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Users size={12} className="text-zinc-400" />
                <p className="text-xs text-zinc-400 uppercase tracking-wide">Contact clicks</p>
              </div>
              <p className="font-display font-semibold text-xl text-zinc-800">{contactedCount ?? 0}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="font-display font-bold text-lg mb-3">About this space</h2>
            <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>
        </div>

        {/* Right: contact */}
        <div className="md:col-span-1">
          <div className="sticky top-20 border border-zinc-200 p-6">
            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Interested?</p>
            <p className="text-sm text-zinc-600 mb-6">
              Contact the host directly. All agreements are made outside this platform.
            </p>

            <div className="bg-zinc-50 p-4 mb-6 text-center">
              <p className="font-display font-bold text-3xl text-rose-600">€{listing.rent.toLocaleString()}</p>
              <p className="text-xs text-zinc-400">per month</p>
            </div>

            <ContactButtons
              listing_id={listing.id}
              contact_email={listing.contact_email}
              phone={listing.phone}
              facebook_url={listing.facebook_url}
            />

            <ShareButtons listing_id={listing.id} />

            <p className="text-xs text-zinc-300 text-center mt-4 leading-relaxed">
              RoomRush only displays listings and is not responsible for agreements between users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
