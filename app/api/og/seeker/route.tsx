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
 * Render JSX to PNG via Satori and return a Response.
 *
 * IMPORTANT: `new ImageResponse(jsx)` is LAZY — Satori renders during body
 * streaming, after `new ImageResponse()` returns. A try/catch around
 * `new ImageResponse()` therefore never catches render-time crashes.
 *
 * The fix: call `.arrayBuffer()` inside the try block, which forces Satori
 * to complete the render immediately so any error IS caught.
 */
async function renderImage(
  jsx: React.ReactElement,
  fonts: ReturnType<typeof buildFonts>,
): Promise<Response> {
  const ir = new ImageResponse(jsx, { width: W, height: H, fonts });
  const buf = await ir.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: { "Content-Type": "image/png", ...CACHE_HEADERS },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  const fonts = buildFonts();
  const fontFamily = fonts.length > 0 ? "Inter" : "sans-serif";

  // ── Step 1: fetch profile data (safe) ────────────────────────────────────
  type ProfileRow = {
    name: string;
    age: number | null;
    budget: string | null;
    move_in_date: string | null;
    preferred_area: string | null;
  };
  let profile: ProfileRow | null = null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("room_seeker_profiles")
      .select("name, age, budget, move_in_date, preferred_area")
      .eq("id", id)
      .maybeSingle();
    profile = data as ProfileRow | null;
  } catch {
    // DB unreachable → show branded fallback
  }

  // ── Step 2: build derived display values ─────────────────────────────────
  const nameAge = profile
    ? profile.age
      ? `${profile.name}, ${profile.age}`
      : profile.name
    : null;

  const moveIn =
    profile?.move_in_date ? formatMoveIn(profile.move_in_date) : null;
  const budget = profile?.budget ? formatBudget(profile.budget) : null;

  const VAGUE = new Set(["other", "flexible", "anywhere", "any", ""]);
  const rawArea = profile?.preferred_area?.trim() ?? "";
  const area = rawArea && !VAGUE.has(rawArea.toLowerCase()) ? rawArea : null;

  // ── Step 3: render — innermost fallback always wins ───────────────────────
  // Try full profile card
  if (nameAge) {
    try {
      return await renderImage(
        <ProfileCard
          fontFamily={fontFamily}
          nameAge={nameAge}
          firstName={(profile?.name ?? "?")[0].toUpperCase()}
          moveIn={moveIn}
          budget={budget}
          area={area}
        />,
        fonts,
      );
    } catch {
      // Satori render crash → fall through to branded fallback
    }
  }

  // Branded fallback (no profile / render crash)
  try {
    return await renderImage(<Fallback fontFamily={fontFamily} />, fonts);
  } catch {
    // Absolute last resort — plain text so we never return 500
    return new Response("image unavailable", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// ─── Profile card ─────────────────────────────────────────────────────────────
// Rules kept for Satori compatibility:
//   • No radial-gradient
//   • No overflow:hidden on non-root elements with border-radius
//   • No flex:1 (use explicit widths instead)
//   • No percentage strings in absolute positioning
//   • lineHeight is integer 1, not a float
//   • No profile photo (avoids outbound fetch / base64 issues entirely)

function ProfileCard({
  fontFamily,
  nameAge,
  firstName,
  moveIn,
  budget,
  area,
}: {
  fontFamily: string;
  nameAge: string;
  firstName: string;
  moveIn: string | null;
  budget: string | null;
  area: string | null;
}) {
  return (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        flexDirection: "row",
        fontFamily,
        backgroundColor: "#111113",
      }}
    >
      {/* Left info column — explicit width, no flex:1 */}
      <div
        style={{
          width: 820,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 64px",
        }}
      >
        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: ROSE,
              display: "flex",
            }}
          />
          <span style={{ color: ROSE, fontSize: 16, fontWeight: 700, letterSpacing: "0.1em", display: "flex" }}>
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

        {/* RoomRush wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 52 }}>
          <span style={{ color: "#ffffff", fontSize: 22, fontWeight: 700, display: "flex" }}>Room</span>
          <span style={{ color: ROSE, fontSize: 22, fontWeight: 700, display: "flex" }}>Rush</span>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 18, marginLeft: 4, display: "flex" }}>· Munich</span>
        </div>
      </div>

      {/* Right monogram column */}
      <div
        style={{
          width: 380,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.03)",
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: "rgba(255,255,255,0.35)",
              display: "flex",
            }}
          >
            {firstName}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Branded fallback ─────────────────────────────────────────────────────────

function Fallback({ fontFamily }: { fontFamily: string }) {
  return (
    <div
      style={{
        width: W,
        height: H,
        backgroundColor: "#111113",
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
        Looking for a room in Munich
      </span>
    </div>
  );
}
