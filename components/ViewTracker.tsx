"use client";

import { useEffect, useRef } from "react";

export default function ViewTracker({ listingId }: { listingId: string }) {
  // Guard against React StrictMode's double-invoke in development.
  // useRef persists across the simulated unmount/remount, so the second
  // effect run exits immediately without firing a duplicate request.
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const key = `rr_viewed_${listingId}`;
    const last = localStorage.getItem(key);
    const now = Date.now();
    if (!last || now - parseInt(last, 10) > 24 * 60 * 60 * 1000) {
      fetch(`/api/listings/${listingId}/view`, { method: "POST" }).catch(() => {});
      localStorage.setItem(key, String(now));
    }
  }, [listingId]);

  return null;
}
