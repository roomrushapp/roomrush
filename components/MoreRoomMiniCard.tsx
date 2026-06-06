import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatDate } from "@/lib/mockData";

type Props = {
  id: string;
  slug: string | null;
  title: string;
  rent: number;
  location: string;
  available_from: string | null;
  image_urls: string[] | null;
};

export default function MoreRoomMiniCard({
  id,
  slug,
  title,
  rent,
  location,
  available_from,
  image_urls,
}: Props) {
  const href = slug ? `/sublet/${slug}` : `/listings/${id}`;
  const thumbnail = image_urls?.[0] ?? null;

  return (
    <Link href={href} className="group block min-w-0">
      <div className="border border-zinc-200 overflow-hidden hover:border-zinc-400 transition-colors bg-white min-w-0">
        {/* Thumbnail */}
        <div className="relative w-full aspect-[4/3] bg-zinc-100 overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              unoptimized
              loading="lazy"
              className="object-cover w-full max-w-full group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 78vw, 300px"
            />
          ) : (
            <div className="absolute inset-0 bg-zinc-200 flex items-center justify-center">
              <span className="text-xs text-zinc-400">No photo</span>
            </div>
          )}
          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-medium px-1.5 py-0.5 uppercase tracking-wide leading-none">
            {location}
          </span>
        </div>

        {/* Content */}
        <div className="p-3 min-w-0">
          <p className="font-display font-bold text-rose-600 text-sm mb-1">
            €{rent.toLocaleString()}<span className="text-xs text-zinc-400 font-normal">/mo</span>
          </p>
          <p className="text-sm font-medium text-black leading-snug line-clamp-2 min-w-0 break-words">
            {title}
          </p>
          {available_from && (
            <p className="text-xs text-zinc-400 mt-1.5 truncate">
              From {formatDate(available_from)}
            </p>
          )}
          <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
            <MapPin size={10} />
            <span className="truncate">{location}, Munich</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
