"use client";

import { useState } from "react";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";

type Status = "idle" | "loading" | "joined" | "already" | "error";

export default function WaitlistSignup() {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/priority-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, whatsapp_number: whatsapp || undefined }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        return;
      }

      setStatus(data.message === "already_on_waitlist" ? "already" : "joined");
    } catch {
      setStatus("error");
    }
  }

  if (status === "joined") {
    return (
      <p className="text-sm font-medium text-white">
        ✓ You&apos;re on the waitlist.{" "}
        <span className="text-zinc-400">We&apos;ll email you before Priority Alerts launch.</span>
      </p>
    );
  }

  if (status === "already") {
    return (
      <p className="text-sm font-medium text-white">
        ✓ You&apos;re already on the waitlist.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="relative">
        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm px-4 py-3 pl-9 focus:outline-none focus:border-zinc-500 transition-colors"
        />
      </div>

      <div className="relative">
        <MessageCircle size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          type="tel"
          placeholder="WhatsApp number (optional)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm px-4 py-3 pl-9 focus:outline-none focus:border-zinc-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white w-full px-5 py-3 font-medium text-sm transition-all active:scale-[0.97]"
      >
        {status === "loading" ? "Joining…" : "Join waitlist"}
        {status !== "loading" && <ArrowRight size={15} />}
      </button>

      {status === "error" && (
        <p className="text-xs text-rose-400">Something went wrong. Please try again.</p>
      )}

      <p className="text-xs text-zinc-600">No payment today. Planned price: €2.99/month.</p>
    </form>
  );
}
