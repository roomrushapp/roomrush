import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { Resend } from "resend";

// TEST-ONLY route. Hardcoded to a single recipient — never sends to subscribers.
// Protected by MANUAL_TRIGGER_SECRET / CRON_SECRET (same pattern as send-newsletter).
const TEST_RECIPIENT = "samadfaizan46@gmail.com";

// Public assets from /public served at the production domain.
// app/icon.png is the running man icon, served by Next.js at /icon.png.
const ICON_URL = "https://www.getroomrush.de/icon.png";

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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

  // Fetch the active Room Seeker profile photo URL from the DB.
  // We only read from room_seeker_profiles — no subscriber data is touched.
  let seekerPhotoUrl: string | null = null;
  try {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from("room_seeker_profiles")
      .select("photo_urls, photo_url")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      if (Array.isArray(data.photo_urls) && data.photo_urls.length > 0) {
        seekerPhotoUrl = data.photo_urls[0];
      } else if (data.photo_url) {
        seekerPhotoUrl = data.photo_url;
      }
    }
  } catch {
    // Non-fatal — fall back to placeholder if DB read fails
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = buildEmailHtml(seekerPhotoUrl);

  const { error } = await resend.emails.send({
    from: "RoomRush Munich <hello@getroomrush.de>",
    to: TEST_RECIPIENT,
    subject: "New ways to find a room faster in Munich",
    html,
  });

  if (error) {
    console.error("[UpdateTest] Send failed:", error);
    return NextResponse.json(
      {
        error: "Send failed",
        detail:
          (error as { message?: string }).message ?? JSON.stringify(error),
      },
      { status: 500 }
    );
  }

  console.log(`[UpdateTest] Test email sent to ${TEST_RECIPIENT} seekerPhoto=${seekerPhotoUrl ?? "placeholder"}`);
  return NextResponse.json({
    ok: true,
    note: "TEST ONLY — sent to one hardcoded recipient, no subscribers affected.",
    recipient: TEST_RECIPIENT,
    seekerPhotoUrl,
  });
}

// ---------------------------------------------------------------------------
// Email HTML
// ---------------------------------------------------------------------------

const PINK        = "#e11d48";
const BG_BODY     = "#0e0e10";
const BG_CARD     = "#18181b";
const BG_HEADER   = "#09090b";
const BG_INNER    = "#1f1f23";
const BORDER      = "#2a2a2d";
const TEXT_WHITE  = "#f4f4f5";
const TEXT_MUTED  = "#a1a1aa";
const TEXT_DIM    = "#71717a";
const TEXT_FAINT  = "#3f3f46";
const FONT        = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

function buildEmailHtml(seekerPhotoUrl: string | null): string {

  // ── Room Seeker photo area ────────────────────────────────────────────────
  const photoArea = seekerPhotoUrl
    ? `<img src="${seekerPhotoUrl}" alt="Faizan" width="560"
         style="width:100%;max-width:560px;height:220px;object-fit:cover;display:block;border:0;outline:none;">`
    : `<div style="width:100%;height:200px;background:linear-gradient(135deg,#1a1a1e 0%,#27272b 100%);text-align:center;padding-top:52px;box-sizing:border-box;">
         <div style="width:60px;height:60px;border-radius:50%;background:rgba(225,29,72,0.15);border:2px solid rgba(225,29,72,0.3);margin:0 auto 10px auto;line-height:56px;">
           <span style="color:${PINK};font-size:24px;font-weight:800;">F</span>
         </div>
         <p style="color:#52525b;font-size:11px;margin:0;font-family:${FONT};">Profile photo</p>
       </div>`;

  // ── Room Seeker card ──────────────────────────────────────────────────────
  const seekerCard = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="border-collapse:collapse;border-radius:14px;overflow:hidden;border:1px solid ${BORDER};margin-bottom:8px;background-color:${BG_INNER};">
      <tr>
        <td style="background-color:${BG_INNER};border-radius:14px;overflow:hidden;padding:0;position:relative;">
          <!-- badge overlay row -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding:0;line-height:0;font-size:0;background-color:${BG_INNER};">
                <!-- stack: photo then badge positioned via inner table -->
                <div style="position:relative;line-height:0;font-size:0;">
                  ${photoArea}
                  <div style="position:absolute;top:12px;left:12px;">
                    <span style="background:${PINK};color:#fff;font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;padding:4px 10px;border-radius:20px;font-family:${FONT};">
                      Looking for a room
                    </span>
                  </div>
                </div>
              </td>
            </tr>
            <!-- Name -->
            <tr>
              <td style="padding:18px 20px 0 20px;background-color:${BG_INNER};">
                <p style="font-size:18px;font-weight:700;color:${TEXT_WHITE};margin:0;font-family:${FONT};">Faizan, 23</p>
              </td>
            </tr>
            <!-- Details table -->
            <tr>
              <td style="padding:14px 20px 0 20px;background-color:${BG_INNER};">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="color:${TEXT_DIM};font-size:13px;padding:3px 0;width:74px;font-family:${FONT};">Move in</td>
                    <td style="color:${TEXT_WHITE};font-size:13px;font-weight:500;padding:3px 0;font-family:${FONT};">August 2026</td>
                  </tr>
                  <tr>
                    <td style="color:${TEXT_DIM};font-size:13px;padding:3px 0;font-family:${FONT};">Budget</td>
                    <td style="color:${TEXT_WHITE};font-size:13px;font-weight:500;padding:3px 0;font-family:${FONT};">&#8364;760/month</td>
                  </tr>
                  <tr>
                    <td style="color:${TEXT_DIM};font-size:13px;padding:3px 0;font-family:${FONT};">Area</td>
                    <td style="color:${TEXT_WHITE};font-size:13px;font-weight:500;padding:3px 0;font-family:${FONT};">Flexible / Anywhere in Munich</td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Intro -->
            <tr>
              <td style="padding:14px 20px 0 20px;background-color:${BG_INNER};">
                <p style="font-size:13px;color:${TEXT_DIM};line-height:1.55;margin:0;font-style:italic;border-left:2px solid rgba(225,29,72,0.3);padding-left:10px;font-family:${FONT};">
                  &#8220;Hi, I&#8217;m looking for a room or WG in Munich. I&#8217;m flexible with the area and happy to share more&#8230;&#8221;
                </p>
              </td>
            </tr>
            <!-- Buttons -->
            <tr>
              <td style="padding:16px 20px 20px 20px;border-top:1px solid rgba(255,255,255,0.07);margin-top:16px;background-color:${BG_INNER};">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td width="47%" style="padding:0;">
                      <a href="https://www.getroomrush.de/room-seekers"
                         style="display:block;text-align:center;background:rgba(255,255,255,0.07);color:${TEXT_WHITE};font-size:13px;font-weight:600;padding:10px 0;border-radius:9px;text-decoration:none;border:1px solid rgba(255,255,255,0.1);font-family:${FONT};">
                        View profile
                      </a>
                    </td>
                    <td width="6%" style="padding:0;">&nbsp;</td>
                    <td width="47%" style="padding:0;">
                      <a href="https://www.getroomrush.de/room-seekers"
                         style="display:block;text-align:center;background:${PINK};color:#fff;font-size:13px;font-weight:600;padding:10px 0;border-radius:9px;text-decoration:none;font-family:${FONT};">
                        Contact
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  // ── Benefits ──────────────────────────────────────────────────────────────
  const benefits = [
    "Instant alerts when listings are posted",
    "See listings before the next free digest",
    "Direct listing links",
    "Private WhatsApp group",
  ];

  const benefitsHtml = benefits.map((b) => `
    <tr>
      <td width="22" style="padding:5px 0;color:${PINK};font-size:14px;vertical-align:top;font-family:${FONT};">&#10003;</td>
      <td style="padding:5px 0;color:#d4d4d8;font-size:14px;line-height:1.5;font-family:${FONT};">${b}</td>
    </tr>`).join("");

  // ── Section divider helper ────────────────────────────────────────────────
  const divider = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;padding:0;">
      <tr><td style="height:1px;background-color:${BORDER};font-size:0;line-height:0;padding:0;">&nbsp;</td></tr>
    </table>`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>RoomRush Update</title>
  <!--[if !mso]><!-->
  <style type="text/css">
    :root { color-scheme: dark; }
    /* Gmail app dark mode override */
    u + .body .email-wrapper { background-color: ${BG_BODY} !important; }
    u + .body .email-card    { background-color: ${BG_CARD} !important; }
    u + .body .email-header  { background-color: ${BG_HEADER} !important; }
    u + .body .email-footer  { background-color: ${BG_HEADER} !important; }
    u + .body .inner-card    { background-color: ${BG_INNER} !important; }
    u + .body .seeker-card   { background-color: ${BG_INNER} !important; }
    /* Apple Mail / iOS Mail dark mode */
    @media (prefers-color-scheme: dark) {
      body, .email-wrapper { background-color: ${BG_BODY} !important; }
      .email-card          { background-color: ${BG_CARD} !important; border-color: ${BORDER} !important; }
      .email-header        { background-color: ${BG_HEADER} !important; }
      .email-footer        { background-color: ${BG_HEADER} !important; }
      .inner-card          { background-color: ${BG_INNER} !important; }
      .seeker-card td      { background-color: ${BG_INNER} !important; }
    }
  </style>
  <!--<![endif]-->
</head>
<body class="body"
      style="margin:0;padding:0;background-color:${BG_BODY};-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;"
      bgcolor="${BG_BODY}">

<!-- Hidden preheader -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:${BG_BODY};">
  Room Seeker profiles are live. Free digests now go out Mon, Wed, Fri, and instant alerts are moving to WhatsApp.&#847;&zwj;&#847;&zwj;&#847;&zwj;&#847;&zwj;&#847;&zwj;&#847;&zwj;&#847;
</div>

<table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="border-collapse:collapse;background-color:${BG_BODY};" bgcolor="${BG_BODY}">
  <tr>
    <td align="center" style="padding:28px 12px 40px 12px;background-color:${BG_BODY};" bgcolor="${BG_BODY}">

      <!-- ── Outer card ─────────────────────────────────────────────────── -->
      <table class="email-card" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;max-width:600px;background-color:${BG_CARD};border-radius:18px;overflow:hidden;border:1px solid ${BORDER};"
             bgcolor="${BG_CARD}">

        <!-- ── HEADER ─────────────────────────────────────────────────── -->
        <tr>
          <td class="email-header"
              style="background-color:${BG_HEADER};padding:28px 32px 28px 32px;"
              bgcolor="${BG_HEADER}">
            <!-- Icon + label row -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:18px;">
              <tr>
                <td style="vertical-align:middle;">
                  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="vertical-align:middle;padding-right:8px;">
                        <img src="${ICON_URL}" alt="" width="22" height="22"
                             style="width:22px;height:22px;display:block;border:0;outline:none;text-decoration:none;">
                      </td>
                      <td style="vertical-align:middle;">
                        <span style="color:${PINK};font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-family:${FONT};">
                          Update
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <!-- Title -->
            <h1 style="color:${TEXT_WHITE};font-size:26px;font-weight:800;line-height:1.25;margin:0 0 14px 0;font-family:${FONT};">
              New ways to find a room faster in Munich
            </h1>
            <!-- Intro -->
            <p style="color:${TEXT_MUTED};font-size:14px;line-height:1.7;margin:0;font-family:${FONT};">
              We have launched Room Seeker profiles, updated the free digest schedule, and are moving instant alerts to WhatsApp for faster delivery.
            </p>
          </td>
        </tr>

        <!-- ── BODY ───────────────────────────────────────────────────── -->
        <tr>
          <td style="padding:36px 32px;background-color:${BG_CARD};" bgcolor="${BG_CARD}">

            <!-- ── SECTION 1: Room Seekers ── -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border-collapse:collapse;margin-bottom:36px;">
              <tr>
                <td>
                  <p style="color:${PINK};font-size:10px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;margin:0 0 6px 0;font-family:${FONT};">
                    Room Seekers
                  </p>
                  <h2 style="color:${TEXT_WHITE};font-size:20px;font-weight:700;margin:0 0 10px 0;font-family:${FONT};">
                    Let listers find you
                  </h2>
                  <p style="color:${TEXT_MUTED};font-size:14px;line-height:1.7;margin:0 0 26px 0;font-family:${FONT};">
                    Create a Room Seeker profile with your budget, move in date, area, intro, and contact method so people with available rooms can contact you directly.
                  </p>

                  ${seekerCard}

                  <p style="font-size:11px;color:${TEXT_FAINT};text-align:center;margin:10px 0 28px 0;font-family:${FONT};">
                    Example profile — yours could look like this
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td align="center">
                        <a href="https://www.getroomrush.de/room-seekers"
                           style="display:inline-block;background:${PINK};color:#fff;font-size:14px;font-weight:600;padding:13px 30px;border-radius:100px;text-decoration:none;letter-spacing:0.01em;font-family:${FONT};">
                          Create your free profile &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <div style="margin-bottom:36px;">${divider}</div>

            <!-- ── SECTION 2: Priority Alerts ── -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border-collapse:collapse;margin-bottom:36px;">
              <tr>
                <td>
                  <p style="color:${PINK};font-size:10px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;margin:0 0 6px 0;font-family:${FONT};">
                    Priority Alerts
                  </p>
                  <h2 style="color:${TEXT_WHITE};font-size:20px;font-weight:700;margin:0 0 10px 0;font-family:${FONT};">
                    Instant alerts are moving to WhatsApp
                  </h2>
                  <p style="color:${TEXT_MUTED};font-size:14px;line-height:1.7;margin:0 0 22px 0;font-family:${FONT};">
                    Listings move fast, so Priority Alerts are being moved to WhatsApp for better speed and visibility.
                  </p>

                  <table class="inner-card" width="100%" cellpadding="0" cellspacing="0" border="0"
                         style="border-collapse:collapse;background-color:${BG_INNER};border-radius:13px;margin-bottom:20px;"
                         bgcolor="${BG_INNER}">
                    <tr>
                      <td style="padding:18px 22px;background-color:${BG_INNER};" bgcolor="${BG_INNER}">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                          ${benefitsHtml}
                        </table>
                      </td>
                    </tr>
                  </table>

                  <p style="color:${TEXT_DIM};font-size:12px;margin:0 0 18px 0;text-align:center;font-family:${FONT};">
                    No payment today. Planned price: &#8364;2.99/month.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td align="center">
                        <a href="https://www.getroomrush.de/newsletter#priority-alerts"
                           style="display:inline-block;background:${PINK};color:#fff;font-size:14px;font-weight:600;padding:13px 30px;border-radius:100px;text-decoration:none;font-family:${FONT};">
                          Join the waitlist &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <div style="margin-bottom:36px;">${divider}</div>

            <!-- ── SECTION 3: Digest timing ── -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td>
                  <p style="color:${PINK};font-size:10px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;margin:0 0 6px 0;font-family:${FONT};">
                    Digest Schedule
                  </p>
                  <h2 style="color:${TEXT_WHITE};font-size:20px;font-weight:700;margin:0 0 10px 0;font-family:${FONT};">
                    Free digest timing update
                  </h2>
                  <p style="color:${TEXT_MUTED};font-size:14px;line-height:1.7;margin:0;font-family:${FONT};">
                    The free RoomRush digest is now sent on
                    <strong style="color:${TEXT_WHITE};">Monday, Wednesday, and Friday at 10&nbsp;pm</strong>.
                    This keeps things less noisy while still helping you catch up on the latest rooms.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── FOOTER ─────────────────────────────────────────────────── -->
        <tr>
          <td class="email-footer"
              style="background-color:${BG_HEADER};padding:24px 32px;border-top:1px solid ${BORDER};"
              bgcolor="${BG_HEADER}">
            <p style="color:#52525b;font-size:12px;margin:0 0 4px 0;font-family:${FONT};">
              Munich rooms, sublets, and room search tools.
            </p>
            <p style="color:${TEXT_DIM};font-size:13px;line-height:1.5;margin:0 0 16px 0;font-family:${FONT};">
              Thanks for being part of RoomRush.
            </p>
            <p style="color:${TEXT_FAINT};font-size:11px;margin:0;line-height:1.7;font-family:${FONT};">
              You are receiving this because you signed up for room alerts.
              &nbsp;&middot;&nbsp;
              <a href="https://www.getroomrush.de/newsletter"
                 style="color:${TEXT_FAINT};text-decoration:underline;font-family:${FONT};">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
      <!-- /outer card -->

    </td>
  </tr>
</table>

</body>
</html>`;
}
