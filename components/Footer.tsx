import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Brand */}
          <div>
            <p className="font-display font-bold text-lg tracking-tight">
              RoomRush Munich
            </p>
            <p className="text-zinc-400 text-sm mt-1">
              © {new Date().getFullYear()} RoomRush Munich. We only display
              listings.
            </p>
            <p className="text-zinc-500 text-xs mt-1">
              RoomRush does not handle payments or contracts.
            </p>
          </div>

          {/* Legal links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
            <Link
              href="/legal/impressum"
              className="hover:text-white transition-colors"
            >
              Impressum
            </Link>
            <Link
              href="/legal/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/legal/disclaimer"
              className="hover:text-white transition-colors"
            >
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
