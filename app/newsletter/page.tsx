import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Room Alerts — RoomRush Munich",
  description:
    "Get new Munich sublets in your inbox. Free daily listings every evening, or faster Priority Alerts Beta for active room seekers.",
};

export default function RoomAlertsPage() {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

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
        <div className="mb-10">
          <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-4">
            Room Alerts · Munich
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight text-white mb-4">
            Get Munich sublets<br />in your inbox.
          </h1>
          <p className="text-zinc-400 text-base">
            Choose free daily listings, or faster filtered alerts if you are actively searching.
          </p>
        </div>

        {/* ── FREE NEWSLETTER CARD ── primary */}
        <div className="border border-zinc-700 bg-zinc-900 p-6 md:p-8 mb-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest">
              Free Daily Newsletter
            </p>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-sm">
              Free
            </span>
          </div>
          <h2 className="font-display font-bold text-xl text-white mb-1">
            Daily listings in your inbox
          </h2>
          <p className="text-zinc-400 text-sm mb-5">
            Get new RoomRush listings by email every evening around 7–8 pm. Best for casually checking new rooms.
          </p>

          <ul className="flex flex-col gap-2 mb-6">
            <li className="flex items-center gap-2.5 text-sm text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              New listings every evening around 7–8 pm
            </li>
            <li className="flex items-center gap-2.5 text-sm text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              Munich, Garching, Freising, and nearby areas
            </li>
            <li className="flex items-center gap-2.5 text-sm text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              Free to join, unsubscribe anytime
            </li>
          </ul>

          <NewsletterSignup variant="banner" compact={true} />
        </div>

        {/* ── PRIORITY ALERTS TEASER CARD ── secondary */}
        <div className="border border-zinc-800 bg-zinc-900/40 p-6 md:p-8">
          <div className="flex items-center justify-between mb-1">
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
              Need rooms even faster?
            </p>
            <span className="text-xs font-semibold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-sm">
              €9.99 / 7 days
            </span>
          </div>
          <h2 className="font-display font-bold text-xl text-white mb-1">
            Priority Alerts Beta
          </h2>
          <p className="text-zinc-400 text-sm mb-5">
            Get matching or close match RoomRush uploads earlier based on your budget, move-in date, and preferred areas.
          </p>

          <ul className="flex flex-col gap-2 mb-6">
            <li className="flex items-center gap-2.5 text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
              Manually reviewed before payment
            </li>
            <li className="flex items-center gap-2.5 text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
              Limited to 10 people during beta
            </li>
            <li className="flex items-center gap-2.5 text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
              No room or reply guaranteed
            </li>
          </ul>

          <Link
            href="/priority-alerts"
            className="inline-flex items-center gap-2 border border-zinc-600 hover:border-zinc-400 text-zinc-200 hover:text-white px-5 py-2.5 font-medium text-sm transition-colors"
          >
            Learn about Priority Alerts
            <ArrowRight size={14} />
          </Link>
        </div>

        <p className="text-zinc-600 text-xs mt-8 text-center">
          Used by students, interns, and young professionals relocating to Munich. No spam. GDPR-compliant.
        </p>

      </div>
    </div>
  );
}
