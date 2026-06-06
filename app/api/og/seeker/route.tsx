import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const W = 1200;
const H = 630;
const ROSE = "#e11d48";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

function loadLocalFont(filename: string): ArrayBuffer | null {
  try {
    const path = join(process.cwd(), "public", "fonts", filename);
    const buf = readFileSync(path);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
}

function buildFonts() {
  const regular = loadLocalFont("inter-400.woff2");
  const bold = loadLocalFont("inter-700.woff2");
  const list: { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[] = [];
  if (regular) list.push({ name: "Inter", data: regular, weight: 400, style: "normal" });
  if (bold) list.push({ name: "Inter", data: bold, weight: 700, style: "normal" });
  return list;
}

function formatMoveIn(value: string): string {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, 1);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return value;
}

function formatBudget(raw: string): string {
  const t = raw.trim();
  if (/^\d+$/.test(t)) return `€${t}`;
  if (/^\d/.test(t) && !t.startsWith("€")) return `€${t}`;
  return t;
}

/**
 * Pre-fetch a remote image and return it as a base64 data URL so Satori
 * never needs to make its own outbound fetch (which can fail silently on
 * redirects, CORS, or timeouts and crash the whole ImageResponse).
 *
 * Returns null on any error so the caller can fall back to a monogram.
 */
async function fetchPhotoAsDataUrl(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  const fonts = buildFonts();
  const fontFamily = fonts.length > 0 ? "Inter" : "sans-serif";

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("room_seeker_profiles")
    .select("name, age, budget, move_in_date, preferred_area, photo_urls, photo_url")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return new ImageResponse(<Fallback fontFamily={fontFamily} />, {
      width: W, height: H, fonts, headers: CACHE_HEADERS,
    });
  }

  const nameAge = data.age ? `${data.name}, ${data.age}` : data.name;
  const moveIn = data.move_in_date ? formatMoveIn(data.move_in_date) : null;
  const budget = data.budget ? formatBudget(data.budget) : null;
  const VAGUE = new Set(["other", "flexible", "anywhere", "any", ""]);
  const rawArea = data.preferred_area?.trim() ?? "";
  const area = rawArea && !VAGUE.has(rawArea.toLowerCase()) ? rawArea : null;

  // Resolve the raw photo URL (photo_urls v2 array takes priority over legacy photo_url)
  const rawPhotoUrl: string | null =
    (Array.isArray(data.photo_urls) && data.photo_urls.length > 0)
      ? data.photo_urls[0]
      : data.photo_url ?? null;

  // Pre-fetch the photo as a data URL so Satori doesn't have to fetch it
  // itself (which can crash ImageResponse on redirect / CORS / timeout).
  const photoDataUrl: string | null = rawPhotoUrl
    ? await fetchPhotoAsDataUrl(rawPhotoUrl)
    : null;

  const jsx = (
    <div
      style={{
        width: W, height: H,
        display: "flex",
        fontFamily,
        background: "#111113",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle gradient accent */}
      <div
        style={{
          position: "absolute",
          top: -200, right: -100,
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(225,29,72,0.15) 0%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* Left: profile info */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 64px",
        }}
      >
        {/* Label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 8, height: 8,
              borderRadius: "50%",
              backgroundColor: ROSE,
              display: "flex",
            }}
          />
          <span style={{ color: ROSE, fontSize: 16, fontWeight: 700, letterSpacing: "0.1em", display: "flex" }}>
            ROOM SEEKER · ROOMRUSH
          </span>
        </div>

        {/* Name + age */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 32,
            display: "flex",
          }}
        >
          {nameAge}
        </div>

        {/* Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {moveIn && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 20, display: "flex", width: 96 }}>Move in</span>
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 20, fontWeight: 700, display: "flex" }}>{moveIn}</span>
            </div>
          )}
          {budget && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 20, display: "flex", width: 96 }}>Budget</span>
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 20, fontWeight: 700, display: "flex" }}>{budget}</span>
            </div>
          )}
          {area && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 20, display: "flex", width: 96 }}>Area</span>
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 20, fontWeight: 700, display: "flex" }}>{area}</span>
            </div>
          )}
        </div>

        {/* RoomRush wordmark at bottom */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 48,
          }}
        >
          <span style={{ color: "#ffffff", fontSize: 22, fontWeight: 700, display: "flex" }}>Room</span>
          <span style={{ color: ROSE, fontSize: 22, fontWeight: 700, display: "flex" }}>Rush</span>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 18, marginLeft: 4, display: "flex" }}>· Munich</span>
        </div>
      </div>

      {/* Right: photo or monogram */}
      <div
        style={{
          width: 340,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px 60px 0",
        }}
      >
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.06)",
            border: "3px solid rgba(255,255,255,0.1)",
            position: "relative",
          }}
        >
          {photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoDataUrl}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span
              style={{
                fontSize: 100,
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                display: "flex",
              }}
            >
              {(data.name || "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Vertical divider */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          bottom: "10%",
          right: 388,
          width: 1,
          background: "rgba(255,255,255,0.07)",
          display: "flex",
        }}
      />
    </div>
  );

  try {
    return new ImageResponse(jsx, { width: W, height: H, fonts, headers: CACHE_HEADERS });
  } catch {
    // If ImageResponse itself fails for any reason, return a safe branded fallback
    return new ImageResponse(<Fallback fontFamily={fontFamily} />, {
      width: W, height: H, fonts, headers: CACHE_HEADERS,
    });
  }
}

function Fallback({ fontFamily }: { fontFamily: string }) {
  return (
    <div
      style={{
        width: W, height: H,
        background: "#111113",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ color: "#ffffff", fontSize: 40, fontWeight: 700, display: "flex" }}>Room</span>
        <span style={{ color: ROSE, fontSize: 40, fontWeight: 700, display: "flex" }}>Rush</span>
      </div>
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 22, display: "flex" }}>
        Room Seekers · Munich
      </span>
    </div>
  );
}
