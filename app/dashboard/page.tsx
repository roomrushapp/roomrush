"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";
import type { Listing, RoomSeekerProfile } from "@/types";
import { Plus, Pencil, Trash2, LayoutDashboard, LogOut, MapPin, Calendar, Search } from "lucide-react";
import Image from "next/image";
import { resolveMainSeekerPhoto } from "@/lib/mockData";
import { useRouter, useSearchParams } from "next/navigation";

type Tab = "listings" | "seeker";

/**
 * Reads the `?section=room-seeker-profile` search param and calls back to the
 * parent. Must live in its own component so it can be wrapped in <Suspense>.
 * useSearchParams() cannot be called directly in the page component.
 */
function SectionParamReader({ onSection }: { onSection: (tab: Tab) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("section") === "room-seeker-profile") {
      onSection("seeker");
    }
  }, [searchParams, onSection]);
  return null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [seekerProfile, setSeekerProfile] = useState<RoomSeekerProfile | null | undefined>(undefined); // undefined = loading
  const [seekerToggling, setSeekerToggling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth/login"); return; }

      setUserName(session.user.user_metadata?.full_name ?? session.user.email ?? "");

      const [listingsRes, seekerRes] = await Promise.all([
        supabase
          .from("listings")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("room_seeker_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle(),
      ]);

      setListings(listingsRes.data ?? []);
      setSeekerProfile(seekerRes.data as RoomSeekerProfile | null);
      setLoading(false);
    }
    load();
  }, [router]);

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("listings").update({ is_active: !current }).eq("id", id);
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, is_active: !current } : l)));
  }

  async function deleteListing(id: string) {
    if (!confirm("Delete this listing permanently?")) return;
    const supabase = createClient();
    await supabase.from("listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function toggleSeekerActive() {
    if (!seekerProfile || seekerToggling) return;
    setSeekerToggling(true);
    const next = !seekerProfile.is_active;
    const supabase = createClient();
    const { error } = await supabase
      .from("room_seeker_profiles")
      .update({ is_active: next })
      .eq("id", seekerProfile.id);
    if (!error) {
      setSeekerProfile({ ...seekerProfile, is_active: next });
    }
    setSeekerToggling(false);
  }

  const liveListings = listings.filter((l) => l.is_active).length;
  const initial = userName ? userName[0].toUpperCase() : "?";

  return (
    <div className="min-h-screen flex">
      {/* Read ?section= query param — must be in Suspense per Next.js App Router rules */}
      <Suspense fallback={null}>
        <SectionParamReader onSection={setTab} />
      </Suspense>

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-zinc-200 flex flex-col py-6 px-4 hidden md:flex">
        <div className="mb-8">
          <div className="w-10 h-10 bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-sm mb-2">
            {initial}
          </div>
          <p className="font-semibold text-sm text-black truncate">{userName}</p>
          <p className="text-xs text-zinc-400">Host</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <button
            onClick={() => setTab("listings")}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-left transition-colors ${
              tab === "listings"
                ? "bg-zinc-100 text-black"
                : "text-zinc-500 hover:text-black"
            }`}
          >
            <LayoutDashboard size={15} />
            My Listings
          </button>
          <button
            onClick={() => setTab("seeker")}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-left transition-colors ${
              tab === "seeker"
                ? "bg-zinc-100 text-black"
                : "text-zinc-500 hover:text-black"
            }`}
          >
            <Search size={15} />
            Room Seeker Profile
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:text-black transition-colors mt-4"
        >
          <LogOut size={15} />
          Log out
        </button>
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200">
        <div className="flex">
          <button
            onClick={() => setTab("listings")}
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              tab === "listings" ? "text-rose-600" : "text-zinc-400"
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setTab("seeker")}
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              tab === "seeker" ? "text-rose-600" : "text-zinc-400"
            }`}
          >
            Seeker Profile
          </button>
          <Link
            href="/dashboard/listings/new"
            className="flex-1 py-3 text-xs font-medium text-white bg-black flex items-center justify-center gap-1"
          >
            <Plus size={12} />
            Post
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 sm:px-8 py-8 pb-24 md:pb-8">

        {/* ── My Listings tab ── */}
        {tab === "listings" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-black">My Listings</h1>
                <p className="text-sm text-zinc-500 mt-1">Manage your active sublets.</p>
              </div>
              <div className="flex gap-4 text-center">
                <div className="border border-zinc-200 px-4 py-2">
                  <p className="text-xs text-zinc-400 uppercase tracking-wide">Total</p>
                  <p className="font-display font-bold text-2xl text-black">{listings.length}</p>
                </div>
                <div className="border border-zinc-200 px-4 py-2">
                  <p className="text-xs text-zinc-400 uppercase tracking-wide">Live</p>
                  <p className="font-display font-bold text-2xl text-rose-600">{liveListings}</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-zinc-400 text-sm">Loading your listings…</div>
            ) : (
              <>
                <div className="flex flex-col gap-4 mb-8">
                  {listings.map((listing) => (
                    <div key={listing.id} className="flex items-center gap-4 border border-zinc-200 p-4 bg-white">
                      {/* Status badge */}
                      <div className="relative w-20 h-16 flex-shrink-0 bg-zinc-100 flex items-center justify-center">
                        <span className={`text-white text-[9px] font-bold px-1.5 py-0.5 uppercase ${listing.is_active ? "bg-rose-600" : "bg-zinc-400"}`}>
                          {listing.is_active ? "LIVE" : "PAUSED"}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5">{listing.location}</p>
                        <Link
                          href={`/listings/${listing.id}`}
                          className="font-display font-semibold text-sm text-black hover:text-rose-600 transition-colors line-clamp-1"
                        >
                          {listing.title}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                          <span className="flex items-center gap-1"><MapPin size={10} />{listing.location}, Munich</span>
                          {listing.available_from && (
                            <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(listing.available_from)}</span>
                          )}
                        </div>
                      </div>

                      {/* Rent */}
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="font-display font-bold text-rose-600 text-base">€{listing.rent.toLocaleString()}</p>
                        <p className="text-xs text-zinc-400">per month</p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => toggleActive(listing.id, listing.is_active)}
                          className={`relative w-10 h-5 transition-colors ${listing.is_active ? "bg-rose-600" : "bg-zinc-300"}`}
                          aria-label="Toggle active"
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${listing.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                        <Link
                          href={`/dashboard/listings/${listing.id}/edit`}
                          className="p-1.5 text-zinc-400 hover:text-black border border-zinc-200 hover:border-zinc-400 transition-colors"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 border border-zinc-200 hover:border-rose-300 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-2 border-dashed border-zinc-200 p-10 text-center">
                  <div className="w-12 h-12 bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                    <Plus size={20} className="text-zinc-400" />
                  </div>
                  <p className="font-display font-semibold text-base text-black mb-1">
                    {listings.length === 0 ? "Post your first listing" : "Post another listing"}
                  </p>
                  <p className="text-sm text-zinc-500 mb-4">Takes less than 60 seconds.</p>
                  <Link
                    href="/dashboard/listings/new"
                    className="inline-flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-6 py-2.5 text-sm font-medium transition-colors"
                  >
                    <Plus size={14} />
                    Post New Listing
                  </Link>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Room Seeker Profile tab ── */}
        {tab === "seeker" && (
          <>
            <div className="mb-8">
              <h1 className="font-display font-bold text-2xl md:text-3xl text-black">Room Seeker Profile</h1>
              <p className="text-sm text-zinc-500 mt-1">
                Your public profile for finding rooms, sublets, and WGs.
              </p>
            </div>

            {loading || seekerProfile === undefined ? (
              <div className="py-20 text-center text-zinc-400 text-sm">Loading…</div>
            ) : seekerProfile ? (
              /* ── Has a profile ── */
              <div className="max-w-lg">
                {/* Profile card */}
                <div className="border border-zinc-200 bg-white p-5 mb-4">
                  {/* Visibility toggle row */}
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      {/* Toggle switch */}
                      <button
                        onClick={toggleSeekerActive}
                        disabled={seekerToggling}
                        role="switch"
                        aria-checked={seekerProfile.is_active}
                        aria-label="Toggle profile visibility"
                        className={`relative inline-flex w-11 h-6 shrink-0 rounded-full overflow-hidden transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 ${
                          seekerProfile.is_active ? "bg-green-500" : "bg-zinc-300"
                        }`}
                      >
                        <span
                          className={`absolute top-[3px] left-0 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${
                            seekerProfile.is_active ? "translate-x-[23px]" : "translate-x-[3px]"
                          }`}
                        />
                      </button>
                      <div>
                        <span className={`text-sm font-semibold ${
                          seekerProfile.is_active ? "text-green-700" : "text-zinc-500"
                        }`}>
                          {seekerToggling ? "Saving…" : seekerProfile.is_active ? "Public" : "Hidden"}
                        </span>
                        <p className="text-xs text-zinc-400 leading-snug mt-0.5">
                          {seekerProfile.is_active
                            ? "Your profile is visible on the Room Seekers page."
                            : "Your profile is hidden from the Room Seekers page."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name + avatar */}
                  <div className="flex items-center gap-3 mb-3">
                    {(() => {
                      const photo = resolveMainSeekerPhoto(seekerProfile.photo_urls, seekerProfile.photo_url);
                      return photo ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-zinc-200">
                          <Image src={photo} alt={seekerProfile.name} fill unoptimized className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                          <span className="font-display font-bold text-xl text-zinc-500">
                            {seekerProfile.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      );
                    })()}
                    <div>
                      <h2 className="font-display font-bold text-xl text-black leading-tight">
                        {seekerProfile.name}
                        {seekerProfile.age && (
                          <span className="text-zinc-400 font-normal text-base ml-1">, {seekerProfile.age}</span>
                        )}
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm text-zinc-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 text-xs w-20 shrink-0">Budget</span>
                      <span className="font-medium text-black">{seekerProfile.budget}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 text-xs w-20 shrink-0">Move in</span>
                      <span className="font-medium text-black">{seekerProfile.move_in_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 text-xs w-20 shrink-0">Area</span>
                      <span className="font-medium text-black">{seekerProfile.preferred_area}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-zinc-100 pt-4">
                    <Link
                      href="/room-seekers/edit"
                      className="inline-flex items-center gap-1.5 border border-zinc-300 hover:border-zinc-500 text-zinc-700 hover:text-black text-sm px-4 py-2 transition-colors font-medium"
                    >
                      <Pencil size={13} />
                      Edit profile
                    </Link>
                    <Link
                      href={`/room-seekers/${seekerProfile.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 px-4 py-2 transition-colors font-medium border border-rose-200 hover:border-rose-400"
                    >
                      View public profile →
                    </Link>
                  </div>
                </div>

                <p className="text-xs text-zinc-400">
                  To delete your profile, open Edit profile and turn off &ldquo;Show my profile publicly&rdquo;, or contact support.
                </p>
              </div>
            ) : (
              /* ── No profile yet ── */
              <div className="max-w-lg border-2 border-dashed border-zinc-200 p-10 text-center">
                <div className="w-12 h-12 bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                  <Search size={20} className="text-zinc-400" />
                </div>
                <p className="font-display font-semibold text-base text-black mb-1">
                  Create your Room Seeker profile
                </p>
                <p className="text-sm text-zinc-500 mb-6 max-w-xs mx-auto">
                  Make a simple profile you can share with listers and WG groups.
                </p>
                <Link
                  href="/room-seekers/create"
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  <Plus size={14} />
                  Create profile
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
