import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/unsubscribed?error=missing_token", request.url));
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ is_active: false })
    .eq("unsubscribe_token", token);

  if (error) {
    return NextResponse.redirect(new URL("/unsubscribed?error=server_error", request.url));
  }

  return NextResponse.redirect(new URL("/unsubscribed", request.url));
}
