import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { RoomSeekerProfile } from "@/types";
import { contactHref, contactButtonLabel } from "@/lib/contactHelpers";

type Props = {
  params: Promise<{ id: string }>;
};

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

  // Check if the viewer is the profile owner
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.user_id;

  const href = contactHref(profile.contact_method, profile.contact_value);
  const btnLabel = contactButtonLabel(profile.contact_method);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">

      {/* Back + owner controls */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/room-seekers"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} />
          Room Seekers
        </Link>
        {isOwner && (
          <Link
            href="/room-seekers/edit"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black border border-zinc-300 hover:border-zinc-500 px-3 py-1.5 transition-colors"
          >
            <Pencil size={12} />
            Edit profile
          </Link>
        )}
      </div>

      {/* Profile card */}
      <div className="bg-white border border-zinc-200 overflow-hidden">

        {/* Avatar section */}
        <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center py-10">
          {profile.photo_url ? (
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white/20">
              <Image
                src={profile.photo_url}
                alt={profile.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
              <span className="font-display font-bold text-5xl text-white/80">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Seeking pill */}
          <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-medium px-2 py-1 uppercase tracking-wide">
            Seeking
          </span>

          {/* Inactive overlay */}
          {!profile.is_active && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-white text-zinc-700 text-xs font-semibold px-3 py-1.5 uppercase tracking-wide">
                Profile inactive
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-8 sm:px-8">
          {/* Branding */}
          <p className="text-xs font-medium text-rose-600 uppercase tracking-widest mb-4">
            Room search profile on RoomRush
          </p>

          {/* Name */}
          <h1 className="font-display font-bold text-2xl md:text-3xl text-black mb-4">
            {profile.name}
          </h1>

          {/* Key details */}
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2 text-zinc-600 text-sm">
              <Calendar size={14} className="text-zinc-400 shrink-0" />
              <span>
                Looking from <strong className="text-black font-medium">{profile.move_in_date}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600 text-sm">
              <MapPin size={14} className="text-zinc-400 shrink-0" />
              <span>
                Preferred area: <strong className="text-black font-medium">{profile.preferred_area}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600 text-sm">
              <span className="text-zinc-400 text-xs font-bold w-3.5 shrink-0 text-center">€</span>
              <span>
                Budget: <strong className="text-black font-medium">{profile.budget}</strong>
              </span>
            </div>
          </div>

          {/* Intro */}
          <div className="bg-zinc-50 border border-zinc-100 px-4 py-4 mb-6">
            <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap italic">
              &ldquo;{profile.short_intro}&rdquo;
            </p>
          </div>

          {/* Contact button */}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 font-medium text-sm transition-colors w-full"
          >
            {btnLabel}
          </a>

          <p className="text-xs text-zinc-400 mt-3 text-center">
            Contact info is provided by the room seeker and visible on their public profile.
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-6 border border-zinc-200 bg-zinc-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-zinc-600">
          Also looking for a room?{" "}
          <span className="font-medium text-black">Create your RoomRush profile.</span>
        </p>
        <Link
          href="/room-seekers/create"
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          Get started
        </Link>
      </div>
    </div>
  );
}
