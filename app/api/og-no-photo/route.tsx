import { ImageResponse } from "next/og";

export const runtime = "edge";

// 1200×630 — standard OG image size (WhatsApp, Telegram, Facebook, Twitter)
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ROOM_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Background room image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ROOM_IMAGE}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(6px)",
            transform: "scale(1.08)",
          }}
        />

        {/* Dark scrim */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
          }}
        />

        {/* Centered label box */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.60)",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "28px 60px",
            maxWidth: "700px",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: "36px",
              fontWeight: 500,
              letterSpacing: "0.04em",
              textAlign: "center",
            }}
          >
            Contact host for pictures
          </span>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
    }
  );
}
