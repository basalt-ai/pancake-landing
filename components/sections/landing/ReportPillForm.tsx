"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Input } from "@/components/ui/Input";

import { FxPill } from "./FxPill";

/**
 * The report offer as a form — domain in, /ai-gtm-report out. One component
 * so the hero and the closing CTA make the identical offer. Validates before
 * navigating (a bare word is not a domain), shows a pending state on the
 * button, and carries the one line of microcopy that explains the offer.
 * "Free · ready in one minute." is the report page's own promise — no
 * "no signup" claim: the full report unlocks with an email.
 */
export function ReportPillForm({ note }: { note?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [err, setErr] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const domain = url.trim();
    if (!/\S+\.\S{2,}/.test(domain)) {
      setErr(true);
      inputRef.current?.focus();
      return;
    }
    setPending(true);
    router.push(`/ai-gtm-report?url=${encodeURIComponent(domain)}`);
  };

  return (
    <div className="lv2-hero-report">
      <form className="lv2-hero-pill" onSubmit={submit} noValidate>
        <Input
          ref={inputRef}
          size="lg"
          placeholder="yourcompany.com"
          value={url}
          error={err}
          aria-invalid={err || undefined}
          aria-label="Your company's domain"
          onChange={(e) => {
            setUrl(e.target.value);
            if (err) setErr(false);
          }}
        />
        <FxPill type="submit" size="lg" disabled={pending} aria-busy={pending || undefined}>
          {pending ? "Opening…" : "Get my AI GTM report"}
        </FxPill>
      </form>
      {note ? <p className="lv2-hero-note">{note}</p> : null}
    </div>
  );
}
