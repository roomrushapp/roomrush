"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  active?: "rooms" | "seekers";
  variant?: "light" | "dark";
};

export default function BrowseToggle({ active: activeProp, variant }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<"rooms" | "seekers" | null>(null);

  const derived = activeProp ?? (pathname === "/room-seekers" ? "seekers" : "rooms");
  const active = optimistic ?? derived;
  const dark = variant === "dark" || active === "seekers";

  function switchTab(tab: "rooms" | "seekers") {
    setOptimistic(tab);
    router.push(tab === "rooms" ? "/#listings" : "/room-seekers");
  }

  return (
    <div className="flex justify-center">
      <div
        className="inline-flex rounded-full p-1 gap-1 transition-colors duration-300"
        style={{
          background: dark ? "rgba(255,255,255,0.1)" : "rgb(228 228 231)",
        }}
      >
        <button
          type="button"
          onClick={() => switchTab("rooms")}
          className="px-6 py-2 text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap min-w-[110px]"
          style={{
            background: active === "rooms" ? (dark ? "#fff" : "#fff") : "transparent",
            color:
              active === "rooms"
                ? "#111113"
                : dark
                ? "rgba(255,255,255,0.45)"
                : "rgb(113 113 122)",
            boxShadow: active === "rooms" ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
          }}
        >
          Rooms
        </button>
        <button
          type="button"
          onClick={() => switchTab("seekers")}
          className="px-6 py-2 text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap min-w-[110px]"
          style={{
            background: active === "seekers" ? "rgb(225 29 72)" : "transparent",
            color:
              active === "seekers"
                ? "#fff"
                : dark
                ? "rgba(255,255,255,0.45)"
                : "rgb(113 113 122)",
            boxShadow: active === "seekers" ? "0 1px 4px rgba(225,29,72,0.35)" : "none",
          }}
        >
          Room Seekers
        </button>
      </div>
    </div>
  );
}
