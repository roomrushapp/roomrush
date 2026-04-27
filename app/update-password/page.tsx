"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PageState = "checking" | "ready" | "expired" | "success";

export default function UpdatePasswordPage() {
  const [pageState, setPageState] = useState<PageState>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    // The /auth/callback route has already exchanged the PKCE code for a session.
    // We verify that session is a recovery-type session before showing the form.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPageState("ready");
      } else {
        setPageState("expired");
      }
    });

    // Also catch the PASSWORD_RECOVERY event in case the page is reached
    // via a direct link (non-PKCE / older flow).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPageState("ready");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setPageState("success");
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
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
            Set new password
          </h1>
          <p className="text-sm text-zinc-500 text-center mb-8">
            Choose a strong password for your account.
          </p>

          {pageState === "checking" && (
            <p className="text-sm text-zinc-500 text-center">
              Verifying your reset link…
            </p>
          )}

          {pageState === "expired" && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-4 rounded-sm">
              <p className="font-semibold mb-1">Link expired or invalid</p>
              <p>
                This password reset link has expired or already been used.{" "}
                <Link
                  href="/auth/forgot-password"
                  className="underline font-medium"
                >
                  Request a new one.
                </Link>
              </p>
            </div>
          )}

          {pageState === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-4 rounded-sm">
              <p className="font-semibold mb-1">Password updated!</p>
              <p>Redirecting you to your dashboard…</p>
            </div>
          )}

          {pageState === "ready" && (
            <>
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 pr-10 placeholder:text-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Repeat your new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white py-3 font-medium text-sm transition-colors"
                >
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
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
            Almost there.
          </h2>
          <p className="text-sm text-zinc-500">
            Pick a strong password and you&apos;re back in.
          </p>
        </div>
      </div>
    </div>
  );
}
