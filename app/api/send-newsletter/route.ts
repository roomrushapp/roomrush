import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendNewsletter() {
  const supabase = await createClient();

  // Fetch listings created today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("id, title, rent, location, available_from, image_urls")
    .eq("is_active", true)
    .gte("created_at", todayStart.toISOString())
    .order("created_at", { ascending: false });

  if (listingsError) {
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }

  if (!listings || listings.length === 0) {
    return NextResponse.json({ sent: false, reason: "no_new_listings" });
  }

  // Fetch active subscribers
  const { data: subscribers, error: subscribersError } = await supabase
    .from("newsletter_subscribers")
    .select("email, unsubscribe_token")
    .eq("is_active", true);

  if (subscribersError) {
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: false, reason: "no_subscribers" });
  }

  const n = listings.length;

  const listingsHtml = listings
    .map(
      (l) => `
    <div style="border:1px solid #e4e4e7;margin-bottom:16px;overflow:hidden;">
      ${l.image_urls && l.image_urls[0] ? `<img src="${l.image_urls[0]}" alt="Room image" width="560" style="width:100%;max-width:560px;height:200px;object-fit:cover;display:block;">` : ""}
      <div style="padding:16px 20px 20px 20px;">
        <p style="font-size:16px;font-weight:600;color:#09090b;margin:0 0 8px 0;">${l.title}</p>
        <p style="font-size:14px;color:#52525b;margin:0 0 4px 0;">€${l.rent}/month &nbsp;·&nbsp; ${l.location}</p>
        ${l.available_from ? `<p style="font-size:13px;color:#71717a;margin:0 0 12px 0;">Available from ${new Date(l.available_from).toLocaleDateString("en-DE", { day: "numeric", month: "long", year: "numeric" })}</p>` : `<p style="margin:0 0 12px 0;"></p>`}
        <a href="https://getroomrush.de/listings/${l.id}" style="display:inline-block;background:#e11d48;color:#fff;font-size:13px;font-weight:500;padding:8px 16px;text-decoration:none;">
          View listing →
        </a>
      </div>
    </div>`
    )
    .join("");

  let sentCount = 0;
  const errors: string[] = [];

  for (const subscriber of subscribers) {
    const unsubscribeUrl = `https://getroomrush.de/api/unsubscribe?token=${subscriber.unsubscribe_token}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #e4e4e7;">
    <div style="background:#09090b;padding:24px 28px;">
      <p style="color:#e11d48;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px 0;">Munich · Sublets Only</p>
      <p style="color:#fff;font-size:22px;font-weight:700;margin:0;">RoomRush</p>
    </div>

    <div style="padding:28px;">
      <h1 style="font-size:20px;font-weight:700;color:#09090b;margin:0 0 6px 0;">
        🏠 ${n} new room${n > 1 ? "s" : ""} in Munich today — just listed
      </h1>
      <p style="font-size:14px;color:#71717a;margin:0 0 8px 0;">
        Here are the latest sublets posted on RoomRush.
      </p>
      <p style="font-size:14px;margin:0 0 24px 0;">
        <a href="https://getroomrush.de" style="color:#e11d48;text-decoration:none;">Browse all listings →</a>
      </p>

      ${listingsHtml}

      <a href="https://getroomrush.de#listings" style="display:block;text-align:center;background:#09090b;color:#fff;font-size:14px;font-weight:600;padding:14px;text-decoration:none;margin-top:8px;">
        See all listings on RoomRush →
      </a>
    </div>

    <div style="padding:20px 28px;border-top:1px solid #e4e4e7;">
      <p style="font-size:12px;color:#a1a1aa;margin:0;text-align:center;">
        You signed up for RoomRush updates &nbsp;·&nbsp;
        <a href="${unsubscribeUrl}" style="color:#a1a1aa;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    const { error } = await resend.emails.send({
      from: "RoomRush Munich <hello@getroomrush.de>",
      to: subscriber.email,
      subject: `🏠 ${n} new room${n > 1 ? "s" : ""} in Munich today`,
      html,
    });

    if (error) {
      errors.push(subscriber.email);
    } else {
      sentCount++;
    }
  }

  return NextResponse.json({
    sent: true,
    listings: n,
    sentCount,
    failedCount: errors.length,
  });
}

function authorize(request: NextRequest): boolean {
  // Allow unauthenticated requests in development for manual testing
  if (process.env.NODE_ENV !== "production") return true;

  // Path 1: Vercel cron job — validates x-cron-secret header
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret === process.env.CRON_SECRET) return true;

  // Path 2: Temporary manual trigger — validates ?secret= query param
  const querySecret = new URL(request.url).searchParams.get("secret");
  if (
    process.env.MANUAL_TRIGGER_SECRET &&
    querySecret === process.env.MANUAL_TRIGGER_SECRET
  ) return true;

  return false;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return sendNewsletter();
}

export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return sendNewsletter();
}
