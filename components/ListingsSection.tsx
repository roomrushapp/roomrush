"use client";

import { useState } from "react";
import ListingCard from "@/components/ListingCard";
import ListingFilters from "@/components/ListingFilters";
import type { Listing } from "@/types";

type Props = {
  initialListings: Listing[];
};

export default function ListingsSection({ initialListings }: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
}
