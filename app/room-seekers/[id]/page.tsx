import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Pencil, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { RoomSeekerProfile } from "@/types";
import { contactHref, contactButtonLabel } from "@/lib/contactHelpers";
import { resolveMainSeekerPhoto, formatMoveInDate } from "@/lib/mockData";
import ProfileGallery from "@/components/ProfileGallery";

type Props = {
  params: Promise<{ id: string }>;
};

function formatBudget(raw: string): string {
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) return `€${trimmed}`;
  if (/^\d/.test(trimmed) && !trimmed.startsWith("€")) return `€${trimmed}`;
  return trimmed;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("room_seeker_profiles")
    .select("name, preferred_area, budget")
    .eq("id", id)
    .maybeSingle();

  if (!data) return { title: "Room Seeker | RoomRush" };
  return {
    title: `${data.name} – Room Seeker in ${data.preferred_area} | RoomRush`,
    description: `${data.name} is looking for a room. Budget: ${data.budget}. Area: ${data.preferred_area}.`,
  };
}

export default async function RoomSeekerProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("room_seeker_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const profile = data as RoomSeekerProfile | null;
  if (!profile) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.user_id;

  const href = contactHref(profile.contact_method, profile.contact_value);
  const btnLabel = contactButtonLabel(profile.contact_method);

  const allPhotos: string[] = Array.isArray(profile.photo_urls) && profile.photo_urls.length > 0
    ? profile.photo_urls
    : profile.photo_url
      ? [profile.photo_url]
      : [];

  const displayName = profile.age
    ? `${profile.name}, ${profile.age}`
    : profile.name;

  return (
    <div className="flex-1" style={{ background: "#111113" }}>
      <div className="max-w-xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Back + owner controls */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/room-seekers"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft size={14} />
            Room Seekers
          </Link>
          {isOwner && (
            <Link
              href="/room-seekers/edit"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil size={12} />
              Edit profile
            </Link>
          )}
        </div>

        {/* Profile card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#1c1c1f", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Photo gallery or avatar */}
          {allPhotos.length > 0 ? (
            <ProfileGallery photos={allPhotos} name={profile.name} />
          ) : (
            <div className="relative flex items-center justify-center py-14" style={{ background: "linear-gradient(135deg, #1e1e22, #2a2a30)" }}>
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.12)" }}
              >
                <span className="font-display font-bold text-5xl text-white/70">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full tracking-wide">
                Looking for a room
              </span>
            </div>
          )}

          {/* Inactive notice */}
          {!profile.is_active && (
            <div className="px-4 py-2 text-center" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Profile inactive
              </span>
            </div>
          )}

          {/* Content */}
          <div className="px-6 pt-6 pb-8 sm:px-8">
            <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest mb-4">
              Room search profile on RoomRush
            </p>

            <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-5">
              {displayName}
            </h1>

            <div className="flex flex-col gap-3 mb-6">
              {profile.move_in_date && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-400">
                  <Calendar size={15} className="text-rose-500 shrink-0" />
                  <span>
                    Move in:{" "}
                    <strong className="text-zinc-100 font-medium">
                      {formatMoveInDate(profile.move_in_date)}
                    </strong>
                  </span>
                </div>
              )}
              {profile.preferred_area && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-400">
                  <MapPin size={15} className="text-rose-500 shrink-0" />
                  <span>
                    Area:{" "}
                    <strong className="text-zinc-100 font-medium">{profile.preferred_area}</strong>
                  </span>
                </div>
              )}
              {profile.budget && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-400">
                  <Wallet size={15} className="text-rose-500 shrink-0" />
                  <span>
                    Budget:{" "}
                    <strong className="text-zinc-100 font-medium">{formatBudget(profile.budget)}</strong>
                  </span>
                </div>
              )}
            </div>

            {profile.short_intro && (
              <div
                className="px-4 py-4 mb-6 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap italic">
                  &ldquo;{profile.short_intro}&rdquo;
                </p>
              </div>
            )}

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors w-full"
            >
              {btnLabel}
            </a>

            <p className="text-xs text-zinc-600 mt-3 text-center">
              Contact info is provided by the room seeker and visible on their public profile.
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div
          className="mt-6 px-5 py-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{ background: "#1c1c1f", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-sm text-zinc-400">
            Also looking for a room?{" "}
            <span className="font-medium text-zinc-200">Create your RoomRush profile.</span>
          </p>
          <Link
            href="/room-seekers/create"
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            Get started
          </Link>
        </div>
      </div>
    </div>
  );
}
