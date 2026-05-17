"use client";

import { useState } from "react";
import { MUNICH_DISTRICTS } from "@/lib/constants";
import type { Listing } from "@/types";
import { SlidersHorizontal, X } from "lucide-react";

type Filters = {
  location: string;
  minRent: string;
  maxRent: string;
  availableFrom: string;
};

type Props = {
  onFilter: (filtered: Listing[]) => void;
  allListings: Listing[];
};

export default function ListingFilters({ onFilter, allListings }: Props) {
  const [filters, setFilters] = useState<Filters>({
    location: "",
    minRent: "",
    maxRent: "",
    availableFrom: "",
  });

  function applyFilters(next: Filters) {
    let result = allListings;
    if (next.location) result = result.filter((l) => l.location === next.location);
    if (next.minRent) result = result.filter((l) => l.rent >= Number(next.minRent));
    if (next.maxRent) result = result.filter((l) => l.rent <= Number(next.maxRent));
    if (next.availableFrom) {
      // next.availableFrom is "YYYY-MM"; compare only the YYYY-MM prefix of available_from
      const sel = next.availableFrom; // e.g. "2026-05"
      result = result.filter((l) => {
        if (!l.available_from) return false;
        return l.available_from.slice(0, 7) === sel;
      });
    }
    onFilter(result);
  }

  function handleChange(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    applyFilters(next);
  }

  function clearFilters() {
    const empty: Filters = { location: "", minRent: "", maxRent: "", availableFrom: "" };
    setFilters(empty);
    onFilter(allListings);
  }

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="bg-zinc-50 border border-zinc-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={16} className="text-zinc-500" />
        <span className="text-sm font-medium text-zinc-700">Filter listings</span>
        {hasFilters && (
          <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700">
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Location</label>
          <select value={filters.location} onChange={(e) => handleChange("location", e.target.value)}
            className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-rose-600">
            <option value="">All locations</option>
            {MUNICH_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Min rent (€/mo)</label>
          <input type="number" placeholder="e.g. 500" value={filters.minRent}
            onChange={(e) => handleChange("minRent", e.target.value)}
            className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400" />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Max rent (€/mo)</label>
          <input type="number" placeholder="e.g. 2000" value={filters.maxRent}
            onChange={(e) => handleChange("maxRent", e.target.value)}
            className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400" />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Move-in month</label>
          <input type="month" value={filters.availableFrom}
            onChange={(e) => handleChange("availableFrom", e.target.value)}
            className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
        </div>
      </div>
    </div>
  );
}
