import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types";
import { timeAgo, formatDate } from "@/lib/mockData";
import { MapPin, Calendar, Eye } from "lucide-react";

type Props = {
  listing: Listing;
};

export default function ListingCard({ listing }: Props) {
  const thumbnail = listing.image_urls?.[0] ?? null;

  return (
    <Link href={listing.slug ? `/sublet/${listing.slug}` : `/listings/${listing.id}`} className="group block">
      <div className="bg-white border border-zinc-200 overflow-hidden hover:border-zinc-400 transition-colors">
        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-zinc-100 overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={listing.title}
              fill
              unoptimized
              loading="lazy"
              decoding="async"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
              No photo
            </div>
          )}

          {/* Location badge */}
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-medium px-2 py-1 uppercase tracking-wide">
            {listing.location}
          </span>

          {/* Views pill */}
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            <Eye size={11} />
            {listing.views_count ?? 0}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-semibold text-base leading-snug text-black group-hover:text-rose-600 transition-colors line-clamp-2">
              {listing.title}
            </h3>
            <p className="font-display font-bold text-rose-600 text-base whitespace-nowrap">
              €{listing.rent.toLocaleString()}
              <span className="text-xs text-zinc-400 font-normal">/mo</span>
            </p>
          </div>

          {listing.available_from && (
            <div className="flex items-center gap-1 text-zinc-500 text-xs mb-2">
              <Calendar size={12} />
              <span>
                {formatDate(listing.available_from)}
                {listing.available_until ? ` – ${formatDate(listing.available_until)}` : ""}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-1">
              <MapPin size={11} />
              <span>{listing.location}, Munich</span>
            </div>
            <span>{timeAgo(listing.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
