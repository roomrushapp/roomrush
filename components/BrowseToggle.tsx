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

  const derived = activeProp ?? (pathname === "/room-seekers" ? "seekers" : pathname === "/listings" ? "rooms" : "rooms");
  const active = optimistic ?? derived;
  const dark = variant === "dark" || activeProp === "seekers";

  function switchTab(tab: "rooms" | "seekers") {
    setOptimistic(tab);
    router.push(tab === "rooms" ? "/listings" : "/room-seekers");
  }

  const pillBg = dark ? "rgba(255,255,255,0.1)" : "rgb(228 228 231)";

  return (
    <div className="flex justify-center">
      <div
        className="inline-flex rounded-full p-1 gap-1"
        style={{ background: pillBg }}
      >
        <button
          type="button"
          onClick={() => switchTab("rooms")}
          className="rounded-full transition-all duration-200 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
          style={{
            minWidth: 110,
            padding: "8px 24px",
            fontSize: 14,
            fontWeight: 600,
            background: active === "rooms" ? "#ffffff" : "transparent",
            color: active === "rooms"
              ? "#111113"
              : dark ? "rgba(255,255,255,0.5)" : "rgb(113 113 122)",
            boxShadow: active === "rooms" ? "0 1px 4px rgba(0,0,0,0.14)" : "none",
          }}
        >
          Rooms
        </button>
        <button
          type="button"
          onClick={() => switchTab("seekers")}
          className="rounded-full transition-all duration-200 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
          style={{
            minWidth: 110,
            padding: "8px 24px",
            fontSize: 14,
            fontWeight: 600,
            background: active === "seekers" ? "rgb(225 29 72)" : "transparent",
            color: active === "seekers"
              ? "#ffffff"
              : dark ? "rgba(255,255,255,0.5)" : "rgb(113 113 122)",
            boxShadow: active === "seekers" ? "0 1px 8px rgba(225,29,72,0.35)" : "none",
          }}
        >
          Room Seekers
        </button>
      </div>
    </div>
  );
}
