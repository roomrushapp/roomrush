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
      <div
        className="inline-flex rounded-full p-1 gap-1"
        style={{ background: active === "seekers" ? "rgba(255,255,255,0.08)" : "rgb(244 244 245)" }}
      >
        <button
          type="button"
          onClick={() => switchTab("rooms")}
          className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
            active === "rooms"
              ? "bg-rose-600 text-white shadow-sm"
              : active === "seekers"
              ? "text-white/50 hover:text-white/80"
              : "text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Rooms
        </button>
        <button
          type="button"
          onClick={() => switchTab("seekers")}
          className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
            active === "seekers"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Room Seekers
        </button>
      </div>
    </div>
  );
}
