import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  isAdminAuthConfigured,
  isAllowedAdminEmail,
  mintAdminCookie,
} from "@/lib/auth/admin";
import {
  GOOGLE_STATE_COOKIE,
  exchangeCodeForClaims,
  getRedirectUri,
  stateMatches,
} from "@/lib/auth/google";

export const runtime = "nodejs";

const secure = process.env.NODE_ENV === "production";

/** Redirect to the hidden login page with an error flag, clearing the state cookie. */
function fail(request: Request, error: string) {
  const res = NextResponse.redirect(new URL(`/open-roadmap/admin?error=${error}`, request.url));
  res.cookies.set(GOOGLE_STATE_COOKIE, "", { httpOnly: true, secure, path: "/", maxAge: 0 });
  return res;
}

/**
 * Google OAuth callback. Verifies the CSRF state, exchanges the code for the
 * user's verified email, checks it's on an allow-listed company domain, and —
 * only then — sets the signed admin session cookie. See lib/auth/admin.ts.
 */
export async function GET(request: Request) {
  if (!isAdminAuthConfigured()) return fail(request, "unconfigured");

  const url = new URL(request.url);
  const params = url.searchParams;

  // User declined consent or Google returned an error.
  if (params.get("error")) return fail(request, "denied");

  const code = params.get("code");
  const state = params.get("state") ?? undefined;
  const cookieState = cookies().get(GOOGLE_STATE_COOKIE)?.value;

  if (!code || !stateMatches(state, cookieState)) return fail(request, "state");

  const claims = await exchangeCodeForClaims({ code, redirectUri: getRedirectUri(request) });
  if (!claims) return fail(request, "exchange");

  if (!isAllowedAdminEmail(claims.email)) return fail(request, "domain");

  const { value, maxAge } = mintAdminCookie(claims.email);
  const res = NextResponse.redirect(new URL("/open-roadmap", request.url));
  res.cookies.set(ADMIN_COOKIE_NAME, value, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  // One-time state cookie — clear it now that the handshake is complete.
  res.cookies.set(GOOGLE_STATE_COOKIE, "", { httpOnly: true, secure, path: "/", maxAge: 0 });
  return res;
}
