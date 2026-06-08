"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, Calendar, Wallet } from "lucide-react";
import type { RoomSeekerProfile } from "@/types";
import { contactHref, contactButtonLabel } from "@/lib/contactHelpers";
import { resolveMainSeekerPhoto, formatMoveInDate } from "@/lib/mockData";

type Props = {
  profile: RoomSeekerProfile;
};

function formatBudget(raw: string): string {
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) return `€${trimmed}`;
  if (/^\d/.test(trimmed) && !trimmed.startsWith("€")) return `€${trimmed}`;
  return trimmed;
}

export default function RoomSeekerCard({ profile }: Props) {
  const router = useRouter();
  const href = contactHref(profile.contact_method, profile.contact_value);
  const btnLabel = contactButtonLabel(profile.contact_method);
  const mainPhoto = resolveMainSeekerPhoto(profile.photo_urls, profile.photo_url);
  const profileUrl = `/room-seekers/${profile.id}`;

  const displayName = profile.age
    ? `${profile.name}, ${profile.age}`
    : profile.name;

  return (
    <div
      role="article"
      onClick={() => router.push(profileUrl)}
      className="rounded-2xl overflow-hidden flex flex-col w-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/50 active:scale-[0.98]"
      style={{
        background: "#1c1c1f",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.18)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      {/* Photo / avatar strip */}
      <div className="relative w-full aspect-[3/2] overflow-hidden flex items-center justify-center" style={{ background: "#2a2a2e" }}>
        {mainPhoto ? (
          <Image
            src={mainPhoto}
            alt={profile.name}
            fill
            unoptimized
            loading="lazy"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e1e22, #2a2a30)" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="font-display font-bold text-4xl text-white/70">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full tracking-wide">
          Looking for a room
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Name */}
        <h3 className="font-display font-bold text-lg leading-snug text-white mb-3">
          {displayName}
        </h3>

        {/* Key details */}
        <div className="flex flex-col gap-2 mb-4">
          {profile.move_in_date && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Calendar size={13} className="text-rose-500 shrink-0" />
              <span>Move in: <span className="text-zinc-200 font-medium">{formatMoveInDate(profile.move_in_date)}</span></span>
            </div>
          )}
          {profile.budget && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Wallet size={13} className="text-rose-500 shrink-0" />
              <span>Budget: <span className="text-zinc-200 font-medium">{formatBudget(profile.budget)}</span></span>
            </div>
          )}
          {profile.preferred_area && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <MapPin size={13} className="text-rose-500 shrink-0" />
              <span className="text-zinc-200 font-medium truncate">{profile.preferred_area}</span>
            </div>
          )}
        </div>

        {/* Intro quote */}
        {profile.short_intro && (
          <p
            className="text-zinc-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-4 italic"
            style={{ borderLeft: "2px solid rgba(244,63,94,0.3)", paddingLeft: "10px" }}
          >
            &ldquo;{profile.short_intro}&rdquo;
          </p>
        )}

        {/* Buttons */}
        <div
          className="flex items-center gap-2 pt-4 mt-auto"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Link
            href={profileUrl}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 text-zinc-300 hover:text-white text-sm px-3 py-2.5 rounded-xl font-medium transition-all active:scale-[0.97]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            View profile
            <ArrowRight size={12} />
          </Link>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center bg-rose-600 hover:bg-rose-500 text-white text-sm px-3 py-2.5 rounded-xl transition-all active:scale-[0.97] font-medium truncate"
            title={btnLabel}
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}
