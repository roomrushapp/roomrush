import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Munich Daily Newsletter — RoomRush",
  description:
    "Get new Munich sublets delivered to your inbox every evening. Free. Unsubscribe anytime.",
};

export default function NewsletterPage() {
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

        {/* Two-column hero — text left, form right */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start pb-20">

          {/* Left: persuasive copy */}
          <div className="lg:pt-3">
            <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-4">
              Daily Newsletter · Munich
            </p>
            <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight text-white mb-5">
              Get Munich sublets<br />in your inbox.
            </h1>
            <p className="text-zinc-400 text-base mb-3">
              Every evening, get new Munich sublets in your inbox. Only sent when new listings are available.
              No WhatsApp noise. No endless scrolling through Facebook or Telegram groups.
            </p>
            <p className="text-zinc-500 text-sm mb-8">
              New listings across Munich, Garching, Freising, and nearby areas, every evening at 7 pm.
            </p>

            {/* 3 benefit points */}
            <ul className="flex flex-col gap-3 mb-10">
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                New listings every evening at 7 pm
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                Munich sublets only, no noise
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                Free to join, unsubscribe anytime
              </li>
            </ul>

            <p className="text-zinc-600 text-xs">
              Used by students, interns, and young professionals relocating to Munich. No spam. GDPR-compliant.
            </p>
          </div>

          {/* Right: existing NewsletterSignup component, compact card */}
          <NewsletterSignup
            variant="banner"
            compact={true}
            heading="Subscribe free."
            subheading="For students, interns, and young professionals moving to Munich."
          />

        </div>
      </div>
    </div>
  );
}
