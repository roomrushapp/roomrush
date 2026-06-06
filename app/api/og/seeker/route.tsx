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
 * Fetch a remote image and return it as a base64 data URL.
 * Satori must not make its own outbound fetch (redirects / CORS break it).
 * Returns null on any failure so the caller falls back to the monogram.
 */
async function fetchPhotoAsDataUrl(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(tid);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buf = await res.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");
    return `data:${contentType};base64,${b64}`;
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

  try {
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

    // Resolve raw photo URL — photo_urls array (v2) takes priority
    const rawPhotoUrl: string | null =
      Array.isArray(data.photo_urls) && data.photo_urls.length > 0
        ? data.photo_urls[0]
        : data.photo_url ?? null;

    // Pre-fetch as base64 so Satori never makes its own outbound request
    const photoDataUrl: string | null = rawPhotoUrl
      ? await fetchPhotoAsDataUrl(rawPhotoUrl)
      : null;

    return new ImageResponse(
      <ProfileCard
        fontFamily={fontFamily}
        nameAge={nameAge}
        firstName={data.name ?? "?"}
        moveIn={moveIn}
        budget={budget}
        area={area}
        photoDataUrl={photoDataUrl}
      />,
      { width: W, height: H, fonts, headers: CACHE_HEADERS },
    );
  } catch {
    // Any error (DB, render, etc.) → safe branded fallback, never a 500
    return new ImageResponse(<Fallback fontFamily={fontFamily} />, {
      width: W, height: H, fonts, headers: CACHE_HEADERS,
    });
  }
}

// ─── Profile card ──────────────────────────────────────────────────────────────
// Only uses CSS properties Satori reliably supports in production:
//   - No radial-gradient (crashes Satori on some runtimes)
//   - No overflow:hidden on non-root elements with border-radius (clips nothing in Satori)
//   - Photo is clipped via borderRadius on the <img> itself, not a wrapper
//   - lineHeight is an integer (1), not a float

function ProfileCard({
  fontFamily, nameAge, firstName, moveIn, budget, area, photoDataUrl,
}: {
  fontFamily: string;
  nameAge: string;
  firstName: string;
  moveIn: string | null;
  budget: string | null;
  area: string | null;
  photoDataUrl: string | null;
}) {
  return (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        fontFamily,
        background: "#111113",
        position: "relative",
      }}
    >
      {/* Subtle top-right accent — linear-gradient only, no radial */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 500,
          height: 500,
          background: "linear-gradient(225deg, rgba(225,29,72,0.12) 0%, transparent 60%)",
          display: "flex",
        }}
      />

      {/* Left: info column */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 64px",
        }}
      >
        {/* Label pill */}
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
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: ROSE,
              display: "flex",
            }}
          />
          <span
            style={{
              color: ROSE,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.1em",
              display: "flex",
            }}
          >
            ROOM SEEKER · ROOMRUSH
          </span>
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            marginBottom: 36,
            display: "flex",
          }}
        >
          {nameAge}
        </div>

        {/* Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {moveIn && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 20,
                  display: "flex",
                  width: 96,
                }}
              >
                Move in
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 20,
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                {moveIn}
              </span>
            </div>
          )}
          {budget && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 20,
                  display: "flex",
                  width: 96,
                }}
              >
                Budget
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 20,
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                {budget}
              </span>
            </div>
          )}
          {area && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 20,
                  display: "flex",
                  width: 96,
                }}
              >
                Area
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 20,
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                {area}
              </span>
            </div>
          )}
        </div>

        {/* RoomRush wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 52,
          }}
        >
          <span
            style={{ color: "#ffffff", fontSize: 22, fontWeight: 700, display: "flex" }}
          >
            Room
          </span>
          <span
            style={{ color: ROSE, fontSize: 22, fontWeight: 700, display: "flex" }}
          >
            Rush
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 18,
              marginLeft: 4,
              display: "flex",
            }}
          >
            · Munich
          </span>
        </div>
      </div>

      {/* Vertical divider */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          bottom: "10%",
          right: 360,
          width: 1,
          background: "rgba(255,255,255,0.07)",
          display: "flex",
        }}
      />

      {/* Right: photo or monogram */}
      <div
        style={{
          width: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {photoDataUrl ? (
          // Border-radius on <img> itself — Satori clips img correctly this way
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoDataUrl}
            style={{
              width: 240,
              height: 240,
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid rgba(255,255,255,0.12)",
            }}
          />
        ) : (
          <div
            style={{
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "3px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 96,
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                display: "flex",
              }}
            >
              {firstName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Branded fallback (no profile / any error) ────────────────────────────────

function Fallback({ fontFamily }: { fontFamily: string }) {
  return (
    <div
      style={{
        width: W,
        height: H,
        background: "#111113",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span
          style={{ color: "#ffffff", fontSize: 40, fontWeight: 700, display: "flex" }}
        >
          Room
        </span>
        <span
          style={{ color: ROSE, fontSize: 40, fontWeight: 700, display: "flex" }}
        >
          Rush
        </span>
      </div>
      <span
        style={{ color: "rgba(255,255,255,0.4)", fontSize: 22, display: "flex" }}
      >
        Room Seekers · Munich
      </span>
    </div>
  );
}
