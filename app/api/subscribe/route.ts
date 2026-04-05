import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { success: false, message: "invalid_email" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  if (error) {
    if (error.code === "23505") {
      // unique violation — already subscribed
      return NextResponse.json({ success: true, message: "already_subscribed" });
    }
    return NextResponse.json(
      { success: false, message: "server_error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: "subscribed" });
}
