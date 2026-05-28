import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Room Alerts — RoomRush Munich",
  description:
    "Get new Munich sublets in your inbox. Free daily listings every evening.",
};

export default function RoomAlertsPage() {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Back link */}
        <div className="pt-8 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Back to RoomRush
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-8">
          <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Room Alerts · Munich
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight text-white mb-3">
            Get Munich sublets<br />in your inbox.
          </h1>
          <p className="text-zinc-400 text-base">
            Free daily listings every evening. No spam.
          </p>
        </div>

        {/* Newsletter card — single column */}
        <div className="max-w-lg">
          <div className="border border-zinc-600 bg-zinc-900 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest">
                Free Daily Newsletter
              </p>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5">
                Free
              </span>
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-1">
              Daily listings in your inbox
            </h2>
            <p className="text-zinc-400 text-sm mb-4">
              Get new RoomRush listings by email every evening around 7 to 8 pm. Best for casually checking new rooms.
            </p>

            <ul className="flex flex-col gap-1.5 mb-5">
              <li className="flex items-center gap-2.5 text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                New listings every evening
              </li>
              <li className="flex items-center gap-2.5 text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                Munich and nearby student areas
              </li>
              <li className="flex items-center gap-2.5 text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                Free to join, unsubscribe anytime
              </li>
            </ul>

            <NewsletterSignup variant="banner" compact={true} />
          </div>
        </div>

        <p className="text-zinc-600 text-xs mt-6">
          Used by students, interns, and young professionals relocating to Munich. No spam. GDPR-compliant.
        </p>

      </div>
    </div>
  );
}
