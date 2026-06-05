import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand */}
          <div>
            <p className="font-display font-bold text-base tracking-tight">
              RoomRush Munich
            </p>
            <p className="text-zinc-400 text-xs mt-0.5">
              © {new Date().getFullYear()} RoomRush Munich. We only display listings.
            </p>
            <p className="text-zinc-600 text-xs mt-0.5">
              RoomRush does not handle payments or contracts.
            </p>
          </div>

          {/* Legal links */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
            <Link href="/legal/impressum" className="hover:text-white transition-colors">
              Impressum
            </Link>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/disclaimer" className="hover:text-white transition-colors">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
