"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  active?: "rooms" | "seekers";
  variant?: "light" | "dark";
};

const BTN_MIN_WIDTH = 130; // px — both buttons equal width so slider math is exact

export default function BrowseToggle({ active: activeProp, variant }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<"rooms" | "seekers" | null>(null);

  const derived = activeProp ?? (pathname === "/room-seekers" ? "seekers" : "rooms");
  const active = optimistic ?? derived;
  const dark = variant === "dark" || activeProp === "seekers";

  function switchTab(tab: "rooms" | "seekers") {
    setOptimistic(tab);
    router.push(tab === "rooms" ? "/listings" : "/room-seekers");
  }

  // Outer pill background
  const pillBg = dark ? "rgba(255,255,255,0.09)" : "rgb(228 228 231)";

  // Sliding pill color: white when Rooms active, rose when Seekers active
  const sliderBg = active === "seekers" ? "rgb(225 29 72)" : "#ffffff";
  const sliderShadow = active === "seekers"
    ? "0 1px 8px rgba(225,29,72,0.35)"
    : "0 1px 4px rgba(0,0,0,0.14)";

  // Label colors — sit on top of sliding pill (z-index > slider)
  function labelColor(tab: "rooms" | "seekers"): string {
    if (tab === active) {
      return tab === "seekers" ? "#ffffff" : "#111113";
    }
    return dark ? "rgba(255,255,255,0.5)" : "rgb(113 113 122)";
  }

  return (
    <div className="flex justify-center">
      {/*
        Outer pill: position:relative so the absolute slider is contained.
        padding: 4px all sides — slider insets match this.
      */}
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          borderRadius: 9999,
          padding: 4,
          background: pillBg,
        }}
      >
        {/*
          Sliding background pill.
          width = BTN_MIN_WIDTH (matches each button's minWidth exactly).
          Sits at top:4px / bottom:4px / left:4px (inside the 4px outer padding).
          translateX(0)        → under Rooms (left button)
          translateX(100%)     → under Room Seekers (right button)
            100% of own width = BTN_MIN_WIDTH, which equals one button width → exact landing.
        */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            bottom: 4,
            width: BTN_MIN_WIDTH,
            borderRadius: 9999,
            background: sliderBg,
            boxShadow: sliderShadow,
            transform: active === "seekers" ? "translateX(100%)" : "translateX(0)",
            transition: "transform 230ms cubic-bezier(0.35, 0, 0.25, 1), background-color 180ms ease, box-shadow 180ms ease",
            pointerEvents: "none",
          }}
        />

        {/* Rooms button */}
        <button
          type="button"
          onClick={() => switchTab("rooms")}
          style={{
            position: "relative",
            zIndex: 1,
            minWidth: BTN_MIN_WIDTH,
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 9999,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: labelColor("rooms"),
            transition: "color 180ms ease",
            outline: "none",
            whiteSpace: "nowrap",
          }}
          onMouseDown={(e) => e.preventDefault()} // prevent focus ring on click
          onFocus={(e) => {
            // Only show ring for keyboard navigation
            if (!e.currentTarget.matches(":focus-visible")) return;
          }}
          className="focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1"
        >
          Rooms
        </button>

        {/* Room Seekers button */}
        <button
          type="button"
          onClick={() => switchTab("seekers")}
          style={{
            position: "relative",
            zIndex: 1,
            minWidth: BTN_MIN_WIDTH,
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 9999,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: labelColor("seekers"),
            transition: "color 180ms ease",
            outline: "none",
            whiteSpace: "nowrap",
          }}
          onMouseDown={(e) => e.preventDefault()}
          className="focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1"
        >
          Room Seekers
        </button>
      </div>
    </div>
  );
}
