"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const dark = pathname === "/";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    <nav
      className="sticky top-0 z-50 transition-colors duration-200"
      style={{
        background: dark ? "#000000" : "#ffffff",
        borderBottom: dark ? "1px solid rgb(39 39 42)" : "1px solid rgb(228 228 231)",
      }}
    >
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
            <span
              className="font-display font-bold text-xl tracking-tight transition-colors duration-200"
              style={{ color: dark ? "#ffffff" : "#000000" }}
            >
              RoomRush
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/listings"
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: dark ? "rgb(161 161 170)" : "rgb(82 82 91)" }}
              >
                Rooms
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium transition-colors duration-200"
                    style={{ color: dark ? "rgb(161 161 170)" : "rgb(82 82 91)" }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/newsletter"
                    className="text-sm font-medium transition-colors duration-200"
                    style={{ color: dark ? "rgb(161 161 170)" : "rgb(82 82 91)" }}
                  >
                    Room Alerts
                  </Link>
                  <Link
                    href="/dashboard/listings/new"
                    className="bg-rose-600 hover:bg-rose-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Post a Listing
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm font-medium transition-colors duration-200"
                    style={{ color: dark ? "rgb(113 113 122)" : "rgb(113 113 122)" }}
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/newsletter"
                    className="text-sm font-medium transition-colors duration-200"
                    style={{ color: dark ? "rgb(161 161 170)" : "rgb(82 82 91)" }}
                  >
                    Room Alerts
                  </Link>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium transition-colors duration-200"
                    style={{ color: dark ? "rgb(161 161 170)" : "rgb(82 82 91)" }}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/dashboard/listings/new"
                    className="bg-rose-600 hover:bg-rose-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Post a Listing
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: Post button */}
            <Link
              href="/dashboard/listings/new"
              className="md:hidden bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-1.5 font-medium transition-colors rounded-lg"
            >
              Post
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1 transition-colors duration-200"
              style={{ color: dark ? "rgb(161 161 170)" : "rgb(63 63 70)" }}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden px-4 py-4 flex flex-col gap-4"
          style={{
            background: dark ? "#000000" : "#ffffff",
            borderTop: dark ? "1px solid rgb(39 39 42)" : "1px solid rgb(244 244 245)",
          }}
        >
          <Link
            href="/listings"
            className="text-sm font-medium transition-colors"
            style={{ color: dark ? "rgb(161 161 170)" : "rgb(63 63 70)" }}
            onClick={() => setOpen(false)}
          >
            Rooms
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium"
                style={{ color: dark ? "rgb(161 161 170)" : "rgb(63 63 70)" }}
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/newsletter"
                className="text-sm font-medium"
                style={{ color: dark ? "rgb(161 161 170)" : "rgb(63 63 70)" }}
                onClick={() => setOpen(false)}
              >
                Room Alerts
              </Link>
              <Link
                href="/dashboard/listings/new"
                className="bg-rose-600 text-white text-sm px-4 py-2 text-center font-medium rounded-lg"
                onClick={() => setOpen(false)}
              >
                Post a Listing
              </Link>
              <button
                onClick={() => { handleLogout(); setOpen(false); }}
                className="text-sm text-left"
                style={{ color: dark ? "rgb(113 113 122)" : "rgb(113 113 122)" }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/newsletter"
                className="text-sm font-medium"
                style={{ color: dark ? "rgb(161 161 170)" : "rgb(63 63 70)" }}
                onClick={() => setOpen(false)}
              >
                Room Alerts
              </Link>
              <Link
                href="/auth/login"
                className="text-sm font-medium"
                style={{ color: dark ? "rgb(161 161 170)" : "rgb(63 63 70)" }}
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/dashboard/listings/new"
                className="bg-rose-600 text-white text-sm px-4 py-2 text-center font-medium rounded-lg"
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
