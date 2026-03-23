import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/server";
import { MapPin, Calendar, ArrowLeft, Phone, Mail } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-black mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to listings
      </Link>

      {/* Image gallery */}
      <div className="grid grid-cols-3 gap-2 mb-8 h-72 md:h-96 overflow-hidden">
        <div className="col-span-2 relative">
          {listing.image_urls?.[0] ? (
            <Image src={listing.image_urls[0]} alt={listing.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 66vw" />
          ) : (
            <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">No photos yet</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {[listing.image_urls?.[1], listing.image_urls?.[2]].map((img, i) =>
            img ? (
              <div key={i} className="relative flex-1">
                <Image src={img} alt={`${listing.title} photo ${i + 2}`} fill className="object-cover" sizes="33vw" />
              </div>
            ) : (
              <div key={i} className="flex-1 bg-zinc-100" />
            )
          )}
        </div>
      </div>

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

            <div className="flex flex-col gap-3">
              {/* Email — always present */}
              <a href={`mailto:${listing.contact_email}`}
                className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 font-medium text-sm transition-colors w-full">
                <Mail size={16} />
                Contact via email
              </a>

              {/* Phone / WhatsApp — optional */}
              {listing.phone && (
                <>
                  <a href={`https://wa.me/${listing.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 font-medium text-sm transition-colors w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Message on WhatsApp
                  </a>
                  <a href={`tel:${listing.phone}`}
                    className="flex items-center justify-center gap-2 border border-zinc-300 hover:border-zinc-500 text-zinc-700 px-4 py-3 font-medium text-sm transition-colors w-full">
                    <Phone size={16} />
                    {listing.phone}
                  </a>
                </>
              )}
            </div>

            <p className="text-xs text-zinc-300 text-center mt-4 leading-relaxed">
              RoomRush only displays listings and is not responsible for agreements between users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
