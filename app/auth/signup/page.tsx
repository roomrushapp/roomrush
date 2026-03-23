"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Supabase may require email confirmation depending on your project settings.
    // If email confirmation is OFF, user is logged in immediately.
    setSuccess(true);
    setLoading(false);

    // Short delay then redirect
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
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
            Create your account
          </h1>
          <p className="text-sm text-zinc-500 text-center mb-8">
            Free to join. Start browsing or posting in minutes.
          </p>

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 mb-6">
              Account created! Redirecting to your dashboard…
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">
                Full name
              </label>
              <input
                type="text"
                required
                placeholder="Max Mustermann"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400"
              />
            </div>

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
              <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">
                Password
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
              <p className="text-xs text-zinc-400 mt-1">Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white py-3 font-medium text-sm transition-colors"
            >
              {loading ? "Creating account…" : "Create account — it's free"}
            </button>
          </form>

          <p className="text-sm text-zinc-500 text-center mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-rose-600 hover:text-rose-700 font-medium">
              Log in
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
      <div className="hidden md:flex flex-col items-center justify-center bg-black relative overflow-hidden px-10">
        <p className="font-display font-black text-[20vw] text-zinc-800 leading-none select-none absolute" aria-hidden>
          RR
        </p>
        <div className="relative z-10 max-w-xs">
          <div className="w-8 h-1 bg-rose-600 mb-6" />
          <h2 className="font-display font-bold text-4xl text-white leading-tight mb-4">
            List your space.<br />
            <span className="text-rose-600">Find yours.</span>
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Munich&apos;s fastest growing sublet platform. Join students,
            interns, and professionals finding short-term housing.
          </p>
        </div>
      </div>
    </div>
  );
}
