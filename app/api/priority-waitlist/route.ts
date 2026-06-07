import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, whatsapp_number } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { success: false, message: "invalid_email" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.from("priority_alert_waitlist").insert({
    email,
    whatsapp_number: whatsapp_number?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ success: true, message: "already_on_waitlist" });
    }
    return NextResponse.json(
      { success: false, message: "server_error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: "joined_waitlist" });
}
