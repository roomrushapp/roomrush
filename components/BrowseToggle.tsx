import Link from "next/link";

type Props = {
  active: "rooms" | "seekers";
};

export default function BrowseToggle({ active }: Props) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex bg-zinc-100 border border-zinc-200 p-1 gap-0.5">
        <Link
          href="/"
          className={`px-7 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
            active === "rooms"
              ? "bg-rose-600 text-white"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          Rooms
        </Link>
        <Link
          href="/room-seekers"
          className={`px-7 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
            active === "seekers"
              ? "bg-rose-600 text-white"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          Room Seekers
        </Link>
      </div>
    </div>
  );
}
