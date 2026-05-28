import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ListingsSection from "@/components/ListingsSection";
import type { Listing } from "@/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const listings: Listing[] = data ?? [];

  return (
    <>
      {/* ── HERO ── */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-rose-500 text-sm font-medium uppercase tracking-widest mb-4">
                Munich · Sublets Only
              </p>
              <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-none tracking-tight text-white mb-6">
                SUBLET
                <br />
                MUNICH
                <br />
                <span className="text-rose-600">NOW.</span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-sm mb-8">
                The fastest guide for short-term rentals in Munich and nearby
                student areas. No noise. Just active listings.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#listings"
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 font-medium text-sm transition-colors"
                >
                  Browse available sublets
                  <ArrowRight size={16} />
                </a>
                <Link
                  href="/dashboard/listings/new"
                  className="inline-flex items-center gap-2 border border-zinc-400 hover:border-white text-white px-6 py-3 font-medium text-sm transition-colors"
                >
                  Post your room
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80"
                alt="Munich sublet living room"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-rose-600" />
            </div>
          </div>
        </div>
      </section>

      {/* ── LISTINGS (client component handles filters + grid) ── */}
      <ListingsSection initialListings={listings} />

      {/* ── ROOM ALERTS TEASER ── */}
      <section className="bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-2">
                Room Alerts
              </p>
              <h2 className="font-display font-bold text-white text-2xl md:text-3xl leading-tight mb-2">
                Never miss a Munich sublet.
              </h2>
              <p className="text-zinc-400 text-sm max-w-lg">
                Get free daily listings around 7–8 pm, straight to your inbox.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/newsletter"
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap"
              >
                Get Room Alerts
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUPPLY CTA ── */}
      <section className="bg-black text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight mb-4">
                GOT A ROOM<br />
                <span className="text-rose-600">TO SUBLET?</span>
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                Post it on RoomRush. Reach students, interns, and young professionals looking for short-term rooms in Munich.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <Link
                href="/dashboard/listings/new"
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 font-medium text-sm transition-colors"
              >
                Post a listing
                <ArrowRight size={16} />
              </Link>
              <a
                href="#listings"
                className="inline-flex items-center justify-center border border-zinc-600 hover:border-zinc-400 text-white px-6 py-3 font-medium text-sm transition-colors"
              >
                View listings
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
