import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// TEST-ONLY route. Hardcoded to a single recipient — never sends to subscribers.
// Protected by MANUAL_TRIGGER_SECRET (same pattern as send-newsletter).
const TEST_RECIPIENT = "samadfaizan46@gmail.com";

// Public assets served from /public at the production domain.
const LOGO_URL = "https://www.getroomrush.de/roomrush-logo.png";

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
      {
        error: "Send failed",
        detail:
          (error as { message?: string }).message ?? JSON.stringify(error),
      },
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

// ---------------------------------------------------------------------------
// Email HTML
// ---------------------------------------------------------------------------

const PINK = "#e11d48";
const BG_BODY = "#0e0e10";
const BG_CARD = "#18181b";
const BG_HEADER = "#09090b";
const BG_INNER_CARD = "#1c1c1f";
const BORDER = "#2a2a2d";
const TEXT_WHITE = "#f4f4f5";
const TEXT_MUTED = "#a1a1aa";
const TEXT_DIM = "#71717a";
const TEXT_FAINT = "#3f3f46";

function buildEmailHtml(): string {
  // ── Room Seeker preview card ──────────────────────────────────────────────
  // The profile photo requires an authenticated Supabase URL that email
  // clients cannot access. Instead we render a branded placeholder so the
  // card never shows a broken image.
  const seekerPhotoPlaceholder = `
    <div style="width:100%;height:200px;background:linear-gradient(135deg,#1a1a1e 0%,#27272b 100%);display:flex;align-items:center;justify-content:center;position:relative;">
      <div style="text-align:center;">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(225,29,72,0.15);border:2px solid rgba(225,29,72,0.35);margin:0 auto 10px auto;display:flex;align-items:center;justify-content:center;">
          <span style="color:#e11d48;font-size:26px;font-weight:800;line-height:1;">F</span>
        </div>
        <p style="color:#52525b;font-size:11px;margin:0;">Profile photo</p>
      </div>
      <div style="position:absolute;top:12px;left:12px;background:${PINK};color:#fff;font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;padding:4px 10px;border-radius:20px;">
        Looking for a room
      </div>
    </div>`;

  const seekerCard = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:6px;">
      <tr>
        <td style="background:${BG_INNER_CARD};border-radius:16px;overflow:hidden;border:1px solid ${BORDER};">
          <!-- Photo area -->
          ${seekerPhotoPlaceholder}
          <!-- Details -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding:20px 20px 0 20px;">
                <p style="font-size:18px;font-weight:700;color:${TEXT_WHITE};margin:0 0 14px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Faizan, 23</p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:14px;">
                  <tr>
                    <td style="padding:4px 0;color:${TEXT_DIM};font-size:13px;width:76px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Move in</td>
                    <td style="padding:4px 0;color:${TEXT_WHITE};font-size:13px;font-weight:500;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">August 2026</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:${TEXT_DIM};font-size:13px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Budget</td>
                    <td style="padding:4px 0;color:${TEXT_WHITE};font-size:13px;font-weight:500;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">€760/month</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:${TEXT_DIM};font-size:13px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Area</td>
                    <td style="padding:4px 0;color:${TEXT_WHITE};font-size:13px;font-weight:500;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Flexible / Anywhere in Munich</td>
                  </tr>
                </table>
                <p style="font-size:13px;color:${TEXT_DIM};line-height:1.55;margin:0 0 16px 0;font-style:italic;border-left:2px solid rgba(225,29,72,0.35);padding-left:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                  &#8220;Hi, I&#8217;m looking for a room or WG in Munich. I&#8217;m flexible with the area and happy to share more&#8230;&#8221;
                </p>
              </td>
            </tr>
            <!-- Button row -->
            <tr>
              <td style="padding:14px 20px 20px 20px;border-top:1px solid rgba(255,255,255,0.07);">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td width="48%" style="padding-right:6px;">
                      <a href="https://www.getroomrush.de/room-seekers"
                         style="display:block;text-align:center;background:rgba(255,255,255,0.07);color:${TEXT_WHITE};font-size:13px;font-weight:600;padding:10px 0;border-radius:10px;text-decoration:none;border:1px solid rgba(255,255,255,0.1);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                        View profile
                      </a>
                    </td>
                    <td width="4%">&nbsp;</td>
                    <td width="48%" style="padding-left:6px;">
                      <a href="https://www.getroomrush.de/room-seekers"
                         style="display:block;text-align:center;background:${PINK};color:#fff;font-size:13px;font-weight:600;padding:10px 0;border-radius:10px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
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

  // ── Benefits list ─────────────────────────────────────────────────────────
  const benefits = [
    "Instant alerts when listings are posted",
    "See listings before the next free digest",
    "Direct listing links",
    "Private WhatsApp group",
  ];

  const benefitsHtml = benefits
    .map(
      (b) => `
    <tr>
      <td width="22" style="padding:6px 0;color:${PINK};font-size:15px;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">&#10003;</td>
      <td style="padding:6px 0;color:#d4d4d8;font-size:14px;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${b}</td>
    </tr>`
    )
    .join("");

  // ── Full HTML ─────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>RoomRush Update</title>
  <!--[if !mso]><!-->
  <style>
    :root { color-scheme: dark; }
    body, table, td, p, a, span { color-scheme: dark; }
    /* Force dark background even in Gmail dark mode */
    u + .body .email-wrapper { background: ${BG_BODY} !important; }
    @media (prefers-color-scheme: dark) {
      body { background-color: ${BG_BODY} !important; }
      .email-wrapper { background-color: ${BG_BODY} !important; }
      .email-card { background-color: ${BG_CARD} !important; border-color: ${BORDER} !important; }
      .email-header { background-color: ${BG_HEADER} !important; }
      .email-footer { background-color: ${BG_HEADER} !important; }
      .inner-card { background-color: ${BG_INNER_CARD} !important; }
    }
  </style>
  <!--<![endif]-->
</head>
<!--[if !mso]><!-->
<body class="body" style="margin:0;padding:0;background-color:${BG_BODY};-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;">
<!--<![endif]-->
<!--[if mso]>
<body style="margin:0;padding:0;background-color:${BG_BODY};">
<![endif]-->

<!-- Preheader (hidden preview text) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
  Create a profile so listers can contact you, plus updates to free digests and Priority WhatsApp Alerts.&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;
</div>

<table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${BG_BODY};min-width:100%;">
  <tr>
    <td align="center" style="padding:32px 16px;">

      <!-- ── Outer card ── -->
      <table class="email-card" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;max-width:600px;background-color:${BG_CARD};border-radius:20px;overflow:hidden;border:1px solid ${BORDER};">

        <!-- ── HEADER ── -->
        <tr>
          <td class="email-header" style="background-color:${BG_HEADER};padding:28px 32px 26px 32px;">
            <!-- Logo row -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:20px;">
              <tr>
                <td style="vertical-align:middle;">
                  <img src="${LOGO_URL}" alt="RoomRush" height="28"
                       style="height:28px;width:auto;display:inline-block;border:0;outline:none;text-decoration:none;">
                </td>
              </tr>
            </table>
            <!-- Label -->
            <p style="color:${PINK};font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              RoomRush Update
            </p>
            <!-- Title -->
            <h1 style="color:${TEXT_WHITE};font-size:26px;font-weight:800;line-height:1.25;margin:0 0 12px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              New ways to find a room faster in Munich
            </h1>
            <!-- Intro -->
            <p style="color:${TEXT_MUTED};font-size:14px;line-height:1.65;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              We have launched Room Seeker profiles, updated the free digest schedule, and are moving instant alerts to WhatsApp for faster delivery.
            </p>
          </td>
        </tr>

        <!-- ── BODY ── -->
        <tr>
          <td style="padding:36px 32px;">

            <!-- ── SECTION 1: Room Seeker profiles ── -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:40px;">
              <tr>
                <td>
                  <p style="color:${PINK};font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    Room Seekers
                  </p>
                  <h2 style="color:${TEXT_WHITE};font-size:20px;font-weight:700;margin:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    Let listers find you
                  </h2>
                  <p style="color:${TEXT_MUTED};font-size:14px;line-height:1.65;margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    Create a Room Seeker profile with your budget, move in date, area, and intro so people with available rooms can contact you directly.
                  </p>
                  <p style="color:${TEXT_MUTED};font-size:14px;line-height:1.65;margin:0 0 28px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    You can also add a contact option — WhatsApp, Instagram, Facebook, or email — so interested listers can reach you directly.
                  </p>

                  <!-- Seeker card -->
                  ${seekerCard}

                  <p style="font-size:11px;color:${TEXT_FAINT};text-align:center;margin:10px 0 28px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    Example profile — yours could look like this
                  </p>

                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td align="center">
                        <a href="https://www.getroomrush.de/room-seekers"
                           style="display:inline-block;background:${PINK};color:#fff;font-size:14px;font-weight:600;padding:13px 30px;border-radius:100px;text-decoration:none;letter-spacing:0.01em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                          Create your free profile &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:40px;">
              <tr><td style="border-top:1px solid ${BORDER};font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>

            <!-- ── SECTION 2: WhatsApp Priority Alerts ── -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:40px;">
              <tr>
                <td>
                  <p style="color:${PINK};font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    Priority Alerts
                  </p>
                  <h2 style="color:${TEXT_WHITE};font-size:20px;font-weight:700;margin:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    Instant alerts are moving to WhatsApp
                  </h2>
                  <p style="color:${TEXT_MUTED};font-size:14px;line-height:1.65;margin:0 0 22px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    Listings move fast, so Priority Alerts are being moved to WhatsApp for better speed and visibility.
                  </p>

                  <!-- Benefits card -->
                  <table class="inner-card" width="100%" cellpadding="0" cellspacing="0" border="0"
                         style="border-collapse:collapse;background-color:${BG_INNER_CARD};border-radius:14px;margin-bottom:22px;">
                    <tr>
                      <td style="padding:18px 22px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                          ${benefitsHtml}
                        </table>
                      </td>
                    </tr>
                  </table>

                  <p style="color:${TEXT_DIM};font-size:12px;margin:0 0 18px 0;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    No payment today. Planned price: &#8364;2.99/month.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td align="center">
                        <a href="https://www.getroomrush.de/newsletter"
                           style="display:inline-block;background:${PINK};color:#fff;font-size:14px;font-weight:600;padding:13px 30px;border-radius:100px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                          Join the waitlist &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:40px;">
              <tr><td style="border-top:1px solid ${BORDER};font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>

            <!-- ── SECTION 3: Free digest timing ── -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td>
                  <p style="color:${PINK};font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    Digest Schedule
                  </p>
                  <h2 style="color:${TEXT_WHITE};font-size:20px;font-weight:700;margin:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    Free digest timing update
                  </h2>
                  <p style="color:${TEXT_MUTED};font-size:14px;line-height:1.65;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    The free RoomRush digest is now sent on
                    <strong style="color:${TEXT_WHITE};">Monday, Wednesday, and Friday at 10&nbsp;pm</strong>.
                    This keeps things less noisy while still helping you catch up on the latest rooms.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td class="email-footer" style="background-color:${BG_HEADER};padding:26px 32px;border-top:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td>
                  <img src="${LOGO_URL}" alt="RoomRush" height="20"
                       style="height:20px;width:auto;display:block;margin-bottom:6px;border:0;outline:none;text-decoration:none;">
                  <p style="color:#52525b;font-size:12px;margin:0 0 18px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    Munich rooms, sublets, and room search tools.
                  </p>
                  <p style="color:#71717a;font-size:13px;line-height:1.5;margin:0 0 16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    Thanks for being part of RoomRush.
                  </p>
                  <p style="color:${TEXT_FAINT};font-size:11px;margin:0;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                    You are receiving this because you signed up for RoomRush room alerts.
                    &nbsp;&middot;&nbsp;
                    <a href="https://www.getroomrush.de/newsletter" style="color:${TEXT_FAINT};text-decoration:underline;">Unsubscribe</a>
                  </p>
                </td>
              </tr>
            </table>
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
