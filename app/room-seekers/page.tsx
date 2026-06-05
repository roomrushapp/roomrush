import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import RoomSeekerCard from "@/components/RoomSeekerCard";
import BrowseToggle from "@/components/BrowseToggle";
import type { RoomSeekerProfile } from "@/types";

export const metadata = {
  title: "Room Seekers | RoomRush",
  description: "Browse people actively looking for rooms, sublets, and WGs in Munich.",
};

export default async function RoomSeekersPage() {
  const supabase = await createClient();

  const { data: profilesData } = await supabase
    .from("room_seeker_profiles")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const profiles: RoomSeekerProfile[] = profilesData ?? [];

  const { data: { user } } = await supabase.auth.getUser();
  let ctaHref = "/room-seekers/create";
  let ctaLabel = "Create your profile";
  if (user) {
    const { data: ownProfile } = await supabase
      .from("room_seeker_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (ownProfile) {
      ctaHref = "/dashboard?section=room-seeker-profile";
      ctaLabel = "Manage your profile";
    }
  }

  return (
    <div className="flex-1 flex flex-col" style={{ background: "#111113" }}>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 pb-16 flex-1">

        {/* Browse toggle */}
        <div className="mb-10">
          <BrowseToggle active="seekers" variant="dark" />
        </div>

        {/* Intro section — two columns on desktop */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest mb-2">
              Room Seekers
            </p>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight mb-2">
              Meet people looking for a room in Munich
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Students, interns, and young professionals searching for WGs, sublets, and furnished rooms.
            </p>
            <p className="text-zinc-600 text-xs mt-3">
              {profiles.length} active profile{profiles.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="sm:shrink-0 sm:pt-7">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-colors whitespace-nowrap"
            >
              {ctaLabel}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Grid or empty state */}
        {profiles.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-white/10" style={{ background: "#1a1a1d" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#2a2a2e" }}>
              <span className="font-display font-bold text-2xl text-zinc-500">?</span>
            </div>
            <p className="font-display font-semibold text-lg text-white mb-1">
              No room seekers yet.
            </p>
            <p className="text-zinc-500 text-sm mb-6 max-w-xs mx-auto">
              Create a profile and share it with listers and WG groups.
            </p>
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-full font-medium text-sm transition-colors"
            >
              {ctaLabel}
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
      </div>
    </div>
  );
}
