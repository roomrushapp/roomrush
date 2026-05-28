"use client";

import { useState } from "react";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import ListingFilters from "@/components/ListingFilters";
import type { Listing } from "@/types";

const MID_BANNER_AFTER = 6;

type Props = {
  initialListings: Listing[];
};

export default function ListingsSection({ initialListings }: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings);

  const firstBatch = listings.slice(0, MID_BANNER_AFTER);
  const remainingBatch = listings.slice(MID_BANNER_AFTER);
  const showMidBanner = listings.length > MID_BANNER_AFTER;

  return (
    <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-medium text-rose-600 uppercase tracking-widest mb-1">
            Live Listings
          </p>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-black">
            Active Sublets in Munich
          </h2>
        </div>
        <span className="text-sm text-zinc-400">
          {listings.length} listing{listings.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <ListingFilters allListings={initialListings} onFilter={setListings} />
      </div>

      {/* Grid */}
      {listings.length === 0 ? (
        <div className="py-20 text-center text-zinc-400">
          <p className="text-lg font-medium mb-2">No listings match your filters.</p>
          <p className="text-sm">Try adjusting the price range or district.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {/* First batch — listings 1–6 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {firstBatch.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Mid-page Room Alerts teaser — no email form, links to /newsletter */}
          {showMidBanner && (
            <div className="w-full bg-zinc-900 border border-zinc-800 px-6 py-8 md:py-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-2">
                    Room Alerts
                  </p>
                  <p className="font-display font-bold text-white text-xl md:text-2xl leading-tight mb-1.5">
                    Want new rooms sent to you?
                  </p>
                  <p className="text-zinc-400 text-sm max-w-lg">
                    Get free daily listings by email, straight to your inbox.
                  </p>
                </div>
                <div className="shrink-0">
                  <Link
                    href="/newsletter"
                    className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 font-medium text-sm transition-colors whitespace-nowrap"
                  >
                    Get Room Alerts
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Remaining listings — 7 onwards */}
          {remainingBatch.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingBatch.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

        </div>
      )}
    </section>
  );
}
