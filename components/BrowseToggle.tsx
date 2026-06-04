import Link from "next/link";

type Props = {
  active: "rooms" | "seekers";
};

export default function BrowseToggle({ active }: Props) {
  return (
    <div className="inline-flex bg-zinc-100 border border-zinc-200 p-1 gap-0.5">
      <Link
        href="/"
        className={`px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
          active === "rooms"
            ? "bg-rose-600 text-white"
            : "text-zinc-600 hover:text-black bg-transparent"
        }`}
      >
        Rooms
      </Link>
      <Link
        href="/room-seekers"
        className={`px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
          active === "seekers"
            ? "bg-rose-600 text-white"
            : "text-zinc-600 hover:text-black bg-transparent"
        }`}
      >
        Room Seekers
      </Link>
    </div>
  );
}
