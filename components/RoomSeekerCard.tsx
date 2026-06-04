import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import type { RoomSeekerProfile } from "@/types";
import { contactHref, contactButtonLabel } from "@/lib/contactHelpers";

type Props = {
  profile: RoomSeekerProfile;
};

export default function RoomSeekerCard({ profile }: Props) {
  const href = contactHref(profile.contact_method, profile.contact_value);
  const btnLabel = contactButtonLabel(profile.contact_method);

  return (
    <div className="bg-white border border-zinc-200 overflow-hidden hover:border-zinc-400 transition-colors flex flex-col">
      {/* Avatar / photo strip */}
      <div className="relative w-full aspect-[3/2] bg-zinc-100 overflow-hidden flex items-center justify-center">
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <span className="font-display font-bold text-3xl text-white/80">
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
        {/* Name */}
        <h3 className="font-display font-semibold text-base leading-snug text-black mb-1">
          {profile.name}
        </h3>

        {/* Move-in + budget on one line */}
        <p className="text-zinc-500 text-xs mb-2">
          Looking from {profile.move_in_date}
          <span className="mx-1.5 text-zinc-300">·</span>
          {profile.budget}
        </p>

        {/* Area */}
        <div className="flex items-center gap-1 text-zinc-400 text-xs mb-3">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{profile.preferred_area}</span>
        </div>

        {/* Intro preview */}
        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-4 italic">
          &ldquo;{profile.short_intro}&rdquo;
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-2 border-t border-zinc-100 pt-3 mt-auto">
          <Link
            href={`/room-seekers/${profile.id}`}
            className="flex-1 flex items-center justify-center gap-1 border border-zinc-200 hover:border-zinc-400 text-zinc-600 hover:text-black text-xs px-3 py-2 transition-colors font-medium"
          >
            View profile
            <ArrowRight size={11} />
          </Link>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-2 transition-colors font-medium truncate"
            title={btnLabel}
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}
