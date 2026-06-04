import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@/lib/supabase/server";
import { cleanLocation, formatRent, extractBadges } from "@/lib/og-utils";

export const runtime = "nodejs";

const W = 1200;
const H = 630;
const ROSE = "#e11d48";
const OVERLAY_GRADIENT =
  "linear-gradient(to top, rgba(0,22,14,0.97) 0%, rgba(0,22,14,0.87) 50%, rgba(0,22,14,0.08) 100%)";

// ─── Font loading ─────────────────────────────────────────────────────────────
// Prefer local files (bundled in /public/fonts) — no network dependency in prod.
// Falls back gracefully to system sans-serif if files are absent for any reason.

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

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const id = searchParams.get("id");

  if (!slug && !id) {
    return new Response("Missing slug or id", { status: 400 });
  }

  const fonts = buildFonts();
  const fontFamily = fonts.length > 0 ? "Inter" : "sans-serif";

  // ── Fetch listing ──────────────────────────────────────────────────────────
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(
      "title, rent, location, description, image_urls, available_from, available_until",
    )
    .eq("is_active", true);

  if (slug) query = query.eq("slug", slug);
  else query = query.eq("id", id!);

  const { data: listing } = await query.single();

  // Missing / inactive listing → branded placeholder
  if (!listing) {
    return new ImageResponse(<BrandedFallback fontFamily={fontFamily} />, {
      width: W,
      height: H,
      fonts,
    });
  }

  // ── Derive display values ──────────────────────────────────────────────────
  const title = (listing.title ?? "").trim() || "Room Available";
  const description = listing.description ?? "";
  const location = cleanLocation(listing.location ?? "", title, description);
  const rent = listing.rent ? formatRent(listing.rent) : null;
  const badges = extractBadges({ ...listing, title, description });
  const coverImage: string | null = listing.image_urls?.[0] ?? null;

  // Trim title to fit the card
  const shortTitle = title.length > 60 ? title.slice(0, 57).trimEnd() + "…" : title;

  // Location footer: skip ", Munich" if location already contains Munich
  const locationLine = location.toLowerCase().includes("munich")
    ? location
    : `${location}, Munich`;

  return new ImageResponse(
    <div
      style={{
        width: W,
        height: H,
        position: "relative",
        display: "flex",
        fontFamily,
        overflow: "hidden",
        backgroundColor: "#001c12",
      }}
    >
      {/* ── Background ── */}
      {coverImage ? (
        <img
          src={coverImage}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, #001c12 0%, #00341f 50%, #001c12 100%)",
            display: "flex",
          }}
        />
      )}

      {/* ── Gradient overlay (always present) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: OVERLAY_GRADIENT,
          display: "flex",
        }}
      />

      {/* ── Top-right wordmark ── */}
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 40,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: ROSE,
          }}
        />
        <span
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 20,
            fontWeight: 400,
            letterSpacing: "0.06em",
          }}
        >
          RoomRush
        </span>
      </div>

      {/* ── Bottom content block ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "0 52px 46px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Rent — largest element */}
        {rent && (
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1,
              letterSpacing: "-0.025em",
              marginBottom: 14,
              display: "flex",
            }}
          >
            {rent}
          </div>
        )}

        {/* Short title */}
        <div
          style={{
            fontSize: 34,
            fontWeight: 400,
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1.25,
            marginBottom: badges.length > 0 ? 22 : 28,
            maxWidth: 900,
            display: "flex",
          }}
        >
          {shortTitle}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "nowrap",
              marginBottom: 28,
            }}
          >
            {badges.map((b) => (
              <div
                key={b.key}
                style={{
                  backgroundColor: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.20)",
                  borderRadius: 6,
                  padding: "7px 18px",
                  fontSize: 20,
                  color: "rgba(255,255,255,0.88)",
                  fontWeight: 400,
                  letterSpacing: "0.01em",
                  display: "flex",
                }}
              >
                {b.label}
              </div>
            ))}
          </div>
        )}

        {/* Footer: location + CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: ROSE,
              }}
            />
            <span
              style={{
                fontSize: 20,
                color: "rgba(255,255,255,0.50)",
                fontWeight: 400,
                display: "flex",
              }}
            >
              {locationLine}
            </span>
          </div>

          <div
            style={{
              backgroundColor: ROSE,
              borderRadius: 6,
              padding: "11px 26px",
              fontSize: 20,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "0.01em",
              display: "flex",
            }}
          >
            View listing →
          </div>
        </div>
      </div>
    </div>,
    { width: W, height: H, fonts },
  );
}

// ─── Branded fallback card (missing / inactive listing) ───────────────────────

function BrandedFallback({ fontFamily }: { fontFamily: string }) {
  return (
    <div
      style={{
        width: W,
        height: H,
        background:
          "linear-gradient(135deg, #001c12 0%, #00341f 50%, #001c12 100%)",
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
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: "#e11d48",
          }}
        />
        <span
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "0.04em",
          }}
        >
          RoomRush
        </span>
      </div>
      <span
        style={{
          fontSize: 24,
          color: "rgba(255,255,255,0.50)",
          display: "flex",
        }}
      >
        Munich Room Search
      </span>
    </div>
  );
}
