"use client";

import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";

type Status = "idle" | "loading" | "subscribed" | "already" | "error";

export default function DigestSignupForm() {
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

  if (status === "subscribed") {
    return (
      <p className="text-sm font-medium text-white">
        You&apos;re in!{" "}
        <span className="text-zinc-400">Check your inbox Mon, Wed, and Fri at 10 pm.</span>
      </p>
    );
  }

  if (status === "already") {
    return (
      <p className="text-sm font-medium text-white">
        You&apos;re already subscribed.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="relative">
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
          className="w-full min-h-[44px] bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm px-4 py-3 pl-9 outline-none transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="group/btn inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 active:scale-[0.98] disabled:opacity-50 text-white w-full px-5 py-3 min-h-[44px] font-medium text-sm transition-all duration-150"
      >
        {status === "loading" ? "Subscribing…" : "Join free digest"}
        {status !== "loading" && (
          <ArrowRight size={15} className="transition-transform duration-150 group-hover/btn:translate-x-0.5 group-active/btn:translate-x-0.5" />
        )}
      </button>

      <label className="flex items-start gap-3 cursor-pointer py-1 active:opacity-70 transition-opacity">
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
          <div
            className={`w-4 h-4 border ${
              checkboxError ? "border-rose-500" : "border-zinc-600"
            } peer-checked:bg-rose-600 peer-checked:border-rose-600 transition-colors`}
          />
          {agreed && (
            <svg
              className="absolute inset-0 w-4 h-4 text-white pointer-events-none"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8l3.5 3.5 6.5-7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <span
          className={`text-xs leading-relaxed ${
            checkboxError ? "text-rose-400" : "text-zinc-400"
          }`}
        >
          I agree to receive new listing emails from RoomRush. I can unsubscribe anytime.
          {checkboxError && (
            <span className="block text-rose-400 mt-0.5">
              Please check this box to continue.
            </span>
          )}
        </span>
      </label>

      {status === "error" && (
        <p className="text-xs text-rose-400">Something went wrong. Please try again.</p>
      )}

      <p className="text-xs text-zinc-400">Free. Unsubscribe anytime.</p>
    </form>
  );
}
