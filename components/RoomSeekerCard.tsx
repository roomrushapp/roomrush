import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import type { RoomSeekerProfile } from "@/types";
import { contactHref } from "@/lib/contactHelpers";

type Props = {
  profile: RoomSeekerProfile;
};

export default function RoomSeekerCard({ profile }: Props) {
  const href = contactHref(profile.contact_method, profile.contact_value);

  return (
    <div className="bg-white border border-zinc-200 overflow-hidden hover:border-zinc-400 transition-colors flex flex-col">
      {/* Avatar */}
      <div className="relative w-full aspect-[4/3] bg-zinc-100 overflow-hidden flex items-center justify-center">
        {profile.photo_url ? (
          <Image
            src={profile.photo_url}
            alt={profile.name}
            fill
            unoptimized
            loading="lazy"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-100">
            <div className="w-20 h-20 rounded-full bg-zinc-200 flex items-center justify-center">
              <span className="font-display font-bold text-3xl text-zinc-400">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        {/* Seeking badge */}
        <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-medium px-2 py-1 uppercase tracking-wide">
          Seeking
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-semibold text-base leading-snug text-black">
            {profile.name}
          </h3>
          <p className="font-display font-bold text-rose-600 text-base whitespace-nowrap">
            {profile.budget}
          </p>
        </div>

        <div className="flex items-center gap-1 text-zinc-500 text-xs mb-1">
          <Calendar size={12} />
          <span>From {profile.move_in_date}</span>
        </div>

        <div className="flex items-center gap-1 text-zinc-500 text-xs mb-3">
          <MapPin size={12} />
          <span>{profile.preferred_area}</span>
        </div>

        <p className="text-zinc-600 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
          &ldquo;{profile.short_intro}&rdquo;
        </p>

        <div className="flex items-center gap-2 mt-auto border-t border-zinc-100 pt-3">
          <Link
            href={`/room-seekers/${profile.id}`}
            className="flex-1 flex items-center justify-center gap-1 border border-zinc-300 hover:border-zinc-500 text-zinc-700 hover:text-black text-xs px-3 py-2 transition-colors font-medium"
          >
            View profile
            <ArrowRight size={12} />
          </Link>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-2 transition-colors font-medium"
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}
