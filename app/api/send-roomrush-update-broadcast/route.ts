import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { Resend } from "resend";

// ---------------------------------------------------------------------------
// ONE-TIME BROADCAST — RoomRush product update email
//
// STATUS: SENT on 2026-06-08. Real sending is permanently disabled via the
// BROADCAST_SENT flag below to prevent accidental duplicate sends.
// Set BROADCAST_SENT = false only if a deliberate resend is needed.
//
// GET is always a dry run (subscriber count checks only). Real sending
// requires POST with Authorization: Bearer <secret>.
// ---------------------------------------------------------------------------

// ── Set to false ONLY if a deliberate resend is intentionally authorised. ──
const BROADCAST_SENT = true;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DELAY_MS = 500; // 500 ms between sends — safely under Resend's 5 req/s limit

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Secrets are accepted ONLY via the Authorization header. Query-string secrets
// end up in request logs, proxies, and browser history, so they are no longer
// supported.
function authorize(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length);

  if (
    process.env.MANUAL_TRIGGER_SECRET &&
    token === process.env.MANUAL_TRIGGER_SECRET
  ) {
    return true;
  }
  if (process.env.CRON_SECRET && token === process.env.CRON_SECRET) return true;

  return false;
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// GET — dry run ONLY. Returns subscriber counts, never sends email, so a
// leaked or prefetched URL can never trigger a real broadcast.
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handleBroadcast(true);
}

// POST — real send (still blocked by the BROADCAST_SENT flag above).
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handleBroadcast(false);
}

async function handleBroadcast(isDryRun: boolean) {

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured." },
      { status: 500 }
    );
  }

  const supabase = getAdminClient();

  // ── Fetch active subscribers ─────────────────────────────────────────────
  const { data: rawSubscribers, error: subscribersError } = await supabase
    .from("newsletter_subscribers")
    .select("email, unsubscribe_token")
    .eq("is_active", true);

  if (subscribersError) {
    console.error("[Broadcast] Failed to fetch subscribers:", subscribersError.message);
    return NextResponse.json(
      { error: "Failed to fetch subscribers", detail: subscribersError.message },
      { status: 500 }
    );
  }

  const totalFetched = rawSubscribers?.length ?? 0;
  console.log(`[Broadcast] Subscribers fetched: ${totalFetched}`);

  // ── Validate and deduplicate ─────────────────────────────────────────────
  const seen = new Set<string>();
  const valid: Array<{ email: string; unsubscribe_token: string }> = [];
  let skippedInvalid = 0;
  let skippedDupes = 0;

  for (const sub of rawSubscribers ?? []) {
    if (!sub.email || typeof sub.email !== "string") {
      skippedInvalid++;
      continue;
    }

    const email = sub.email.trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
      skippedInvalid++;
      continue;
    }

    if (seen.has(email)) {
      skippedDupes++;
      continue;
    }

    seen.add(email);
    valid.push({ email, unsubscribe_token: sub.unsubscribe_token });
  }

  console.log(
    `[Broadcast] Valid: ${valid.length}  Invalid: ${skippedInvalid}  Duplicates: ${skippedDupes}`
  );

  // ── Dry run — return counts only, do not send ────────────────────────────
  if (isDryRun) {
    console.log("[Broadcast] DRY RUN — no emails sent.");
    return NextResponse.json({
      dryRun: true,
      totalFetched,
      validRecipients: valid.length,
      skippedInvalid,
      skippedDuplicates: skippedDupes,
      note: "No emails were sent. Use POST (with Bearer auth) to trigger the real send.",
    });
  }

  // ── Guard: broadcast already sent — refuse to resend ────────────────────
  if (BROADCAST_SENT) {
    console.log("[Broadcast] Blocked — BROADCAST_SENT=true. Set it to false to re-enable.");
    return NextResponse.json(
      {
        ok: false,
        blocked: true,
        reason: "Broadcast already sent. Real sending is disabled to prevent duplicates.",
        note: "Set BROADCAST_SENT = false in the route file only if a deliberate resend is authorised.",
      },
      { status: 403 }
    );
  }

  // ── Fetch Room Seeker photo (non-fatal) ──────────────────────────────────
  let seekerPhotoUrl: string | null = null;
  try {
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
    // Non-fatal — placeholder used automatically by buildEmailHtml
  }

  // ── Send ─────────────────────────────────────────────────────────────────
  const resend = new Resend(process.env.RESEND_API_KEY);
  let sentCount = 0;
  const failures: Array<{ reason: string }> = [];

  for (const subscriber of valid) {
    const unsubscribeUrl = `https://getroomrush.de/api/unsubscribe?token=${subscriber.unsubscribe_token}`;
    const html = buildEmailHtml(seekerPhotoUrl, unsubscribeUrl);

    const { error } = await resend.emails.send({
      from: "RoomRush Munich <hello@getroomrush.de>",
      to: subscriber.email,
      subject: "New ways to find a room faster in Munich",
      html,
    });

    if (error) {
      const reason = (error as { message?: string }).message ?? JSON.stringify(error);
      console.error(`[Broadcast] Send #${sentCount + failures.length + 1} FAILED: ${reason}`);
      failures.push({ reason });
    } else {
      sentCount++;
      console.log(`[Broadcast] Sent #${sentCount}`);
    }

    await delay(DELAY_MS);
  }

  console.log(
    `[Broadcast] Complete — sent=${sentCount} failed=${failures.length} total=${valid.length}`
  );

  return NextResponse.json({
    ok: true,
    dryRun: false,
    totalFetched,
    validRecipients: valid.length,
    skippedInvalid,
    skippedDuplicates: skippedDupes,
    sentCount,
    failedCount: failures.length,
    failures,
  });
}

// ---------------------------------------------------------------------------
// Email HTML — approved update email, identical to the test route
// except the unsubscribe footer link uses each subscriber's own token.
// ---------------------------------------------------------------------------

const ICON_URL    = "https://www.getroomrush.de/icon.png";
const PINK        = "#e11d48";
const BG_BODY     = "#141417";
const BG_CARD     = "#1c1c20";
const BG_HEADER   = "#111114";
const BG_INNER    = "#242428";
const BORDER      = "#303036";
const TEXT_WHITE  = "#f0f0f2";
const TEXT_MUTED  = "#b0b0b8";
const TEXT_DIM    = "#848490";
const TEXT_FAINT  = "#5a5a64";
const FONT        = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

function buildEmailHtml(seekerPhotoUrl: string | null, unsubscribeUrl: string): string {

  // ── Room Seeker photo ─────────────────────────────────────────────────────
  const photoRow = seekerPhotoUrl
    ? `<tr>
         <td style="padding:0;line-height:0;font-size:0;background-color:${BG_INNER};" bgcolor="${BG_INNER}">
           <img src="${seekerPhotoUrl}" alt="Faizan" width="600"
                style="width:100%;max-width:600px;height:230px;object-fit:cover;display:block;border:0;outline:none;">
         </td>
       </tr>`
    : `<tr>
         <td style="height:200px;background-color:#1e1e23;text-align:center;vertical-align:middle;padding:24px 0;" bgcolor="#1e1e23">
           <div style="display:inline-block;width:66px;height:66px;border-radius:50%;background-color:#2d1520;border:2px solid #5a1428;text-align:center;line-height:62px;">
             <span style="color:${PINK};font-size:26px;font-weight:800;">F</span>
           </div>
           <p style="color:#5a5a64;font-size:12px;margin:10px 0 0 0;font-family:${FONT};">Profile photo</p>
         </td>
       </tr>`;

  // ── Room Seeker card ──────────────────────────────────────────────────────
  const seekerCard = `
    <table class="seeker-bg" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="border-collapse:collapse;border:1px solid ${BORDER};border-radius:14px;background-color:${BG_INNER};"
           bgcolor="${BG_INNER}">

      <!-- Photo row -->
      ${photoRow}

      <!-- Badge — 15px below image -->
      <tr>
        <td style="padding:15px 22px 0 22px;background-color:${BG_INNER};" bgcolor="${BG_INNER}">
          <span style="display:inline-block;background-color:${PINK};color:#ffffff;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:4px 10px;border-radius:20px;font-family:${FONT};">
            Looking for a room
          </span>
        </td>
      </tr>

      <!-- Name -->
      <tr>
        <td style="padding:12px 22px 0 22px;background-color:${BG_INNER};" bgcolor="${BG_INNER}">
          <p style="font-size:19px;font-weight:700;color:${TEXT_WHITE};margin:0;line-height:1.2;font-family:${FONT};">Faizan, 23</p>
        </td>
      </tr>

      <!-- Details -->
      <tr>
        <td style="padding:12px 22px 0 22px;background-color:${BG_INNER};" bgcolor="${BG_INNER}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td style="color:${TEXT_DIM};font-size:13px;padding:4px 12px 4px 0;width:76px;vertical-align:top;font-family:${FONT};">Move in</td>
              <td style="color:${TEXT_WHITE};font-size:13px;font-weight:500;padding:4px 0;vertical-align:top;font-family:${FONT};">August 2026</td>
            </tr>
            <tr>
              <td style="color:${TEXT_DIM};font-size:13px;padding:4px 12px 4px 0;vertical-align:top;font-family:${FONT};">Budget</td>
              <td style="color:${TEXT_WHITE};font-size:13px;font-weight:500;padding:4px 0;vertical-align:top;font-family:${FONT};">&#8364;760/month</td>
            </tr>
            <tr>
              <td style="color:${TEXT_DIM};font-size:13px;padding:4px 12px 4px 0;vertical-align:top;font-family:${FONT};">Area</td>
              <td style="color:${TEXT_WHITE};font-size:13px;font-weight:500;padding:4px 0;vertical-align:top;font-family:${FONT};">Flexible / Anywhere in Munich</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Intro quote -->
      <tr>
        <td style="padding:14px 22px 0 22px;background-color:${BG_INNER};" bgcolor="${BG_INNER}">
          <p style="font-size:14px;color:${TEXT_DIM};line-height:1.6;margin:0;font-style:italic;border-left:2px solid #5a1428;padding-left:12px;font-family:${FONT};">
            &#8220;Hi, I&#8217;m looking for a room or WG in Munich. I&#8217;m flexible with the area and happy to share more&#8230;&#8221;
          </p>
        </td>
      </tr>

      <!-- Buttons -->
      <tr>
        <td style="padding:18px 22px 22px 22px;border-top:1px solid #303036;background-color:${BG_INNER};" bgcolor="${BG_INNER}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td width="46%" style="padding-right:6px;">
                <a href="https://www.getroomrush.de/room-seekers"
                   style="display:block;text-align:center;background-color:#2e2e34;color:${TEXT_WHITE};font-size:13px;font-weight:600;padding:11px 0;border-radius:10px;text-decoration:none;border:1px solid #404046;font-family:${FONT};"
                   bgcolor="#2e2e34">
                  View profile
                </a>
              </td>
              <td width="8%">&nbsp;</td>
              <td width="46%" style="padding-left:6px;">
                <a href="https://www.getroomrush.de/room-seekers"
                   style="display:block;text-align:center;background-color:${PINK};color:#ffffff;font-size:13px;font-weight:600;padding:11px 0;border-radius:10px;text-decoration:none;font-family:${FONT};"
                   bgcolor="${PINK}">
                  Contact
                </a>
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
    "No spam, only room listings",
  ];

  const benefitsHtml = benefits.map((b) => `
    <tr>
      <td width="24" style="padding:6px 0;color:${PINK};font-size:14px;vertical-align:top;font-family:${FONT};">&#10003;</td>
      <td style="padding:6px 0;color:#ccccD4;font-size:14px;line-height:1.5;font-family:${FONT};">${b}</td>
    </tr>`).join("");

  // ── Section divider ───────────────────────────────────────────────────────
  const divider = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
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
    body, table, td, p, a, li {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    u + .body .email-wrapper  { background-color: ${BG_BODY} !important; }
    u + .body .email-body-td  { background-color: ${BG_BODY} !important; }
    u + .body .email-card     { background-color: ${BG_CARD} !important; }
    u + .body .email-header   { background-color: ${BG_HEADER} !important; }
    u + .body .email-body-pad { background-color: ${BG_CARD} !important; }
    u + .body .email-footer   { background-color: ${BG_HEADER} !important; }
    u + .body .inner-card     { background-color: ${BG_INNER} !important; }
    u + .body .seeker-bg      { background-color: ${BG_INNER} !important; }
    u + .body .seeker-bg td   { background-color: ${BG_INNER} !important; }
    u + .body h1 { color: ${TEXT_WHITE} !important; }
    u + .body h2 { color: ${TEXT_WHITE} !important; }
    @media (prefers-color-scheme: dark) {
      body              { background-color: ${BG_BODY} !important; }
      .email-wrapper    { background-color: ${BG_BODY} !important; }
      .email-body-td    { background-color: ${BG_BODY} !important; }
      .email-card       { background-color: ${BG_CARD} !important; border-color: ${BORDER} !important; }
      .email-header     { background-color: ${BG_HEADER} !important; }
      .email-body-pad   { background-color: ${BG_CARD} !important; }
      .email-footer     { background-color: ${BG_HEADER} !important; }
      .inner-card       { background-color: ${BG_INNER} !important; }
      .seeker-bg        { background-color: ${BG_INNER} !important; }
      .seeker-bg td     { background-color: ${BG_INNER} !important; }
      h1 { color: ${TEXT_WHITE} !important; }
      h2 { color: ${TEXT_WHITE} !important; }
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
    <td class="email-body-td" align="center"
        style="padding:28px 12px 40px 12px;background-color:${BG_BODY};" bgcolor="${BG_BODY}">

      <table class="email-card" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;max-width:600px;background-color:${BG_CARD};border-radius:18px;overflow:hidden;border:1px solid ${BORDER};"
             bgcolor="${BG_CARD}">

        <!-- HEADER -->
        <tr>
          <td class="email-header"
              style="background-color:${BG_HEADER};padding:28px 32px 28px 32px;"
              bgcolor="${BG_HEADER}">
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
                        <span style="color:${PINK};font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-family:${FONT};">Update</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <h1 style="color:${TEXT_WHITE};font-size:26px;font-weight:800;line-height:1.25;margin:0 0 14px 0;font-family:${FONT};">
              New ways to find a room faster in Munich
            </h1>
            <p style="color:${TEXT_MUTED};font-size:14px;line-height:1.7;margin:0;font-family:${FONT};">
              We have launched Room Seeker profiles, updated the free digest schedule, and are moving instant alerts to WhatsApp for faster delivery.
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td class="email-body-pad"
              style="padding:36px 32px;background-color:${BG_CARD};" bgcolor="${BG_CARD}">

            <!-- SECTION 1: Room Seekers -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:36px;">
              <tr>
                <td>
                  <p style="color:${PINK};font-size:10px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;margin:0 0 6px 0;font-family:${FONT};">Room Seekers</p>
                  <h2 style="color:${TEXT_WHITE};font-size:20px;font-weight:700;margin:0 0 10px 0;font-family:${FONT};">Let listers find you</h2>
                  <p style="color:${TEXT_MUTED};font-size:14px;line-height:1.7;margin:0 0 26px 0;font-family:${FONT};">
                    Create a Room Seeker profile with your budget, move in date, area, intro, and contact method so people with available rooms can contact you directly.
                  </p>
                  ${seekerCard}
                  <p style="font-size:13px;color:${TEXT_DIM};text-align:center;margin:12px 0 30px 0;font-family:${FONT};">
                    Example profile &#8212; yours could look like this
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

            <!-- SECTION 2: Priority Alerts -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:36px;">
              <tr>
                <td>
                  <p style="color:${PINK};font-size:10px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;margin:0 0 6px 0;font-family:${FONT};">Priority Alerts</p>
                  <h2 style="color:${TEXT_WHITE};font-size:20px;font-weight:700;margin:0 0 10px 0;font-family:${FONT};">Instant alerts are moving to WhatsApp</h2>
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

            <!-- SECTION 3: Digest timing -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td>
                  <p style="color:${PINK};font-size:10px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;margin:0 0 6px 0;font-family:${FONT};">Digest Schedule</p>
                  <h2 style="color:${TEXT_WHITE};font-size:20px;font-weight:700;margin:0 0 10px 0;font-family:${FONT};">Free digest timing update</h2>
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

        <!-- FOOTER -->
        <tr>
          <td class="email-footer"
              style="background-color:${BG_HEADER};padding:24px 32px;border-top:1px solid ${BORDER};"
              bgcolor="${BG_HEADER}">
            <p style="color:#52525b;font-size:12px;margin:0 0 4px 0;font-family:${FONT};">
              Munich rooms, sublets, and room search tools.
            </p>
            <p style="color:${TEXT_DIM};font-size:13px;line-height:1.5;margin:0 0 16px 0;font-family:${FONT};">
              Thank you for being part of RoomRush.
            </p>
            <p style="color:${TEXT_FAINT};font-size:11px;margin:0;line-height:1.7;font-family:${FONT};">
              You are receiving this because you signed up for room alerts.
              &nbsp;&middot;&nbsp;
              <a href="${unsubscribeUrl}"
                 style="color:${TEXT_FAINT};text-decoration:underline;font-family:${FONT};">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
}
