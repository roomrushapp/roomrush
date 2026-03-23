"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 text-center mb-8">
            The fastest way to discover your next sublet.
          </p>

          {/* Error message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 mb-6">
              {error}
            </div>
          )}

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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Password
                </label>
                <Link href="#" className="text-xs text-rose-600 hover:text-rose-700">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white py-3 font-medium text-sm transition-colors"
            >
              {loading ? "Signing in…" : "Enter RoomRush"}
            </button>
          </form>

          <p className="text-sm text-zinc-500 text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-rose-600 hover:text-rose-700 font-medium">
              Sign up for free
            </Link>
          </p>

          <div className="flex justify-center gap-4 mt-8">
            <Link href="/legal/privacy" className="text-xs text-zinc-400 hover:text-zinc-600">
              Datenschutz
            </Link>
            <span className="text-xs text-zinc-300">·</span>
            <Link href="/legal/impressum" className="text-xs text-zinc-400 hover:text-zinc-600">
              Impressum
            </Link>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Brand panel ── */}
      <div className="hidden md:flex flex-col items-center justify-center bg-zinc-50 relative overflow-hidden px-10">
        <p className="font-display font-black text-[20vw] text-zinc-200 leading-none select-none absolute" aria-hidden>
          RR
        </p>
        <div className="relative z-10 max-w-xs">
          <div className="w-8 h-1 bg-rose-600 mb-6" />
          <blockquote className="font-display font-bold text-2xl text-black leading-snug mb-4">
            &ldquo;Found a place in Munich in under 2 minutes. High velocity indeed.&rdquo;
          </blockquote>
          <p className="text-sm text-zinc-500">— James K., Power User</p>
        </div>
      </div>
    </div>
  );
}
