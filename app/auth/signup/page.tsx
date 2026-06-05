"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 transition-colors";
const inputStyle = {
  background: "#1c1c1f",
  border: "1px solid rgba(255,255,255,0.1)",
};

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
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
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
            Create your account
          </h1>
          <p className="text-sm text-zinc-500 text-center mb-8">
            Free to join. Start browsing or posting in minutes.
          </p>

          {/* Error */}
          {error && (
            <div className="rounded-lg px-4 py-3 mb-6 text-sm text-rose-400" style={{ background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.25)" }}>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-lg px-4 py-3 mb-6 text-sm text-emerald-400" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
              Account created! Redirecting to your dashboard…
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
                Full name
              </label>
              <input
                type="text"
                required
                placeholder="Max Mustermann"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>

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

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
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
                  className={`${inputClass} pr-10`}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-zinc-700 mt-1.5">Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900 disabled:text-rose-600 text-white py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              {loading ? "Creating account…" : "Create account — it's free"}
            </button>
          </form>

          <p className="text-sm text-zinc-500 text-center mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-rose-500 hover:text-rose-400 font-medium transition-colors">
              Log in
            </Link>
          </p>

          <div className="flex justify-center gap-4 mt-8">
            <Link href="/legal/privacy" className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors">Datenschutz</Link>
            <span className="text-xs text-zinc-700">·</span>
            <Link href="/legal/impressum" className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors">Impressum</Link>
          </div>
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
            Fast access to active Munich sublets.
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Browse rooms, manage alerts, post listings, or update your RoomRush profile.
          </p>
        </div>
      </div>
    </div>
  );
}
