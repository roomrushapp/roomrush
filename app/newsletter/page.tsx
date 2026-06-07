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

/* ── Comparison data ── */
type RowValue = string | true | false;

const rows: { label: string; free: RowValue; paid: RowValue }[] = [
  { label: "Timing",                   free: "Mon, Wed, Fri at 10 pm",       paid: "Instantly when posted" },
  { label: "Includes",                 free: "Listings from the last few days", paid: "New listings as they go live" },
  { label: "Where",                    free: "Email",                         paid: "Private WhatsApp group" },
  { label: "Direct listing links",     free: true,                            paid: true },
  { label: "Earlier chance to contact",free: false,                           paid: true },
  { label: "Price",                    free: "Free",                          paid: "Planned €2.99/month" },
  { label: "Status",                   free: "Available now",                 paid: "Waitlist open" },
];

function FreeCell({ value }: { value: RowValue }) {
  if (value === true)  return <Check size={15} className="text-emerald-400" />;
  if (value === false) return <Minus size={15} className="text-zinc-600" />;
  return <span className="text-zinc-300 text-sm">{value}</span>;
}

function PaidCell({ value }: { value: RowValue }) {
  if (value === true)  return <Check size={15} className="text-emerald-400" />;
  if (value === false) return <Minus size={15} className="text-zinc-600" />;
  return <span className="text-zinc-200 text-sm font-medium">{value}</span>;
}

export default function NewsletterPage() {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

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

        {/* ── Hero ── */}
        <div className="mb-8">
          <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-2">
            Room Alerts · Munich
          </p>
          <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight text-white mb-2">
            Get new Munich room listings<br className="hidden sm:block" /> by email or WhatsApp
          </h1>
          <p className="text-zinc-400 text-sm">
            Free digest for catching up. Priority alerts for seeing listings faster.
          </p>
        </div>

        {/* ── Comparison card ── */}
        <div className="border border-zinc-800 bg-zinc-900 overflow-hidden mb-3">

          {/* Column headers */}
          <div className="grid grid-cols-[minmax(120px,1fr)_1fr_1fr] border-b border-zinc-800">
            <div className="px-5 py-4" />
            <div className="px-5 py-4 border-r border-zinc-800">
              <p className="text-sm font-semibold text-white leading-snug">Free Room Digest</p>
              <span className="inline-block mt-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5">
                Free
              </span>
            </div>
            {/* Priority column header — accented */}
            <div className="px-5 py-4 bg-amber-400/[0.04] border-t-2 border-t-amber-500/40">
              <p className="text-sm font-semibold text-white leading-snug">Priority WhatsApp Alerts</p>
              <span className="inline-block mt-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5">
                Waitlist open
              </span>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[minmax(120px,1fr)_1fr_1fr] ${
                i < rows.length - 1 ? "border-b border-zinc-800/50" : ""
              }`}
            >
              <div className="px-5 py-3 flex items-center">
                <span className="text-xs text-zinc-500 font-medium">{row.label}</span>
              </div>
              <div className="px-5 py-3 flex items-center border-r border-zinc-800/50">
                <FreeCell value={row.free} />
              </div>
              <div className="px-5 py-3 flex items-center bg-amber-400/[0.03]">
                <PaidCell value={row.paid} />
              </div>
            </div>
          ))}
        </div>

        {/* Comparison footnote */}
        <p className="text-zinc-500 text-xs mb-10">
          Free digest helps you catch up. Priority alerts help you react faster.
        </p>

        {/* ── Signup cards ── */}
        <div className="grid sm:grid-cols-2 gap-5 items-start">

          {/* Free digest card */}
          <div className="border border-zinc-700 bg-zinc-900 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
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
            <DigestSignupForm />
          </div>

          {/* Priority alerts card */}
          <div className="border border-zinc-700 bg-zinc-900 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
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
