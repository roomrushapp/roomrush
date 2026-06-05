"use client";

import Link from "next/link";
import Image from "next/image";
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
    <nav className="sticky top-0 z-50 bg-black border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="RoomRush"
              width={28}
              height={28}
              className="shrink-0"
              priority
            />
            <span className="font-display font-bold text-xl tracking-tight">
              <span className="text-white">Room</span><span className="text-rose-500">Rush</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/listings" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Rooms
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/newsletter" className="text-sm text-zinc-400 hover:text-white transition-colors">
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
                  className="flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/newsletter" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Room Alerts
                </Link>
                <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
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

          {/* Mobile: Post + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/dashboard/listings/new"
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-1.5 font-medium transition-colors rounded-lg"
            >
              Post
            </Link>
            <button
              className="p-1 text-zinc-400 hover:text-white transition-colors"
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
        <div className="md:hidden border-t border-zinc-800 bg-black px-4 py-4 flex flex-col gap-4">
          <Link href="/listings" className="text-sm text-zinc-400 hover:text-white transition-colors" onClick={() => setOpen(false)}>
            Rooms
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-zinc-400" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link href="/newsletter" className="text-sm text-zinc-400" onClick={() => setOpen(false)}>Room Alerts</Link>
              <Link
                href="/dashboard/listings/new"
                className="bg-rose-600 text-white text-sm px-4 py-2 text-center font-medium rounded-lg"
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
              <Link href="/newsletter" className="text-sm text-zinc-400" onClick={() => setOpen(false)}>Room Alerts</Link>
              <Link href="/auth/login" className="text-sm text-zinc-400" onClick={() => setOpen(false)}>Log in</Link>
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
