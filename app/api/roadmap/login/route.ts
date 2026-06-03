import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  checkAdminPassword,
  isAdminAuthConfigured,
  mintAdminCookie,
} from "@/lib/auth/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const secure = process.env.NODE_ENV === "production";

/**
 * Admin login. Verifies the shared password and sets a signed HttpOnly admin
 * cookie. Rate-limited per IP to blunt brute-force.
 */
export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: "Admin login is not configured." }, { status: 503 });
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`roadmap:login:${ip}`, 10, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!checkAdminPassword(body.password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const { value, maxAge } = mintAdminCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, value, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}
