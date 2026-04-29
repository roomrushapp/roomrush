import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PriorityAlertsForm from "@/components/PriorityAlertsForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Priority Alerts Beta — RoomRush Munich",
  description:
    "Apply for Priority Alerts Beta. Get earlier alerts for RoomRush uploads that match your filters. Limited to 10 people. €9.99 for 7 days.",
};

export default function PriorityAlertsPage() {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {/* Back link */}
        <div className="pt-8 pb-6">
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Room Alerts
          </Link>
        </div>

        {/* Hero — full width */}
        <div className="mb-8 max-w-2xl">
          <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Beta · Limited to 10 people
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight text-white mb-3">
            Priority Alerts for active room seekers
          </h1>
          <p className="text-zinc-400 text-base">
            Get earlier alerts for RoomRush uploads that match or are close to your filters.
          </p>
        </div>

        {/* Two-column on desktop: info left, form right */}
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">

          {/* ── LEFT: info ── */}
          <div className="flex flex-col gap-7 lg:sticky lg:top-20">

            {/* Price card */}
            <div className="border border-zinc-700 bg-zinc-900 p-5">
              <div className="flex items-end gap-2 mb-4">
                <p className="font-display font-bold text-3xl text-white">€9.99</p>
                <p className="text-zinc-400 text-sm pb-0.5">for 7 days</p>
              </div>
              <ul className="flex flex-col gap-2">
                <li className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <span className="text-rose-500 shrink-0">✓</span>
                  Manually reviewed before payment
                </li>
                <li className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <span className="text-rose-500 shrink-0">✓</span>
                  Limited to 10 people during beta
                </li>
                <li className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <span className="text-rose-500 shrink-0">✓</span>
                  Free 7 day extension if zero matching or close match uploads appear
                </li>
              </ul>
            </div>

            {/* How it works */}
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-4">How it works</p>
              <ol className="flex flex-col gap-3">
                {[
                  "Submit your filters below.",
                  "We review your request manually.",
                  "If it fits the beta, we contact you with payment details.",
                  "Once active, you receive relevant RoomRush uploads earlier by WhatsApp or email.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-300">
                    <span className="text-rose-500 font-semibold shrink-0 w-4">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* What you are paying for */}
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">What you are paying for</p>
              <p className="text-zinc-300 text-sm leading-relaxed mb-3">
                Priority Alerts gives you earlier alerts for relevant RoomRush uploads. The free newsletter sends listings around 7 to 8 pm. Priority Alerts are sent earlier when a matching or close match RoomRush upload appears.
              </p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                A close match is a listing that is slightly outside one filter, for example a bit above budget or in a nearby area, but still potentially useful.
              </p>
            </div>

          </div>

          {/* ── RIGHT: form ── */}
          <div>
            <h2 className="font-display font-bold text-2xl text-white mb-1">Apply for Priority Alerts</h2>
            <p className="text-zinc-400 text-sm mb-7">
              No payment is taken until we review and confirm your spot.
            </p>
            <PriorityAlertsForm />
          </div>

        </div>

      </div>
    </div>
  );
}
