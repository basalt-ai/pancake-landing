/**
 * Centralised Supabase env access.
 *
 * The marketing site ships without a backend by default, so every consumer
 * must tolerate missing env vars: the roadmap falls back to static seed data
 * and disables mutations when Supabase isn't configured. Keep all
 * `process.env` reads for Supabase here so that "is the backend on?" is a
 * single source of truth.
 */

/** Public (browser-safe) Supabase URL + anon key. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Server-only service-role key. Never expose to the browser. */
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when the public client can talk to Supabase (read path). */
export function isBackendConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** True when privileged server writes (create/vote/delete) are possible. */
export function isServiceConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}
