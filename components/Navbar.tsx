"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get current session on mount (getSession reads local storage, no network call)
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));

    // Listen for auth changes (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div
              aria-hidden
              style={{
                width: 34,
                height: 44,
                backgroundImage: "url('/roomrush-logo.png')",
                backgroundSize: "94px 94px",
                backgroundPosition: "-7px -27px",
                backgroundRepeat: "no-repeat",
                flexShrink: 0,
              }}
            />
            <span className="font-display font-bold text-xl tracking-tight text-black">
              RoomRush
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-zinc-600 hover:text-black transition-colors">
              Listings
            </Link>

            {user ? (
              <>
                <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-black transition-colors">
                  Dashboard
                </Link>
                <Link href="/newsletter" className="text-sm text-zinc-600 hover:text-black transition-colors">
                  Newsletter
                </Link>
                <Link
                  href="/dashboard/listings/new"
                  className="bg-rose-600 hover:bg-rose-700 text-white text-sm px-4 py-2 font-medium transition-colors"
                >
                  Post a Listing
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-zinc-500 hover:text-black transition-colors"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/newsletter" className="text-sm text-zinc-600 hover:text-black transition-colors">
                  Newsletter
                </Link>
                <Link href="/auth/login" className="text-sm text-zinc-600 hover:text-black transition-colors">
                  Log in
                </Link>
                <Link
                  href="/dashboard/listings/new"
                  className="bg-rose-600 hover:bg-rose-700 text-white text-sm px-4 py-2 font-medium transition-colors"
                >
                  Post a Listing
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-1 text-zinc-700"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-4 flex flex-col gap-4">
          <Link href="/" className="text-sm text-zinc-700" onClick={() => setOpen(false)}>
            Listings
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-zinc-700" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <Link href="/newsletter" className="text-sm text-zinc-700" onClick={() => setOpen(false)}>
                Newsletter
              </Link>
              <Link
                href="/dashboard/listings/new"
                className="bg-rose-600 text-white text-sm px-4 py-2 text-center font-medium"
                onClick={() => setOpen(false)}
              >
                Post a Listing
              </Link>
              <button
                onClick={() => { handleLogout(); setOpen(false); }}
                className="text-sm text-zinc-500 text-left"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/newsletter" className="text-sm text-zinc-700" onClick={() => setOpen(false)}>
                Newsletter
              </Link>
              <Link href="/auth/login" className="text-sm text-zinc-700" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link
                href="/dashboard/listings/new"
                className="bg-rose-600 text-white text-sm px-4 py-2 text-center font-medium"
                onClick={() => setOpen(false)}
              >
                Post a Listing
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
