"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://getroomrush.de"
    : "http://localhost:3000");

const inputClass =
  "w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 transition-colors";
const inputStyle = {
  background: "#1c1c1f",
  border: "1px solid rgba(255,255,255,0.1)",
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/auth/callback?next=/update-password`,
    });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="flex-1 grid md:grid-cols-2">
      {/* ── LEFT: Form ── */}
      <div
        className="flex flex-col items-center justify-center px-6 py-16"
        style={{ background: "#0f0f11" }}
      >
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="block text-center mb-10">
            <span className="font-display font-bold text-2xl text-white">Room<span className="text-rose-500">Rush</span></span>
          </Link>

          <h1 className="font-display font-bold text-3xl text-white text-center mb-2">
            Reset your password
          </h1>
          <p className="text-sm text-zinc-500 text-center mb-8">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {submitted ? (
            <div className="rounded-lg px-4 py-4 text-sm text-emerald-400" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <p className="font-semibold mb-1">Check your inbox</p>
              <p className="text-emerald-500/70">
                If an account is associated with <span className="font-medium text-emerald-400">{email}</span>, you will receive a password reset email within a few minutes. The link expires in 60 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900 disabled:text-rose-600 text-white py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          <p className="text-sm text-zinc-500 text-center mt-6">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-rose-500 hover:text-rose-400 font-medium transition-colors">
              Back to login
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT: Brand panel ── */}
      <div className="hidden md:flex flex-col items-center justify-center bg-black relative overflow-hidden px-10">
        <p className="font-display font-black text-[18vw] text-zinc-900 leading-none select-none absolute" aria-hidden>
          RR
        </p>
        <div className="relative z-10 max-w-xs">
          <div className="w-8 h-0.5 bg-rose-600 mb-6" />
          <h2 className="font-display font-bold text-3xl text-white leading-tight mb-4">
            Happens to the best of us.
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Check your inbox — the reset link expires in 60 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
