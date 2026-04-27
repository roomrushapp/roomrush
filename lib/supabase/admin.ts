import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS entirely.
// ONLY use this in server-side Route Handlers and API routes.
// NEVER import this in Client Components or expose it to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
