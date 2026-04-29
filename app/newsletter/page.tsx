import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Room Alerts — RoomRush Munich",
  description:
    "Get new Munich sublets delivered to your inbox every evening. Free daily listings or faster Priority Alerts Beta for active room seekers.",
};

export default function RoomAlertsPage() {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <div className="pt-8 pb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Back to RoomRush
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-10 lg:mb-12">
          <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-4">
            Room Alerts · Munich
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight text-white mb-5">
            Get Munich sublets<br />in your inbox.
          </h1>
          <p className="text-zinc-400 text-base max-w-xl">
            Choose free daily listings or faster filtered alerts when you are actively searching.
          </p>
        </div>

        {/* Desktop: two-column | Mobile: stacked */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start pb-20">

          {/* Left: newsletter primary + "need faster?" secondary */}
          <div>
            {/* Benefit points */}
            <ul className="flex flex-col gap-3 mb-10">
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                New listings every evening around 7–8 pm
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                Munich, Garching, Freising, and nearby areas
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                Free to join, unsubscribe anytime
              </li>
            </ul>

            {/* "Need rooms even faster?" section — shown below form on mobile, alongside on desktop */}
            <div className="mt-0 lg:mt-4 border border-zinc-800 p-6">
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
                Need rooms even faster?
              </p>
              <p className="text-zinc-300 text-sm leading-relaxed mb-5">
                The free newsletter sends new RoomRush listings around 7–8 pm. Priority Alerts Beta sends matching or close match RoomRush uploads earlier, based on your budget, move-in date and preferred areas.
              </p>
              <p className="text-zinc-500 text-xs mb-5">
                Limited beta for active room seekers.
              </p>
              <Link
                href="/priority-alerts"
                className="inline-flex items-center gap-2 border border-zinc-600 hover:border-zinc-400 text-zinc-200 hover:text-white px-5 py-2.5 font-medium text-sm transition-colors"
              >
                Learn about Priority Alerts
                <ArrowRight size={14} />
              </Link>
            </div>

            <p className="text-zinc-600 text-xs mt-8">
              Used by students, interns, and young professionals relocating to Munich. No spam. GDPR-compliant.
            </p>
          </div>

          {/* Right: newsletter form — rendered first on mobile via order */}
          <div className="order-first lg:order-none">
            <NewsletterSignup variant="banner" compact={true} />
          </div>

        </div>
      </div>
    </div>
  );
}
