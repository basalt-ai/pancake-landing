import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME } from "@/lib/auth/admin";

export const runtime = "nodejs";

const secure = process.env.NODE_ENV === "production";

/** Clear the admin cookie. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
