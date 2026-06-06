import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BellRing, Users } from "lucide-react";

export const metadata = {
  title: "RoomRush Munich – Find Sublets Fast",
  description: "Munich sublets, made faster and safer. Browse active listings, post a room, or find tenants directly.",
};

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col bg-black text-white">
      <div className="flex-1 flex items-center">
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">

            {/* Left: text + buttons */}
            <div>
              <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-5">
                Munich · Rooms & Sublets
              </p>
              <h1 className="font-display font-bold text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight text-white mb-5">
                SUBLET
                <br />
                MUNICH
                <br />
                <span className="text-rose-600">NOW.</span>
              </h1>
              <p className="text-zinc-400 text-base md:text-lg max-w-sm mb-10">
                Munich rooms and sublets, made faster and safer.
              </p>

              {/* 4-button row */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3.5 rounded-full font-semibold text-sm transition-colors whitespace-nowrap"
                >
                  Browse available sublets
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/dashboard/listings/new"
                  className="inline-flex items-center gap-2 border border-zinc-500 hover:border-white text-white px-6 py-3.5 rounded-full font-medium text-sm transition-colors whitespace-nowrap"
                >
                  Post your room
                </Link>
                <Link
                  href="/room-seekers"
                  className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-400 text-zinc-300 hover:text-white px-6 py-3.5 rounded-full font-medium text-sm transition-colors whitespace-nowrap"
                >
                  <Users size={14} />
                  Find tenants &amp; roommates
                </Link>
                <Link
                  href="/newsletter"
                  className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-400 text-zinc-300 hover:text-white px-6 py-3.5 rounded-full font-medium text-sm transition-colors whitespace-nowrap"
                >
                  <BellRing size={14} />
                  Get room alerts
                </Link>
              </div>
            </div>

            {/* Right: framed image with caption */}
            <div className="hidden md:flex flex-col">
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-zinc-800">
                <Image
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80"
                  alt="Munich sublet living room"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div
                className="flex items-center justify-between px-4 py-3 rounded-b-2xl -mt-1"
                style={{
                  background: "#111113",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderTop: "none",
                }}
              >
                <p className="text-zinc-400 text-xs font-medium tracking-wide">
                  Active sublets. No noise. Direct contact.
                </p>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
