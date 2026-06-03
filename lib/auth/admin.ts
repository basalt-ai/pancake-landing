import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Admin identity — the ONE place that decides who may delete ideas.
 *
 * Shared-password model (no accounts, no external IdP): an admin enters
 * ROADMAP_ADMIN_PASSWORD once; we set a signed, HttpOnly cookie that proves
 * "someone who knew the password authenticated, until exp". Every privileged
 * route checks that cookie server-side. A client can't forge it without the
 * password (it's the HMAC key), and the browser can't read it (HttpOnly).
 *
 * Fail-closed: no password configured, no/!valid/expired cookie ⇒ not admin.
 * To swap the auth model later, change ONLY this module — routes + page call
 * through isAdmin().
 */

const ADMIN_PASSWORD = process.env.ROADMAP_ADMIN_PASSWORD;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const ADMIN_COOKIE_NAME = "roadmap_admin";

/** True when an admin password is configured (gates the sign-in UI/route). */
export function isAdminAuthConfigured(): boolean {
  return Boolean(ADMIN_PASSWORD);
}

/** Constant-time password check (compares fixed-length SHA-256 digests). */
export function checkAdminPassword(input: unknown): boolean {
  if (!ADMIN_PASSWORD || typeof input !== "string" || input.length === 0) return false;
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

/**
 * Mint the signed admin cookie value: base64url({exp}).base64url(HMAC), keyed
 * by the password. Returns the value + maxAge for the Set-Cookie.
 */
export function mintAdminCookie(): { value: string; maxAge: number } {
  if (!ADMIN_PASSWORD) return { value: "", maxAge: 0 };
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payloadB64 = Buffer.from(JSON.stringify({ exp }), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", ADMIN_PASSWORD).update(payloadB64).digest("base64url");
  return { value: `${payloadB64}.${sig}`, maxAge: SESSION_TTL_SECONDS };
}

function verifyAdminCookie(value: string | undefined): boolean {
  if (!value || !ADMIN_PASSWORD) return false;
  const dot = value.indexOf(".");
  if (dot <= 0 || dot === value.length - 1) return false;
  const payloadB64 = value.slice(0, dot);
  const sigB64 = value.slice(dot + 1);

  const expected = crypto.createHmac("sha256", ADMIN_PASSWORD).update(payloadB64).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(sigB64, "base64url");
  } catch {
    return false;
  }
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return false;
  }

  try {
    const { exp } = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      exp?: unknown;
    };
    if (typeof exp !== "number" || Math.floor(Date.now() / 1000) > exp) return false;
  } catch {
    return false;
  }
  return true;
}

/** True only when the current request carries a valid admin cookie. */
export async function isAdmin(): Promise<boolean> {
  const value = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminCookie(value);
}
