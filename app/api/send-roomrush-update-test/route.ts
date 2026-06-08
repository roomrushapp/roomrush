import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// TEST-ONLY route. Hardcoded to a single recipient — never sends to subscribers.
// Protected by MANUAL_TRIGGER_SECRET (same pattern as send-newsletter).
const TEST_RECIPIENT = "samadfaizan46@gmail.com";

// Static room seeker card data matching the existing public profile on /room-seekers.
// Using the Supabase storage URL for the real profile photo.
const SEEKER_PHOTO =
  "https://ddotqzkslzacluwznxco.supabase.co/storage/v1/object/public/room-seeker-photos/faizan-profile.jpg";

function authorize(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  const querySecret = new URL(request.url).searchParams.get("secret");
  if (
    process.env.MANUAL_TRIGGER_SECRET &&
    querySecret === process.env.MANUAL_TRIGGER_SECRET
  ) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true;

  return false;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured." },
      { status: 500 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = buildEmailHtml();

  const { error } = await resend.emails.send({
    from: "RoomRush Munich <hello@getroomrush.de>",
    to: TEST_RECIPIENT,
    subject: "RoomRush update: Room Seeker profiles + WhatsApp alerts",
    html,
  });

  if (error) {
    console.error("[UpdateTest] Send failed:", error);
    return NextResponse.json(
      { error: "Send failed", detail: (error as { message?: string }).message ?? JSON.stringify(error) },
      { status: 500 }
    );
  }

  console.log(`[UpdateTest] Test email sent to ${TEST_RECIPIENT}`);
  return NextResponse.json({
    ok: true,
    note: "TEST ONLY — sent to one hardcoded recipient, no subscribers affected.",
    recipient: TEST_RECIPIENT,
  });
}

function buildEmailHtml(): string {
  const seekerCard = `
    <div style="background:#1c1c1f;border-radius:16px;overflow:hidden;max-width:320px;margin:0 auto 8px auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="position:relative;">
        <img
          src="${SEEKER_PHOTO}"
          alt="Faizan"
          width="320"
          style="width:100%;max-width:320px;height:180px;object-fit:cover;display:block;"
        />
        <div style="position:absolute;top:10px;left:10px;background:#e11d48;color:#fff;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:3px 9px;border-radius:20px;">
          Looking for a room
        </div>
      </div>
      <div style="padding:16px;">
        <p style="font-size:16px;font-weight:700;color:#fff;margin:0 0 10px 0;">Faizan, 23</p>
        <table style="width:100%;border-collapse:collapse;font-size:12px;color:#a1a1aa;margin-bottom:12px;">
          <tr>
            <td style="padding:3px 0;color:#71717a;width:70px;">Move in</td>
            <td style="padding:3px 0;color:#d4d4d8;">August 2026</td>
          </tr>
          <tr>
            <td style="padding:3px 0;color:#71717a;">Budget</td>
            <td style="padding:3px 0;color:#d4d4d8;">€760/month</td>
          </tr>
          <tr>
            <td style="padding:3px 0;color:#71717a;">Area</td>
            <td style="padding:3px 0;color:#d4d4d8;">Flexible / Anywhere in Munich</td>
          </tr>
        </table>
        <p style="font-size:12px;color:#71717a;margin:0 0 14px 0;line-height:1.5;font-style:italic;">
          "Hi, I'm looking for a room or WG in Munich. I'm flexible with the area and happy to share more..."
        </p>
        <div style="display:flex;gap:8px;">
          <a href="https://www.getroomrush.de/room-seekers" style="flex:1;display:inline-block;text-align:center;background:#e11d48;color:#fff;font-size:12px;font-weight:600;padding:8px 0;border-radius:8px;text-decoration:none;">View profile</a>
          <a href="https://www.getroomrush.de/room-seekers" style="flex:1;display:inline-block;text-align:center;background:#27272a;color:#d4d4d8;font-size:12px;font-weight:600;padding:8px 0;border-radius:8px;text-decoration:none;">Contact</a>
        </div>
      </div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>RoomRush Update</title>
</head>
<body style="margin:0;padding:0;background:#111113;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#18181b;border-radius:20px;overflow:hidden;border:1px solid #27272a;">

    <!-- Header -->
    <div style="background:#09090b;padding:28px 32px 24px 32px;">
      <p style="color:#e11d48;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 6px 0;">RoomRush Update</p>
      <p style="color:#fff;font-size:26px;font-weight:800;margin:0 0 10px 0;line-height:1.2;">New ways to find a room faster in Munich</p>
      <p style="color:#a1a1aa;font-size:14px;margin:0;line-height:1.6;">
        We have launched Room Seeker profiles, updated the free digest schedule, and are moving instant alerts to WhatsApp for faster delivery.
      </p>
    </div>

    <div style="padding:32px;">

      <!-- ── Section 1: Room Seeker profiles ── -->
      <div style="margin-bottom:36px;">
        <p style="color:#e11d48;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px 0;">Room Seekers</p>
        <h2 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 10px 0;">Let listers find you</h2>
        <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
          You can now create a Room Seeker profile with your budget, move in date, area, and intro so people with available rooms can contact you directly.
        </p>

        <!-- Seeker card preview -->
        ${seekerCard}

        <p style="font-size:11px;color:#52525b;text-align:center;margin:8px 0 24px 0;">Example profile — yours could look like this</p>

        <div style="text-align:center;">
          <a href="https://www.getroomrush.de/room-seekers" style="display:inline-block;background:#e11d48;color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:100px;text-decoration:none;letter-spacing:0.01em;">
            Create your free profile →
          </a>
        </div>
      </div>

      <div style="border-top:1px solid #27272a;margin:0 0 36px 0;"></div>

      <!-- ── Section 2: WhatsApp Priority Alerts ── -->
      <div style="margin-bottom:36px;">
        <p style="color:#e11d48;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px 0;">Priority Alerts</p>
        <h2 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 10px 0;">Instant alerts are moving to WhatsApp</h2>
        <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 20px 0;">
          Listings move fast, so Priority Alerts are being moved to WhatsApp for better speed and visibility.
        </p>

        <!-- Benefits -->
        <div style="background:#1c1c1f;border-radius:14px;padding:20px 24px;margin-bottom:20px;">
          ${[
            "Instant alerts when listings are posted",
            "See listings before the next free digest",
            "Direct listing links",
            "Private WhatsApp group",
          ]
            .map(
              (b) => `
          <div style="display:flex;align-items:center;gap:10px;padding:7px 0;">
            <span style="color:#e11d48;font-size:16px;flex-shrink:0;">✓</span>
            <span style="color:#d4d4d8;font-size:14px;">${b}</span>
          </div>`
            )
            .join("")}
        </div>

        <p style="color:#71717a;font-size:12px;margin:0 0 16px 0;text-align:center;">
          No payment today. Planned price: €2.99/month.
        </p>

        <div style="text-align:center;">
          <a href="https://www.getroomrush.de/newsletter" style="display:inline-block;background:#25d366;color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:100px;text-decoration:none;">
            Join the waitlist →
          </a>
        </div>
      </div>

      <div style="border-top:1px solid #27272a;margin:0 0 36px 0;"></div>

      <!-- ── Section 3: Free digest timing ── -->
      <div style="margin-bottom:8px;">
        <p style="color:#e11d48;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px 0;">Digest Schedule</p>
        <h2 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 10px 0;">Free digest timing update</h2>
        <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0;">
          The free RoomRush digest is now sent on <strong style="color:#d4d4d8;">Monday, Wednesday, and Friday at 10 pm</strong>. This keeps things less noisy while still helping you catch up on the latest rooms.
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#09090b;padding:24px 32px;border-top:1px solid #27272a;">
      <p style="color:#d4d4d8;font-size:14px;font-weight:600;margin:0 0 2px 0;">RoomRush</p>
      <p style="color:#52525b;font-size:12px;margin:0 0 16px 0;">Munich rooms, sublets, and room search tools.</p>
      <p style="color:#71717a;font-size:13px;margin:0 0 16px 0;line-height:1.5;">
        Thanks for being part of RoomRush.
      </p>
      <p style="color:#3f3f46;font-size:11px;margin:0;line-height:1.6;">
        You are receiving this because you signed up for RoomRush room alerts.
        &nbsp;·&nbsp;
        <a href="https://www.getroomrush.de/newsletter" style="color:#3f3f46;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
