import { NextResponse } from "next/server";

import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const TABLE_ID = "tblaLf53RDQh6RXtT"; // "GTM Waitlist" in the Signups base
const HANDOFF_CHOICES = [
  "Outbound",
  "Content & social",
  "SEO & landing pages",
  "Ads",
  "Lead research",
  "CRM hygiene",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accept "acme.com" as well as a full URL; return null when it can't be one. */
function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Fire a Slack notification for a new signup. Best-effort: gated on an env var,
 * time-boxed, and fully swallowed on failure so it can never break a signup that
 * already succeeded in Airtable. No-op when SLACK_WAITLIST_WEBHOOK_URL is unset.
 */
async function notifySlack(fields: Record<string, unknown>) {
  const url = process.env.SLACK_WAITLIST_WEBHOOK_URL;
  if (!url) return;

  const line = (label: string, value: unknown) =>
    value ? `*${label}:* ${String(value)}` : null;
  const handoff = Array.isArray(fields["GTM to hand off"])
    ? (fields["GTM to hand off"] as string[]).join(", ")
    : "";
  const text = [
    line("Email", fields["Email"]),
    line("Company", fields["Company URL"]),
    line("What they do", fields["What they do"]),
    line("Wants to hand off", handoff),
    line("Source", fields["Source"]),
  ]
    .filter(Boolean)
    .join("\n");

  const payload = {
    // App Incoming Webhooks post to the channel they were created for (create
    // it against #signups). `channel` is honoured by legacy/bot-token webhooks
    // and harmlessly ignored by app webhooks — it documents the intended target.
    channel: "#signups",
    text: `New GTM waitlist signup: ${fields["Email"]}`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: "🥞 New GTM waitlist signup", emoji: true } },
      { type: "section", text: { type: "mrkdwn", text } },
    ],
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
      cache: "no-store",
    });
  } catch (err) {
    console.error("Slack waitlist notify failed:", err);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Landing-page waitlist signup. Open to anyone, guarded the same way as the
 * roadmap board:
 *   1. a honeypot field (`website`) — bots fill it, humans never see it
 *   2. a per-IP rate limit (5 / 10 min)
 *   3. server-side validation, and a choice allow-list for the multi-select
 * Writes land in Airtable with the token that already powers the roadmap.
 */
export async function POST(request: Request) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) {
    return NextResponse.json({ error: "Waitlist backend is not configured." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: pretend success so bots don't learn they were caught.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`waitlist:create:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You're sending those a bit fast. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const companyUrl = typeof body.companyUrl === "string" ? normalizeUrl(body.companyUrl) : null;
  const about = typeof body.about === "string" ? body.about.trim().slice(0, 2000) : "";
  const handoff = Array.isArray(body.handoff)
    ? body.handoff.filter((v): v is string => typeof v === "string" && HANDOFF_CHOICES.includes(v))
    : [];
  const source = typeof body.source === "string" ? body.source.trim().slice(0, 80) : "landing-v2";

  const fields: Record<string, unknown> = {
    Email: email,
    Status: "New",
    Source: source || "landing-v2",
    "Submitted At": new Date().toISOString(),
  };
  if (companyUrl) fields["Company URL"] = companyUrl;
  if (about) fields["What they do"] = about;
  if (handoff.length) fields["GTM to hand off"] = handoff;

  const res = await fetch(`https://api.airtable.com/v0/${baseId.trim()}/${TABLE_ID}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: [{ fields }], typecast: true }),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Waitlist write failed:", res.status, await res.text());
    return NextResponse.json({ error: "We couldn't save that. Try again in a moment." }, { status: 502 });
  }

  // Notify Slack (best-effort — the row is already saved, so a Slack hiccup
  // must not turn a good signup into an error).
  await notifySlack(fields);

  return NextResponse.json({ ok: true }, { status: 201 });
}
