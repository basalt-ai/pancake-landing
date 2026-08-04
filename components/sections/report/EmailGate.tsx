"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The PLG gate: the scan ran free, the detail unlocks on this screen the
 * moment a real email lands. After unlock it morphs into the app CTA.
 */
export function EmailGate({
  unlocked,
  toWin,
  onUnlock,
}: {
  unlocked: boolean;
  toWin: number;
  onUnlock: (email: string) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (unlocked) {
    return (
      <Card variant="brand" className="rpt-card rpt-gate rpt-gate-done">
        <header className="rpt-card-head">
          <h2>Pancake fixes this for you</h2>
        </header>
        <p>
          Unlocked. All yours. The same agents that ran this scan can run the fixes: your
          llms.txt, the content behind the searches you{"’"}re missing, the publications
          your ICP actually reads. You set the spend cap, they do the work.
        </p>
        <Button size="lg" onClick={() => window.open("https://app.getpancake.ai", "_blank")}>
          Open Pancake
        </Button>
      </Card>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    const result = await onUnlock(email);
    setBusy(false);
    if (!result.ok) setError(result.message ?? "That didn't save. Try again.");
  };

  return (
    <Card className="rpt-card rpt-gate">
      <header className="rpt-card-head">
        <h2>The line-by-line is ready.</h2>
      </header>
      <p>
        You watched the scan run. The detail is written: which prompts cite you, who gets
        picked instead, the {toWin > 0 ? toWin : ""} searches to win. Drop your email and it
        unlocks right here, on this screen.
      </p>
      <form className="rpt-gate-form" onSubmit={submit}>
        <Input
          type="email"
          size="lg"
          placeholder="you@company.com"
          value={email}
          error={!!error}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Your work email"
        />
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Unlocking…" : "Unlock my report"}
        </Button>
      </form>
      {error && <p className="rpt-gate-error">{error}</p>}
      <p className="rpt-gate-foot">Free. No spam, one report.</p>
    </Card>
  );
}
