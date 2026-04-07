import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Use the service role key so this route can read and write newsletter_runs
// without being blocked by RLS. This client is never exposed to users — the
// route itself is protected by CRON_SECRET / MANUAL_TRIGGER_SECRET.
function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function sendNewsletter(triggeredBy: "cron" | "manual") {
  const runAt = new Date();
  console.log(`[Newsletter] Run started — trigger=${triggeredBy} utc=${runAt.toISOString()}`);

  const supabase = getAdminClient();

  // ── Window calculation ──────────────────────────────────────────────────────
  // Query the most recent recorded run. Its sent_at becomes windowStart, so
  // each run covers exactly the gap since the last one completed.
  //
  // Using .maybeSingle() instead of .single() so an empty table returns
  // { data: null, error: null } rather than a PGRST116 error.
  //
  // If no prior run exists (fresh deploy / empty table), fall back to now - 24h.
  const { data: lastRun, error: lastRunError } = await supabase
    .from("newsletter_runs")
    .select("sent_at")
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastRunError) {
    console.error("[Newsletter] Failed to query newsletter_runs:", lastRunError);
    // Surface this — it almost always means the table doesn't exist yet or
    // the service role key is missing. We cannot continue safely.
    return NextResponse.json(
      { error: "Failed to query newsletter_runs", detail: lastRunError.message },
      { status: 500 }
    );
  }

  const windowSource = lastRun ? "last_run" : "fallback_24h";
  const windowStart: Date = lastRun?.sent_at
    ? new Date(lastRun.sent_at)
    : new Date(runAt.getTime() - 24 * 60 * 60 * 1000);
  const windowEnd = runAt;

  console.log(
    `[Newsletter] Window source: ${windowSource}`
  );
  console.log(
    `[Newsletter] Window: ${windowStart.toISOString()} → ${windowEnd.toISOString()}`
  );

  // ── Fetch listings ──────────────────────────────────────────────────────────
  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("id, title, rent, location, available_from, image_urls, created_at")
    .eq("is_active", true)
    .gt("created_at", windowStart.toISOString())
    .lte("created_at", windowEnd.toISOString())
    .order("created_at", { ascending: false });

  if (listingsError) {
    console.error("[Newsletter] Failed to fetch listings:", listingsError);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }

  const listingCount = listings?.length ?? 0;
  console.log(`[Newsletter] Listings in window: ${listingCount}`);
  for (const l of listings ?? []) {
    console.log(`[Newsletter]   listing id=${l.id} created_at=${l.created_at}`);
  }

  // ── Helper: record the run and return the inserted id ───────────────────────
  async function recordRun(sentCount: number, failedCount: number): Promise<number | null> {
    const { data: inserted, error: insertError } = await supabase
      .from("newsletter_runs")
      .insert({
        sent_at: runAt.toISOString(),
        listing_count: listingCount,
        sent_count: sentCount,
        failed_count: failedCount,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[Newsletter] FAILED to insert into newsletter_runs:", insertError);
      return null;
    }

    console.log(`[Newsletter] Recorded run id=${inserted.id}`);
    return inserted.id;
  }

  // ── No listings — record and stop ───────────────────────────────────────────
  if (listingCount === 0) {
    console.log("[Newsletter] No new listings — recording run, skipping send.");
    const runId = await recordRun(0, 0);
    return NextResponse.json({
      sent: false,
      reason: "no_new_listings",
      trigger: triggeredBy,
      windowSource,
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      runInserted: runId !== null,
      runId,
    });
  }

  // ── Fetch and validate subscribers ──────────────────────────────────────────
  const { data: rawSubscribers, error: subscribersError } = await supabase
    .from("newsletter_subscribers")
    .select("email, unsubscribe_token")
    .eq("is_active", true);

  if (subscribersError) {
    console.error("[Newsletter] Failed to fetch subscribers:", subscribersError);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }

  const totalFetched = rawSubscribers?.length ?? 0;
  console.log(`[Newsletter] Subscribers fetched from DB: ${totalFetched}`);

  const seen = new Set<string>();
  const validSubscribers: Array<{ email: string; unsubscribe_token: string }> = [];
  let invalidCount = 0;
  let dupCount = 0;

  for (const sub of rawSubscribers ?? []) {
    const raw = sub.email;

    if (!raw || typeof raw !== "string") {
      console.warn(`[Newsletter] Skipping null/missing email (token=${sub.unsubscribe_token})`);
      invalidCount++;
      continue;
    }

    const email = raw.trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
      console.warn(`[Newsletter] Skipping invalid email format: ${JSON.stringify(raw)}`);
      invalidCount++;
      continue;
    }

    if (seen.has(email)) {
      console.warn(`[Newsletter] Skipping duplicate: ${email}`);
      dupCount++;
      continue;
    }

    seen.add(email);
    validSubscribers.push({ email, unsubscribe_token: sub.unsubscribe_token });
  }

  console.log(
    `[Newsletter] Subscribers — valid=${validSubscribers.length} invalid=${invalidCount} duplicates=${dupCount}`
  );

  if (validSubscribers.length === 0) {
    console.log("[Newsletter] No valid subscribers — recording run, skipping send.");
    const runId = await recordRun(0, 0);
    return NextResponse.json({
      sent: false,
      reason: "no_subscribers",
      trigger: triggeredBy,
      windowSource,
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      listings: listingCount,
      runInserted: runId !== null,
      runId,
    });
  }

  // ── Build listings HTML ─────────────────────────────────────────────────────
  const n = listingCount;

  const listingsHtml = (listings ?? [])
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

  // ── Send emails (sequential with delay to respect Resend rate limits) ────────
  let sentCount = 0;
  const failures: Array<{ email: string; reason: string }> = [];

  for (const subscriber of validSubscribers) {
    const unsubscribeUrl = `https://getroomrush.de/api/unsubscribe?token=${subscriber.unsubscribe_token}`;

    const html = `<!DOCTYPE html>
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
      <p style="font-size:14px;color:#71717a;margin:0 0 8px 0;">Here are the latest sublets posted on RoomRush.</p>
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
      const reason = (error as { message?: string }).message ?? JSON.stringify(error);
      console.error(`[Newsletter] FAILED → ${subscriber.email}: ${reason}`);
      failures.push({ email: subscriber.email, reason });
    } else {
      console.log(`[Newsletter] Sent → ${subscriber.email}`);
      sentCount++;
    }

    // 500ms between sends — max 2 emails/s, safely under Resend's 5 req/s limit
    await delay(500);
  }

  // ── Record run ──────────────────────────────────────────────────────────────
  // Insert unconditionally — even partial failures must advance the window.
  // The next run must not re-attempt listings or recipients from this run.
  const runId = await recordRun(sentCount, failures.length);

  console.log(
    `[Newsletter] Run complete — listings=${listingCount} sent=${sentCount} failed=${failures.length} invalidSkipped=${invalidCount} dupSkipped=${dupCount} runId=${runId}`
  );

  if (failures.length > 0) {
    console.warn("[Newsletter] Failed recipients:", JSON.stringify(failures));
  }

  return NextResponse.json({
    sent: true,
    trigger: triggeredBy,
    windowSource,
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    listings: listingCount,
    subscribersFetched: totalFetched,
    validSubscribers: validSubscribers.length,
    invalidSkipped: invalidCount,
    duplicatesSkipped: dupCount,
    sentCount,
    failedCount: failures.length,
    failures,
    runInserted: runId !== null,
    runId,
  });
}

function authorize(request: NextRequest): { ok: boolean; trigger: "cron" | "manual" } {
  if (process.env.NODE_ENV !== "production") return { ok: true, trigger: "manual" };

  // Vercel cron — sends Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return { ok: true, trigger: "cron" };
  }

  // Manual admin trigger — ?secret=<MANUAL_TRIGGER_SECRET>
  const querySecret = new URL(request.url).searchParams.get("secret");
  if (process.env.MANUAL_TRIGGER_SECRET && querySecret === process.env.MANUAL_TRIGGER_SECRET) {
    return { ok: true, trigger: "manual" };
  }

  return { ok: false, trigger: "manual" };
}

export async function GET(request: NextRequest) {
  const auth = authorize(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return sendNewsletter(auth.trigger);
}

export async function POST(request: NextRequest) {
  const auth = authorize(request);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return sendNewsletter(auth.trigger);
}
