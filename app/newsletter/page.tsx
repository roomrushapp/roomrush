import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import DigestSignupForm from "@/components/DigestSignupForm";
import WaitlistSignup from "@/components/WaitlistSignup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Room Alerts — RoomRush Munich",
  description:
    "Free email digest or priority WhatsApp alerts for new Munich room listings.",
};

const freeBullets = [
  "Recent listings in one email",
  "Sent Mon, Wed, Fri at 10 pm",
  "Delivered by email",
  "Direct listing links",
  "Free, unsubscribe anytime",
];

const priorityBullets = [
  "Instant alerts when listings are posted",
  "See listings before the next free digest",
  "Direct listing links",
  "Private WhatsApp group",
  "Admin only, listings only",
  "Planned €2.99/month",
];

export default function NewsletterPage() {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Back link */}
        <div className="pt-8 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Back to RoomRush
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-8">
          <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-2">
            Room Alerts
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight text-white mb-2">
            Munich room alerts
          </h1>
          <p className="text-zinc-400 text-sm">
            Free digest for catching up. Priority alerts for seeing listings faster.
          </p>
        </div>

        {/* Option cards */}
        <div className="grid sm:grid-cols-2 gap-5 items-start">

          {/* Free digest card */}
          <div className="group border border-zinc-700 bg-zinc-900 p-6 flex flex-col transition-all duration-200 hover:border-zinc-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 active:scale-[0.99] active:border-zinc-500">
            <div className="flex items-center justify-between mb-4">
              <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest">
                Free Digest
              </p>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5">
                Free
              </span>
            </div>

            <h2 className="font-display font-bold text-xl text-white mb-1">
              Free Room Digest
            </h2>
            <p className="text-zinc-400 text-sm mb-5">
              For staying updated casually.
            </p>

            <ul className="flex flex-col gap-2 mb-6">
              {freeBullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="border-t border-zinc-800 pt-5 mt-auto">
              <DigestSignupForm />
            </div>
          </div>

          {/* Priority alerts card */}
          <div id="priority-alerts" className="group border border-zinc-700 bg-zinc-900 p-6 flex flex-col transition-all duration-200 hover:border-amber-500/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-900/20 active:scale-[0.99] active:border-amber-500/50" style={{ borderTopColor: "rgb(217 119 6 / 0.5)", borderTopWidth: "2px" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest">
                Priority Alerts
              </p>
              <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5">
                Waitlist
              </span>
            </div>

            <h2 className="font-display font-bold text-xl text-white mb-1">
              Priority WhatsApp Alerts
            </h2>
            <p className="text-zinc-400 text-sm mb-5">
              For searching actively right now.
            </p>

            <ul className="flex flex-col gap-2 mb-6">
              {priorityBullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Check size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="border-t border-zinc-800 pt-5 mt-auto">
              <WaitlistSignup />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
