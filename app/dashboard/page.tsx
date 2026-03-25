"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/types";
import { Plus, Pencil, Trash2, LayoutDashboard, LogOut, MapPin, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      // Use getSession() to avoid a post-login race where getUser()'s network
      // call returns null before the session token settles. The middleware
      // guards /dashboard server-side with getUser() on every request.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth/login"); return; }

      setUserName(session.user.user_metadata?.full_name ?? session.user.email ?? "");

      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setListings(data ?? []);
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

  const liveListings = listings.filter((l) => l.is_active).length;
  const initial = userName ? userName[0].toUpperCase() : "?";

  return (
    <div className="min-h-screen flex">
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
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-100 text-black text-sm font-medium">
            <LayoutDashboard size={15} />
            My Listings
          </div>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:text-black transition-colors mt-4">
          <LogOut size={15} />
          Log out
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 px-4 sm:px-8 py-8">
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
                    <Link href={`/listings/${listing.id}`}
                      className="font-display font-semibold text-sm text-black hover:text-rose-600 transition-colors line-clamp-1">
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
                    <button onClick={() => toggleActive(listing.id, listing.is_active)}
                      className={`relative w-10 h-5 transition-colors ${listing.is_active ? "bg-rose-600" : "bg-zinc-300"}`}
                      aria-label="Toggle active">
                      <span className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${listing.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                    <Link href={`/dashboard/listings/${listing.id}/edit`}
                      className="p-1.5 text-zinc-400 hover:text-black border border-zinc-200 hover:border-zinc-400 transition-colors">
                      <Pencil size={14} />
                    </Link>
                    <button onClick={() => deleteListing(listing.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 border border-zinc-200 hover:border-rose-300 transition-colors">
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
              <Link href="/dashboard/listings/new"
                className="inline-flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-6 py-2.5 text-sm font-medium transition-colors">
                <Plus size={14} />
                Post New Listing
              </Link>
            </div>
          </>
        )}

        {/* Mobile CTA */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden border-t border-zinc-200 bg-white p-4">
          <Link href="/dashboard/listings/new"
            className="flex items-center justify-center gap-2 w-full bg-black text-white py-3 text-sm font-medium">
            <Plus size={14} />POST NEW LISTING
          </Link>
        </div>
      </div>
    </div>
  );
}
