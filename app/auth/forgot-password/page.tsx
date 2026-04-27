"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://getroomrush.de"
    : "http://localhost:3000");

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    // Fire-and-forget — we never reveal whether the email exists.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/auth/callback?next=/update-password`,
    });

    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* ── LEFT: Form ── */}
      <div className="flex flex-col items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-sm">
          <Link href="/" className="block text-center mb-8">
            <span className="font-display font-bold text-2xl text-rose-600">
              RoomRush
            </span>
          </Link>

          <h1 className="font-display font-bold text-3xl text-black text-center mb-2">
            Reset your password
          </h1>
          <p className="text-sm text-zinc-500 text-center mb-8">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-4 rounded-sm">
              <p className="font-semibold mb-1">Check your inbox</p>
              <p>
                If an account is associated with{" "}
                <span className="font-medium">{email}</span>, you will receive a
                password reset email within a few minutes. The link expires in
                60 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white py-3 font-medium text-sm transition-colors"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          <p className="text-sm text-zinc-500 text-center mt-6">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT: Brand panel ── */}
      <div className="hidden md:flex flex-col items-center justify-center bg-zinc-50 relative overflow-hidden px-10">
        <p
          className="font-display font-black text-[20vw] text-zinc-200 leading-none select-none absolute"
          aria-hidden
        >
          RR
        </p>
        <div className="relative z-10 max-w-xs">
          <div className="w-8 h-1 bg-rose-600 mb-6" />
          <h2 className="font-display font-bold text-2xl text-black leading-snug mb-4">
            Happens to the best of us.
          </h2>
          <p className="text-sm text-zinc-500">
            Check your inbox — the reset link expires in 60 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
