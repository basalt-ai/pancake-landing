"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

/** Clears the admin session cookie, then refreshes the server component. */
export function AdminSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    await fetch("/api/roadmap/logout", { method: "POST" }).catch(() => {});
    router.refresh();
    setBusy(false);
  }

  return (
    <Button type="button" variant="outline" onClick={signOut} disabled={busy}>
      {busy ? "Signing out…" : "Sign out"}
    </Button>
  );
}
