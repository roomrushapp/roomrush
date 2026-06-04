"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function BrowseToggle({ active: activeProp }: { active?: "rooms" | "seekers" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<"rooms" | "seekers" | null>(null);

  const derived = activeProp ?? (pathname === "/room-seekers" ? "seekers" : "rooms");
  const active = optimistic ?? derived;

  function switchTab(tab: "rooms" | "seekers") {
    setOptimistic(tab);
    router.push(tab === "rooms" ? "/#listings" : "/room-seekers");
  }

  return (
    <div className="flex justify-center">
      <div className="inline-flex bg-zinc-100 border border-zinc-200 p-1 gap-0.5">
        <button
          type="button"
          onClick={() => switchTab("rooms")}
          className={`px-7 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
            active === "rooms"
              ? "bg-rose-600 text-white"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          Rooms
        </button>
        <button
          type="button"
          onClick={() => switchTab("seekers")}
          className={`px-7 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
            active === "seekers"
              ? "bg-rose-600 text-white"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          Room Seekers
        </button>
      </div>
    </div>
  );
}
