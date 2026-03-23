"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/types";
import { MapPin, Calendar, Trash2, ShieldAlert } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }

      const { data } = await supabase
        .from("listings")
        .select("*")
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

  async function deleteListing(id: string, title: string) {
    if (!confirm(`Delete "${title}" permanently?`)) return;
    const supabase = createClient();
    await supabase.from("listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  const filtered = listings.filter((l) =>
    filter === "all" ? true : filter === "active" ? l.is_active : !l.is_active
  );

  const liveCount = listings.filter((l) => l.is_active).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <ShieldAlert size={18} className="text-rose-600" />
        <p className="text-xs font-medium text-rose-600 uppercase tracking-widest">Admin Panel</p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-black">All Listings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage every listing on RoomRush.</p>
        </div>
        <div className="flex gap-3 text-center">
          <div className="border border-zinc-200 px-4 py-2">
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Total</p>
            <p className="font-display font-bold text-2xl text-black">{listings.length}</p>
          </div>
          <div className="border border-zinc-200 px-4 py-2">
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Live</p>
            <p className="font-display font-bold text-2xl text-rose-600">{liveCount}</p>
          </div>
          <div className="border border-zinc-200 px-4 py-2">
            <p className="text-xs text-zinc-400 uppercase tracking-wide">Paused</p>
            <p className="font-display font-bold text-2xl text-zinc-400">{listings.length - liveCount}</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-zinc-200">
        {(["all", "active", "paused"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              filter === f
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-zinc-500 hover:text-black"
            }`}
          >
            {f === "all" ? `All (${listings.length})` : f === "active" ? `Live (${liveCount})` : `Paused (${listings.length - liveCount})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-400 text-sm">Loading listings…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-400 text-sm">No listings found.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((listing) => (
            <div key={listing.id} className="flex items-center gap-4 border border-zinc-200 p-4 bg-white hover:border-zinc-300 transition-colors">
              {/* Status */}
              <div className="w-16 flex-shrink-0 text-center">
                <span className={`text-white text-[9px] font-bold px-1.5 py-0.5 uppercase ${listing.is_active ? "bg-rose-600" : "bg-zinc-400"}`}>
                  {listing.is_active ? "LIVE" : "PAUSED"}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5">{listing.location}</p>
                <Link href={`/listings/${listing.id}`} target="_blank"
                  className="font-display font-semibold text-sm text-black hover:text-rose-600 transition-colors line-clamp-1">
                  {listing.title}
                </Link>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                  <span className="flex items-center gap-1"><MapPin size={10} />{listing.location}, Munich</span>
                  {listing.available_from && (
                    <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(listing.available_from)}</span>
                  )}
                  <span className="text-zinc-300">|</span>
                  <span className="truncate max-w-[200px]">{listing.contact_email}</span>
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
                  aria-label="Toggle active">
                  <span className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${listing.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <button
                  onClick={() => deleteListing(listing.id, listing.title)}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 border border-zinc-200 hover:border-rose-300 transition-colors"
                  aria-label="Delete listing">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
