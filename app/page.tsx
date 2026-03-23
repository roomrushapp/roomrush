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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
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
                The fastest guide for short-term rentals in Munich. No noise.
                Just active listings.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#listings"
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 font-medium text-sm transition-colors"
                >
                  Find a sublet in Munich, fast
                  <ArrowRight size={16} />
                </a>
                <Link
                  href="/dashboard/listings/new"
                  className="inline-flex items-center gap-2 border border-zinc-600 hover:border-zinc-400 text-white px-6 py-3 font-medium text-sm transition-colors"
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

      {/* ── CTA BANNER ── */}
      <section className="bg-black text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight mb-4">
                NEVER MISS A<br />
                <span className="text-rose-600">MUNICH SUBLET.</span>
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                List your space in Munich&apos;s fastest growing sublet network.
                Takes less than 60 seconds.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 font-medium text-sm transition-colors"
              >
                Create free account
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/dashboard/listings/new"
                className="inline-flex items-center justify-center border border-zinc-600 hover:border-zinc-400 text-white px-6 py-3 font-medium text-sm transition-colors"
              >
                Post a listing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
