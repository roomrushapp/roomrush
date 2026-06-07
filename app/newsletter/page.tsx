import Link from "next/link";
import { ArrowLeft, Check, Minus } from "lucide-react";
import DigestSignupForm from "@/components/DigestSignupForm";
import WaitlistSignup from "@/components/WaitlistSignup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Room Alerts — RoomRush Munich",
  description:
    "Free email digest or priority WhatsApp alerts for new Munich room listings.",
};

type RowValue = string | true | false;

const freeRows: { label: string; value: RowValue }[] = [
  { label: "Timing",                    value: "Mon, Wed, Fri at 10 pm" },
  { label: "Includes",                  value: "Listings from the last few days" },
  { label: "Where",                     value: "Email" },
  { label: "Direct listing links",      value: true },
  { label: "Earlier chance to contact", value: false },
  { label: "Price",                     value: "Free" },
  { label: "Status",                    value: "Available now" },
];

const priorityRows: { label: string; value: RowValue }[] = [
  { label: "Timing",                    value: "Instantly when posted" },
  { label: "Includes",                  value: "New listings as they go live" },
  { label: "Where",                     value: "Private WhatsApp group" },
  { label: "Direct listing links",      value: true },
  { label: "Earlier chance to contact", value: true },
  { label: "Price",                     value: "Planned €2.99/month" },
  { label: "Status",                    value: "Waitlist open" },
];

function RowValue({ value }: { value: RowValue }) {
  if (value === true)  return <Check size={14} className="text-emerald-400 shrink-0" />;
  if (value === false) return <Minus size={14} className="text-zinc-600 shrink-0" />;
  return <span className="text-zinc-300 text-sm">{value}</span>;
}

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
            Room Alerts · Munich
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight text-white mb-2">
            Get new Munich room listings<br className="hidden sm:block" /> by email or WhatsApp
          </h1>
          <p className="text-zinc-400 text-sm">
            Free digest for catching up. Priority alerts for seeing listings faster.
          </p>
        </div>

        {/* Option cards */}
        <div className="grid sm:grid-cols-2 gap-5 items-start">

          {/* Free digest card */}
          <div className="border border-zinc-700 bg-zinc-900 p-6 flex flex-col">
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

            {/* Comparison rows */}
            <div className="flex flex-col gap-2.5 mb-6">
              {freeRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-500 font-medium shrink-0">{row.label}</span>
                  <RowValue value={row.value} />
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-5">
              <DigestSignupForm />
            </div>
          </div>

          {/* Priority alerts card */}
          <div className="border border-amber-500/30 bg-amber-400/[0.03] p-6 flex flex-col">
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

            {/* Comparison rows */}
            <div className="flex flex-col gap-2.5 mb-6">
              {priorityRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-500 font-medium shrink-0">{row.label}</span>
                  <RowValue value={row.value} />
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-5">
              <WaitlistSignup />
            </div>
          </div>

        </div>

        {/* Footer line */}
        <p className="text-zinc-600 text-xs mt-6">
          Free digest helps you catch up. Priority alerts help you react faster.
        </p>

      </div>
    </div>
  );
}
