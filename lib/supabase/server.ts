import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Server Supabase client (anon key) for Server Components / Route Handlers.
 * Used for public reads of the roadmap (RLS allows select). Returns null when
 * unconfigured. Cookie write handlers are no-ops in Server Components (Next
 * throws), so they swallow errors — we only read here.
 */
export function createSupabaseServerClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from a Server Component — ignore (read-only context).
        }
      },
      remove(name: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Called from a Server Component — ignore (read-only context).
        }
      },
    },
  });
}
