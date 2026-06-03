"use client";

import { useState, useEffect } from "react";
import { MUNICH_DISTRICTS } from "@/lib/constants";
import type { Listing } from "@/types";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

type Filters = {
  location: string;
  minRent: string;
  maxRent: string;
  availableFrom: string;
};

const EMPTY: Filters = { location: "", minRent: "", maxRent: "", availableFrom: "" };

type Props = {
  onFilter: (filtered: Listing[]) => void;
  allListings: Listing[];
};

function runFilter(listings: Listing[], f: Filters): Listing[] {
  let result = listings;
  if (f.location) result = result.filter((l) => l.location === f.location);
  if (f.minRent) result = result.filter((l) => l.rent >= Number(f.minRent));
  if (f.maxRent) result = result.filter((l) => l.rent <= Number(f.maxRent));
  if (f.availableFrom) {
    result = result.filter((l) => l.available_from?.slice(0, 7) === f.availableFrom);
  }
  return result;
}

function FilterFields({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (key: keyof Filters, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Location</label>
        <select
          value={filters.location}
          onChange={(e) => onChange("location", e.target.value)}
          className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-rose-600"
        >
          <option value="">All locations</option>
          {MUNICH_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Min rent (€/mo)</label>
        <input
          type="number"
          placeholder="e.g. 500"
          value={filters.minRent}
          onChange={(e) => onChange("minRent", e.target.value)}
          className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Max rent (€/mo)</label>
        <input
          type="number"
          placeholder="e.g. 2000"
          value={filters.maxRent}
          onChange={(e) => onChange("maxRent", e.target.value)}
          className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Move-in month</label>
        <input
          type="month"
          value={filters.availableFrom}
          onChange={(e) => onChange("availableFrom", e.target.value)}
          className="w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-rose-600"
        />
      </div>
    </div>
  );
}

export default function ListingFilters({ onFilter, allListings }: Props) {
  // Applied filters (what the listing grid actually reflects)
  const [filters, setFilters] = useState<Filters>(EMPTY);
  // Staged filters inside the mobile sheet (uncommitted)
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [sheetOpen, setSheetOpen] = useState(false);

  const hasFilters = Object.values(filters).some((v) => v !== "");
  const activeCount = Object.values(filters).filter((v) => v !== "").length;

  // Desktop: apply immediately on change
  function handleDesktopChange(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setDraft(next);
    onFilter(runFilter(allListings, next));
  }

  function clearDesktop() {
    setFilters(EMPTY);
    setDraft(EMPTY);
    onFilter(allListings);
  }

  // Mobile sheet
  function openSheet() {
    setDraft(filters); // start draft from current applied state
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
  }

  function applySheet() {
    setFilters(draft);
    onFilter(runFilter(allListings, draft));
    setSheetOpen(false);
    // Scroll back to listings section
    const el = document.getElementById("listings");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearSheet() {
    setDraft(EMPTY);
    setFilters(EMPTY);
    onFilter(allListings);
    setSheetOpen(false);
  }

  // Lock body scroll while sheet is open
  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen]);

  return (
    <>
      {/* ── Mobile trigger (hidden on md+) ── */}
      <div className="md:hidden">
        <button
          onClick={openSheet}
          className="flex items-center gap-2 w-full border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <SlidersHorizontal size={16} className="text-zinc-500" />
          <span>Filter listings</span>
          {activeCount > 0 && (
            <span className="ml-1 bg-rose-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
          <ChevronDown size={16} className="ml-auto text-zinc-400" />
        </button>
      </div>

      {/* ── Desktop filter bar (hidden on mobile) ── */}
      <div className="hidden md:block bg-zinc-50 border border-zinc-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={16} className="text-zinc-500" />
          <span className="text-sm font-medium text-zinc-700">Filter listings</span>
          {hasFilters && (
            <button
              onClick={clearDesktop}
              className="ml-auto flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>
        <FilterFields filters={filters} onChange={handleDesktopChange} />
      </div>

      {/* ── Mobile bottom sheet ── */}
      {sheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={closeSheet}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl md:hidden flex flex-col max-h-[85dvh]">
            {/* Handle + header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zinc-100 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-zinc-500" />
                <span className="text-sm font-semibold text-zinc-800">Filter listings</span>
              </div>
              <button onClick={closeSheet} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X size={20} />
              </button>
            </div>

            {/* Filter fields — scrollable */}
            <div className="overflow-y-auto px-4 py-5 flex-1">
              <FilterFields filters={draft} onChange={(key, value) => setDraft((d) => ({ ...d, [key]: value }))} />
            </div>

            {/* Action buttons */}
            <div className="px-4 pb-6 pt-3 border-t border-zinc-100 flex gap-3 shrink-0">
              <button
                onClick={clearSheet}
                className="flex-1 border border-zinc-300 text-zinc-700 py-3 text-sm font-medium hover:bg-zinc-50 transition-colors"
              >
                Clear filters
              </button>
              <button
                onClick={applySheet}
                className="flex-1 bg-rose-600 text-white py-3 text-sm font-medium hover:bg-rose-700 transition-colors"
              >
                Apply filters
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
