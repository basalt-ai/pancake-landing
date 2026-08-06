"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Input } from "@/components/ui/Input";

import { FxPill } from "./FxPill";

/**
 * The report offer as a form — domain in, /ai-gtm-report out. Hero only
 * (founder call 2026-08-06: the report is not mentioned again below the
 * hero, and the pink primary belongs to Join waitlist — the report button
 * rides the white outline style). Validates before navigating and shows a
 * pending state on the button.
 */
export function ReportPillForm() {
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
      <FxPill
        type="submit"
        size="lg"
        variant="outline"
        disabled={pending}
        aria-busy={pending || undefined}
      >
        {pending ? "Opening…" : "Get my AI GTM report"}
      </FxPill>
    </form>
  );
}
