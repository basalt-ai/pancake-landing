import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isServiceConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

/** Delete a comment. Admin-only (valid admin cookie). The trigger decrements
 *  the idea's comment_count. See lib/auth/admin.ts. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isServiceConfigured()) {
    return NextResponse.json({ error: "Roadmap backend is not configured." }, { status: 503 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Roadmap backend is not configured." }, { status: 503 });
  }

  const { error } = await admin.from("comments").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: "Could not delete the comment." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
