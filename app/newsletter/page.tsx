import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Munich Daily Newsletter — RoomRush",
  description:
    "Get new Munich sublets and rooms delivered to your inbox every evening. Free. Unsubscribe anytime.",
};

export default function NewsletterPage() {
  return (
    <>
      <div className="bg-zinc-950 text-white">
        {/* Back link */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Back to RoomRush
          </Link>
        </div>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Daily Newsletter · Munich
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-white mb-5 max-w-2xl">
            Stop checking 10 groups.
            <br />
            <span className="text-rose-600">Get rooms sent to you.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mb-10">
            Every evening, RoomRush sends you the freshest Munich sublets —
            straight to your inbox. No WhatsApp noise, no endless scrolling
            through Facebook groups or Telegram chats.
          </p>

          {/* Benefits */}
          <ul className="flex flex-col sm:flex-row gap-5 sm:gap-10">
            <li className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="text-base">📬</span>
              <span>New listings every evening at 7&nbsp;pm</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="text-base">🎯</span>
              <span>Munich sublets only — no noise</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="text-base">🆓</span>
              <span>Free forever. One-click unsubscribe.</span>
            </li>
          </ul>
        </section>
      </div>

      {/* Form — reuses existing component exactly as on homepage */}
      <NewsletterSignup
        variant="banner"
        heading={
          <>
            One email a day.
            <br />
            All Munich rooms.
          </>
        }
        subheading="Perfect for students, interns, and young professionals moving to Munich."
      />

      {/* Trust note */}
      <div className="bg-zinc-950 py-8 text-center">
        <p className="text-zinc-600 text-xs">
          Trusted by students &amp; young professionals relocating to Munich.
          &nbsp;No spam. GDPR-compliant.
        </p>
      </div>
    </>
  );
}
