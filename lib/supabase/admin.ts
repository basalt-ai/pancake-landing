import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Service-role Supabase client. Bypasses RLS, so it is the ONLY client allowed
 * to write (create / vote / delete). The `server-only` import guarantees a
 * build error if this module is ever pulled into a client bundle, keeping the
 * service-role key off the browser. Returns null when unconfigured.
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
