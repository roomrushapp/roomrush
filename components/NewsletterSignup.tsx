"use client";

import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "banner" | "inline";

type Props = {
  variant: Variant;
  heading?: ReactNode;
  subheading?: string;
  compact?: boolean;
};

type Status = "idle" | "loading" | "subscribed" | "already" | "error";

export default function NewsletterSignup({ variant, heading, subheading, compact = false }: Props) {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [checkboxError, setCheckboxError] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!agreed) {
      setCheckboxError(true);
      return;
    }

    setCheckboxError(false);
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        return;
      }

      setStatus(data.message === "already_subscribed" ? "already" : "subscribed");
    } catch {
      setStatus("error");
    }
  }

  const isBanner = variant === "banner";

  if (status === "subscribed") {
    return (
      <div className={isBanner ? "py-12" : "py-6"}>
        <div className={isBanner ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" : ""}>
          <p className={`font-medium text-sm ${isBanner ? "text-white" : "text-zinc-800"}`}>
            ✓ You&apos;re in!{" "}
            <span className={isBanner ? "text-zinc-400" : "text-zinc-500"}>
              You&apos;ll get emails at 7pm when new rooms are posted.
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (status === "already") {
    return (
      <div className={isBanner ? "py-12" : "py-6"}>
        <div className={isBanner ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" : ""}>
          <p className={`font-medium text-sm ${isBanner ? "text-white" : "text-zinc-800"}`}>
            ✓ You&apos;re already subscribed!{" "}
            <span className={isBanner ? "text-zinc-400" : "text-zinc-500"}>
              We&apos;ll notify you when new rooms are posted.
            </span>
          </p>
        </div>
      </div>
    );
  }

  /* ── BANNER variant ── */
  if (isBanner) {
    return (
      <section className={`bg-zinc-900 ${compact ? "border border-zinc-800" : "border-t border-zinc-800"}`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${compact ? "py-6 md:py-8" : "py-14"}`}>
          <div className={`grid md:grid-cols-2 ${compact ? "gap-6" : "gap-10"} items-center`}>

            {/* Left: copy */}
            <div>
              <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-2">
                Daily Newsletter
              </p>
              <h2 className={`font-display font-bold text-white leading-tight ${compact ? "text-xl md:text-2xl mb-1" : "text-3xl md:text-4xl mb-3"}`}>
                {heading ?? (
                  <>
                    Never miss a<br />Munich sublet.
                  </>
                )}
              </h2>
              <p className={`text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}>
                {subheading ?? "Get new listings every evening — free."}
              </p>
            </div>

            {/* Right: form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:pt-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm px-4 py-3 pl-9 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-5 py-3 font-medium text-sm transition-colors whitespace-nowrap"
                >
                  {status === "loading" ? "Subscribing…" : "Notify me daily"}
                  {status !== "loading" && <ArrowRight size={15} />}
                </button>
              </div>

              {/* GDPR checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (e.target.checked) setCheckboxError(false);
                    }}
                    className="sr-only peer"
                  />
                  <div className={`w-4 h-4 border ${checkboxError ? "border-rose-500" : "border-zinc-600"} peer-checked:bg-rose-600 peer-checked:border-rose-600 transition-colors`} />
                  {agreed && (
                    <svg
                      className="absolute inset-0 w-4 h-4 text-white pointer-events-none"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`text-xs leading-relaxed ${checkboxError ? "text-rose-400" : "text-zinc-400"}`}>
                  I agree to receive daily new listing emails from RoomRush. I can unsubscribe anytime.
                  {checkboxError && (
                    <span className="block text-rose-400 mt-0.5">Please check this box to continue.</span>
                  )}
                </span>
              </label>

              {status === "error" && (
                <p className="text-xs text-rose-400">Something went wrong. Please try again.</p>
              )}

              <p className="text-xs text-zinc-600">
                No spam. Only emails when new rooms are posted.
              </p>
            </form>
          </div>
        </div>
      </section>
    );
  }

  /* ── INLINE variant ── */
  return (
    <div className="border border-zinc-200 p-6 mt-6">
      <p className="text-rose-600 text-xs font-semibold uppercase tracking-widest mb-2">
        Daily Newsletter
      </p>
      <h3 className="font-display font-bold text-lg text-zinc-900 mb-1">
        {heading ?? "Want more options?"}
      </h3>
      <p className="text-zinc-500 text-sm mb-5">
        {subheading ?? "Get notified when new rooms are posted."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-zinc-300 text-zinc-900 placeholder-zinc-400 text-sm px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black disabled:opacity-50 text-white px-4 py-3 font-medium text-sm transition-colors w-full"
        >
          {status === "loading" ? "Subscribing…" : "Notify me daily"}
          {status !== "loading" && <ArrowRight size={15} />}
        </button>

        {/* GDPR checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (e.target.checked) setCheckboxError(false);
              }}
              className="sr-only peer"
            />
            <div className={`w-4 h-4 border ${checkboxError ? "border-rose-500" : "border-zinc-400"} peer-checked:bg-zinc-900 peer-checked:border-zinc-900 transition-colors`} />
            {agreed && (
              <svg
                className="absolute inset-0 w-4 h-4 text-white pointer-events-none"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className={`text-xs leading-relaxed ${checkboxError ? "text-rose-500" : "text-zinc-500"}`}>
            I agree to receive daily new listing emails from RoomRush. I can unsubscribe anytime.
            {checkboxError && (
              <span className="block text-rose-500 mt-0.5">Please check this box to continue.</span>
            )}
          </span>
        </label>

        {status === "error" && (
          <p className="text-xs text-rose-500">Something went wrong. Please try again.</p>
        )}

        <p className="text-xs text-zinc-400">
          No spam. Only emails when new rooms are posted.
        </p>
      </form>
    </div>
  );
}
