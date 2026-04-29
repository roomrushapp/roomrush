import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PriorityAlertsForm from "@/components/PriorityAlertsForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Priority Alerts Beta — RoomRush Munich",
  description:
    "Apply for Priority Alerts Beta and receive matching or close match RoomRush uploads earlier based on your filters. Limited to 10 people.",
};

export default function PriorityAlertsPage() {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {/* Back link */}
        <div className="pt-8 pb-10">
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Room Alerts
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-10">
          <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-4">
            Beta · Limited to 10 people
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight text-white mb-5">
            Priority Alerts for active room seekers
          </h1>
          <p className="text-zinc-400 text-base max-w-xl">
            Get matching or close match RoomRush uploads earlier based on your filters.
          </p>
        </div>

        {/* Offer card */}
        <div className="border border-zinc-700 bg-zinc-900 p-6 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="font-display font-bold text-3xl text-white">€9.99</p>
              <p className="text-zinc-400 text-sm">for 7 days</p>
            </div>
            <div className="text-sm text-zinc-400 space-y-1">
              <p>✓ Manually reviewed before payment</p>
              <p>✓ Limited to max 10 people during beta</p>
              <p>✓ Free 7-day extension if zero matches</p>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6">
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">How it works</p>
            <ul className="flex flex-col gap-2 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="text-rose-500 shrink-0">1.</span>
                Submit your request below with your filters (budget, area, move-in date).
              </li>
              <li className="flex gap-2">
                <span className="text-rose-500 shrink-0">2.</span>
                We review it manually and contact you if it fits the current beta.
              </li>
              <li className="flex gap-2">
                <span className="text-rose-500 shrink-0">3.</span>
                Once accepted, you receive earlier alerts for matching or close match RoomRush uploads via your preferred contact method (WhatsApp or email).
              </li>
              <li className="flex gap-2">
                <span className="text-rose-500 shrink-0">4.</span>
                Payment only after manual review and acceptance — no automatic charges.
              </li>
            </ul>
          </div>
        </div>

        {/* What Priority Alerts is */}
        <div className="mb-10">
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">What this is</p>
          <p className="text-zinc-300 text-sm leading-relaxed mb-3">
            The free daily newsletter sends new RoomRush listings around 7–8 pm. Priority Alerts Beta sends matching or close match RoomRush uploads earlier in the day, based on your budget, move-in date, and preferred areas.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            This is based only on listings uploaded or reviewed on RoomRush. Close match means a listing that is slightly outside one filter — for example a bit above budget or in a nearby area — but still possibly useful.
          </p>
        </div>

        {/* Terms block */}
        <div className="border border-zinc-700 bg-zinc-900/50 p-5 mb-12 text-xs text-zinc-400 leading-relaxed space-y-3">
          <p className="text-zinc-300 font-medium text-sm">Important — please read before applying</p>
          <p>
            Priority Alerts Beta does not guarantee that a matching room will be uploaded during your alert period, and it does not guarantee a room, reply from the lister, viewing, or contract. It is only for faster alerts when matching or close match listings appear on RoomRush.
          </p>
          <p>
            If there are zero matching or close match RoomRush uploads during your first 7 days, we extend your Priority Alerts once for another 7 days free. After the free extension, the alert period ends automatically, so maximum 14 days total.
          </p>
          <p>
            Close match means a listing that is slightly outside one filter, for example a bit above budget or in a nearby area, but still possibly useful.
          </p>
          <p>
            Since this is still beta, if the feature is improved or changed during your active period, you will be included in the better version without extra charge within your active 7 to 14 day alert period.
          </p>
        </div>

        {/* Application form */}
        <div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">Apply for Priority Alerts</h2>
          <p className="text-zinc-400 text-sm mb-8">
            Requests are manually reviewed. No payment is taken until we confirm your spot.
          </p>
          <PriorityAlertsForm />
        </div>

      </div>
    </div>
  );
}
