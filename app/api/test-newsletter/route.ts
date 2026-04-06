import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const TEST_EMAIL = "samadfaizan46@gmail.com";

export async function GET() {
  const supabase = await createClient();

  // Fetch the most recent active listings (up to 5) for preview
  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("id, title, rent, location, available_from")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5);

  if (listingsError) {
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }

  if (!listings || listings.length === 0) {
    return NextResponse.json({ error: "No active listings found to preview" }, { status: 404 });
  }

  const n = listings.length;

  const listingsHtml = listings
    .map(
      (l) => `
    <div style="border:1px solid #e4e4e7;padding:20px;margin-bottom:16px;">
      <p style="font-size:16px;font-weight:600;color:#09090b;margin:0 0 8px 0;">${l.title}</p>
      <p style="font-size:14px;color:#52525b;margin:0 0 4px 0;">€${l.rent}/month &nbsp;·&nbsp; ${l.location}</p>
      ${l.available_from ? `<p style="font-size:13px;color:#71717a;margin:0 0 12px 0;">Available from ${new Date(l.available_from).toLocaleDateString("en-DE", { day: "numeric", month: "long", year: "numeric" })}</p>` : ""}
      <a href="https://getroomrush.de/listings/${l.id}" style="display:inline-block;background:#e11d48;color:#fff;font-size:13px;font-weight:500;padding:8px 16px;text-decoration:none;">
        View listing →
      </a>
    </div>`
    )
    .join("");

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
        🏠 ${n} new room${n > 1 ? "s" : ""} in Munich today
      </h1>
      <p style="font-size:14px;color:#71717a;margin:0 0 24px 0;">
        Here are the latest sublets posted on RoomRush.
      </p>

      ${listingsHtml}

      <a href="https://getroomrush.de#listings" style="display:block;text-align:center;background:#09090b;color:#fff;font-size:14px;font-weight:600;padding:14px;text-decoration:none;margin-top:8px;">
        See all listings on RoomRush →
      </a>
    </div>

    <div style="padding:20px 28px;border-top:1px solid #e4e4e7;">
      <p style="font-size:12px;color:#a1a1aa;margin:0;text-align:center;">
        You signed up for RoomRush updates &nbsp;·&nbsp;
        <a href="#" style="color:#a1a1aa;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: "RoomRush Munich <hello@getroomrush.de>",
    to: TEST_EMAIL,
    subject: "TEST – RoomRush Newsletter",
    html,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send email", details: error }, { status: 500 });
  }

  return NextResponse.json({
    sent: true,
    to: TEST_EMAIL,
    listings: n,
  });
}
