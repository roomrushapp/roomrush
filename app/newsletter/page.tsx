import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import WaitlistSignup from "@/components/WaitlistSignup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Room Alerts — RoomRush Munich",
  description:
    "Free email digest or priority WhatsApp alerts for new Munich room listings.",
};

const rows = [
  { label: "Timing",                  free: "Mon, Wed, Fri at 10 pm",    paid: "Instantly when posted" },
  { label: "Includes",                free: "Listings from the last few days", paid: "New listings as they go live" },
  { label: "Where",                   free: "Email",                     paid: "Private WhatsApp group" },
  { label: "Direct listing links",    free: true,                        paid: true },
  { label: "Earlier chance to contact", free: false,                     paid: true },
  { label: "Price",                   free: "Free",                      paid: "Planned €2.99/month" },
  { label: "Status",                  free: "Available now",             paid: "Waitlist open" },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true)  return <Check size={16} className="text-emerald-400 mx-auto" />;
  if (value === false) return <X size={16} className="text-zinc-600 mx-auto" />;
  return <span>{value}</span>;
}

export default function NewsletterPage() {
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
        <div className="mb-10">
          <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Room Alerts · Munich
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight text-white mb-3">
            Get new Munich room listings<br className="hidden sm:block" /> by email or WhatsApp
          </h1>
          <p className="text-zinc-400 text-base">
            Free digest for catching up. Priority alerts for seeing listings faster.
          </p>
        </div>

        {/* Comparison table */}
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left text-zinc-500 font-medium py-3 pr-4 w-1/3" />
                <th className="text-left py-3 px-4 w-1/3">
                  <span className="text-white font-semibold">Free Room Digest</span>
                </th>
                <th className="text-left py-3 px-4 w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">Priority WhatsApp Alerts</span>
                    <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 whitespace-nowrap">Coming soon</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-zinc-900/50" : ""}>
                  <td className="text-zinc-500 py-3 pr-4 font-medium">{row.label}</td>
                  <td className="text-zinc-300 py-3 px-4">
                    <Cell value={row.free} />
                  </td>
                  <td className="text-zinc-300 py-3 px-4">
                    <Cell value={row.paid} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-zinc-500 text-sm mb-12">
          Free digest helps you catch up. Priority alerts help you react faster.
        </p>

        {/* Signup boxes */}
        <div className="grid sm:grid-cols-2 gap-6">

          {/* Free digest */}
          <div className="border border-zinc-700 bg-zinc-900 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest">
                Free Digest
              </p>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5">
                Free
              </span>
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-1">
              Join the free digest
            </h2>
            <p className="text-zinc-400 text-sm mb-5">
              Get listings from the last few days every Mon, Wed, Fri at 10 pm.
            </p>
            <NewsletterSignup variant="banner" compact={true} />
          </div>

          {/* WhatsApp waitlist */}
          <div className="border border-zinc-700 bg-zinc-900 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest">
                Priority Alerts
              </p>
              <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5">
                Waitlist
              </span>
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-1">
              Join the WhatsApp waitlist
            </h2>
            <p className="text-zinc-400 text-sm mb-5">
              Get instant WhatsApp alerts when new listings are posted on RoomRush.
            </p>
            <WaitlistSignup />
          </div>

        </div>

        <p className="text-zinc-600 text-xs mt-8">
          Used by students, interns, and young professionals relocating to Munich. GDPR-compliant.
        </p>

      </div>
    </div>
  );
}
