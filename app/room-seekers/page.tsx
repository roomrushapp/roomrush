import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import RoomSeekerCard from "@/components/RoomSeekerCard";
import type { RoomSeekerProfile } from "@/types";

export const metadata = {
  title: "Room Seekers | RoomRush",
  description: "Browse people actively looking for rooms in Munich.",
};

export default async function RoomSeekersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("room_seeker_profiles")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const profiles: RoomSeekerProfile[] = data ?? [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-zinc-200">
        <Link
          href="/"
          className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-black transition-colors border-b-2 border-transparent -mb-px"
        >
          Rooms
        </Link>
        <span className="px-4 py-2.5 text-sm font-medium text-black border-b-2 border-rose-600 -mb-px">
          Room Seekers
        </span>
      </div>

      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-rose-600 uppercase tracking-widest mb-1">
            Room Seekers
          </p>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-black">
            People Looking for Rooms
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {profiles.length} active profile{profiles.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/room-seekers/create"
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 font-medium text-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          Create your profile
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* CTA banner */}
      <div className="bg-zinc-50 border border-zinc-200 px-6 py-6 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-display font-semibold text-black text-base mb-1">
            Looking for a room?
          </p>
          <p className="text-zinc-500 text-sm">
            Create a simple RoomRush profile that you can share with listers and WG groups.
          </p>
        </div>
        <Link
          href="/room-seekers/create"
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 font-medium text-sm transition-colors whitespace-nowrap shrink-0"
        >
          Create your profile
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Grid or empty state */}
      {profiles.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display font-semibold text-xl text-black mb-2">
            No room seekers yet.
          </p>
          <p className="text-zinc-500 text-sm mb-6">
            Looking for a room? Create a profile and share it with listers and WG groups.
          </p>
          <Link
            href="/room-seekers/create"
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 font-medium text-sm transition-colors"
          >
            Create your profile
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <RoomSeekerCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </section>
  );
}
