import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { RoomSeekerProfile } from "@/types";
import { contactHref, contactLabel } from "@/lib/contactHelpers";

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

  // Fetch the profile — RLS allows: active profiles for all, own profile for auth user
  const { data } = await supabase
    .from("room_seeker_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const profile = data as RoomSeekerProfile | null;

  if (!profile) notFound();

  const href = contactHref(profile.contact_method, profile.contact_value);
  const label = contactLabel(profile.contact_method);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/room-seekers"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Room Seekers
      </Link>

      {/* Profile card */}
      <div className="bg-white border border-zinc-200">
        {/* Avatar */}
        <div className="relative w-full aspect-[3/1] bg-zinc-100 overflow-hidden flex items-center justify-center">
          {profile.photo_url ? (
            <Image
              src={profile.photo_url}
              alt={profile.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100">
              <div className="w-24 h-24 rounded-full bg-zinc-200 flex items-center justify-center">
                <span className="font-display font-bold text-4xl text-zinc-400">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          {!profile.is_active && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-zinc-700 text-xs font-semibold px-3 py-1 uppercase tracking-wide">
                Profile inactive
              </span>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          {/* Branding note */}
          <p className="text-xs font-medium text-rose-600 uppercase tracking-widest mb-4">
            Room search profile on RoomRush
          </p>

          {/* Name + budget */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="font-display font-bold text-2xl md:text-3xl text-black">
              {profile.name}
            </h1>
            <div className="text-right shrink-0">
              <p className="font-display font-bold text-rose-600 text-xl">
                {profile.budget}
              </p>
              <p className="text-xs text-zinc-400">budget</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Calendar size={14} className="shrink-0" />
              <span>Looking from {profile.move_in_date}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <MapPin size={14} className="shrink-0" />
              <span>{profile.preferred_area}</span>
            </div>
          </div>

          {/* Intro */}
          <div className="border-t border-zinc-100 pt-6 mb-8">
            <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">
              {profile.short_intro}
            </p>
          </div>

          {/* Contact button */}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 font-medium text-sm transition-colors w-full sm:w-auto justify-center"
          >
            Contact via {label}
            <ExternalLink size={14} />
          </a>

          <p className="text-xs text-zinc-400 mt-3">
            Contact info is provided directly by the room seeker.
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-8 bg-zinc-50 border border-zinc-200 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-zinc-600">
          Also looking for a room?{" "}
          <span className="text-black font-medium">Create your own RoomRush profile.</span>
        </p>
        <Link
          href="/room-seekers/create"
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 font-medium text-sm transition-colors whitespace-nowrap shrink-0"
        >
          Create your profile
        </Link>
      </div>
    </div>
  );
}
