"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 5 * 60 * 1000;
const STORAGE_KEY = "rr_login_state";

interface LoginState {
  attempts: number;
  cooldownUntil: number;
}

function getLoginState(): LoginState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { attempts: 0, cooldownUntil: 0 };
}
function saveLoginState(state: LoginState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}
function clearLoginState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
function formatSeconds(ms: number) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

const inputClass =
  "w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 transition-colors disabled:opacity-50";
const inputStyle = {
  background: "#1c1c1f",
  border: "1px solid rgba(255,255,255,0.1)",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const linkExpired = searchParams.get("error") === "link_expired";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    linkExpired ? "Your password reset link has expired. Please request a new one." : ""
  );
  const [loading, setLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    const state = getLoginState();
    const remaining = state.cooldownUntil - Date.now();
    if (remaining > 0) setCooldownRemaining(remaining);
  }, []);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const id = setInterval(() => {
      setCooldownRemaining((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(id);
          const state = getLoginState();
          saveLoginState({ ...state, cooldownUntil: 0, attempts: 0 });
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownRemaining]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const state = getLoginState();
    const remaining = state.cooldownUntil - Date.now();
    if (remaining > 0) { setCooldownRemaining(remaining); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      const newAttempts = state.attempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const cooldownUntil = Date.now() + COOLDOWN_MS;
        saveLoginState({ attempts: newAttempts, cooldownUntil });
        setCooldownRemaining(COOLDOWN_MS);
        setError("");
      } else {
        saveLoginState({ ...state, attempts: newAttempts });
        const left = MAX_ATTEMPTS - newAttempts;
        setError(`Invalid email or password. ${left} attempt${left === 1 ? "" : "s"} remaining before a temporary lockout.`);
      }
      setLoading(false);
      return;
    }
    clearLoginState();
    window.location.href = "/dashboard";
  }

  const isCoolingDown = cooldownRemaining > 0;

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
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 text-center mb-8">
            Sign in to manage your listings, alerts, and room seeker profile.
          </p>

          {/* Cooldown banner */}
          {isCoolingDown && (
            <div className="rounded-lg px-4 py-3 mb-6 text-sm" style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.3)" }}>
              <p className="font-semibold text-amber-400 mb-0.5">Too many failed attempts</p>
              <p className="text-amber-500/80">
                Please wait <span className="font-mono font-semibold">{formatSeconds(cooldownRemaining)}</span> before trying again.
              </p>
            </div>
          )}

          {/* Error */}
          {!isCoolingDown && error && (
            <div className="rounded-lg px-4 py-3 mb-6 text-sm text-rose-400" style={{ background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.25)" }}>
              {error}
            </div>
          )}

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
                disabled={isCoolingDown}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-rose-500 hover:text-rose-400 transition-colors">
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
                  disabled={isCoolingDown}
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
            </div>

            <button
              type="submit"
              disabled={loading || isCoolingDown}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900 disabled:text-rose-600 text-white py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-zinc-500 text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-rose-500 hover:text-rose-400 font-medium transition-colors">
              Sign up for free
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
