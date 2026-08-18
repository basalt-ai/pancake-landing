import { createHash, createHmac } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { WAITLIST_CTA_IDS } from "@/lib/analytics/data-layer";
import { sendMetaWaitlistLead } from "@/lib/analytics/meta-capi";
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
const SOURCE_CHOICES = new Set(["landing-v2", "gtm-report"]);
const AIRTABLE_TIMEOUT_MS = 5000;
const PRODUCTION_HOSTS = new Set(["getpancake.ai", "www.getpancake.ai"]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type AirtableRecord = { id?: unknown };
type AirtableListResponse = { records?: AirtableRecord[] };
type AirtableUpsertResponse = {
  records?: AirtableRecord[];
  createdRecords?: unknown[];
  updatedRecords?: unknown[];
};

type AttributionCookie = {
  aid?: unknown;
  t?: Array<{ ts?: unknown; k?: { fbclid?: unknown } }>;
};

const WAITLIST_CTA_ID_SET = new Set<string>(WAITLIST_CTA_IDS);

function configuredHostname(value: string | undefined) {
  const candidate = value?.trim();
  if (!candidate) return undefined;

  try {
    return new URL(candidate.includes("://") ? candidate : `https://${candidate}`).hostname;
  } catch {
    return undefined;
  }
}

const VERCEL_HOSTS = new Set(
  [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .map(configuredHostname)
    .filter((hostname): hostname is string => Boolean(hostname)),
);

function hasApprovedOrigin(request: Request) {
  const rawOrigin = request.headers.get("origin")?.trim();
  const rawHost = request.headers.get("host")?.trim().toLowerCase();
  if (!rawOrigin || !rawHost || rawHost.includes(",")) return false;

  try {
    const origin = new URL(rawOrigin);
    const hostname = origin.hostname.toLowerCase();
    const local = process.env.NODE_ENV !== "production" && LOCAL_HOSTS.has(hostname);
    const approved = PRODUCTION_HOSTS.has(hostname) || VERCEL_HOSTS.has(hostname) || local;

    return (
      approved &&
      !origin.username &&
      !origin.password &&
      origin.host.toLowerCase() === rawHost &&
      (origin.protocol === "https:" || (local && origin.protocol === "http:"))
    );
  } catch {
    return false;
  }
}

function approvedRequestHostname(request: Request) {
  try {
    return new URL(request.headers.get("origin") ?? "").hostname.toLowerCase();
  } catch {
    return "";
  }
}

async function airtableFetch(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AIRTABLE_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

function recordId(value: unknown) {
  if (typeof value !== "string" || !/^rec[a-zA-Z0-9]+$/.test(value)) return null;
  return value.slice(0, 40);
}

function leadConversionEventId(airtableRecordId: string) {
  const secret = process.env.ANALYTICS_EVENT_ID_SECRET?.trim();
  const digest = secret && secret.length >= 32
    ? createHmac("sha256", secret).update(`waitlist:${airtableRecordId}`).digest("hex")
    : createHash("sha256").update(`pancake-waitlist:${airtableRecordId}`).digest("hex");
  return `lead.${digest}`;
}

function readAttributionCookie(request: NextRequest) {
  const rawValue = request.cookies.get("pancake_attribution")?.value;
  if (!rawValue) return {};

  try {
    let parsed: AttributionCookie;
    try {
      parsed = JSON.parse(rawValue) as AttributionCookie;
    } catch {
      parsed = JSON.parse(decodeURIComponent(rawValue)) as AttributionCookie;
    }
    const attributionId =
      typeof parsed.aid === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(parsed.aid)
        ? parsed.aid
        : undefined;

    let fbc: string | undefined;
    if (Array.isArray(parsed.t)) {
      const fbTouch = [...parsed.t].reverse().find((touch) =>
        typeof touch?.k?.fbclid === "string" &&
        typeof touch.ts === "number" &&
        Number.isFinite(touch.ts),
      );
      if (fbTouch && typeof fbTouch.k?.fbclid === "string" && typeof fbTouch.ts === "number") {
        const clickId = fbTouch.k.fbclid.trim().slice(0, 500);
        if (clickId) fbc = `fb.1.${Math.trunc(fbTouch.ts * 1000)}.${clickId}`;
      }
    }

    return { attributionId, fbc };
  } catch {
    return {};
  }
}

async function findExistingLead(token: string, baseId: string, email: string) {
  const query = new URLSearchParams({
    maxRecords: "1",
    filterByFormula: `LOWER({Email}) = ${JSON.stringify(email)}`,
  });
  query.append("fields[]", "Email");

  const response = await airtableFetch(
    `https://api.airtable.com/v0/${baseId}/${TABLE_ID}?${query.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    console.error("Waitlist lookup failed:", response.status, await response.text());
    throw new Error("airtable_lookup_failed");
  }

  const body = (await response.json().catch(() => null)) as AirtableListResponse | null;
  return recordId(body?.records?.[0]?.id);
}

/** Accept "acme.com" as well as a full URL; return null when it can't be one. */
function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.username || url.password || !url.hostname.includes(".")) return null;
    return `${url.protocol}//${url.host}/`;
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
export async function POST(request: NextRequest) {
  if (!hasApprovedOrigin(request)) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID?.trim();
  if (!token || !baseId || !/^app[a-zA-Z0-9]{14}$/.test(baseId)) {
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
    return NextResponse.json(
      { ok: true, newly_created: false, conversion_event_id: null },
      { status: 201 },
    );
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`waitlist:create:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You're sending those a bit fast. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const companyUrl = typeof body.companyUrl === "string" ? normalizeUrl(body.companyUrl) : null;
  const about = typeof body.about === "string" ? body.about.trim().slice(0, 2000) : "";
  const handoff = Array.isArray(body.handoff)
    ? body.handoff.filter((v): v is string => typeof v === "string" && HANDOFF_CHOICES.includes(v))
    : [];
  const rawSource = typeof body.source === "string" ? body.source.trim() : "landing-v2";
  const source = SOURCE_CHOICES.has(rawSource) ? rawSource : "landing-v2";
  const rawCtaId = typeof body.ctaId === "string" ? body.ctaId.trim() : "";
  const ctaId = WAITLIST_CTA_ID_SET.has(rawCtaId) ? rawCtaId : undefined;

  let existingRecordId: string | null;
  try {
    existingRecordId = await findExistingLead(token, baseId, email);
  } catch {
    return NextResponse.json(
      { error: "We couldn't verify that signup. Try again in a moment." },
      { status: 502 },
    );
  }

  if (existingRecordId) {
    return NextResponse.json(
      { ok: true, newly_created: false, conversion_event_id: null },
      { status: 200 },
    );
  }

  const fields: Record<string, unknown> = {
    Email: email,
    Status: "New",
    Source: source || "landing-v2",
    "Submitted At": new Date().toISOString(),
  };
  if (companyUrl) fields["Company URL"] = companyUrl;
  if (about) fields["What they do"] = about;
  if (handoff.length) fields["GTM to hand off"] = handoff;

  let res: Response;
  try {
    res = await airtableFetch(`https://api.airtable.com/v0/${baseId}/${TABLE_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        performUpsert: { fieldsToMergeOn: ["Email"] },
        records: [{ fields }],
        typecast: true,
      }),
    });
  } catch (error) {
    console.error("Waitlist write failed before response:", error);
    return NextResponse.json(
      { error: "We couldn't save that. Try again in a moment." },
      { status: 502 },
    );
  }

  if (!res.ok) {
    console.error("Waitlist write failed:", res.status, await res.text());
    return NextResponse.json({ error: "We couldn't save that. Try again in a moment." }, { status: 502 });
  }

  const responseBody = (await res.json().catch(() => null)) as AirtableUpsertResponse | null;
  const createdRecordId = recordId(responseBody?.records?.[0]?.id);
  if (!createdRecordId) {
    console.error("Waitlist upsert succeeded without an Airtable record ID.");
    return NextResponse.json(
      { error: "We couldn't confirm that signup. Try again in a moment." },
      { status: 502 },
    );
  }

  const newlyCreated =
    responseBody?.createdRecords?.some((value) => recordId(value) === createdRecordId) === true;
  if (!newlyCreated) {
    return NextResponse.json(
      { ok: true, newly_created: false, conversion_event_id: null },
      { status: 200 },
    );
  }

  const conversionEventId = leadConversionEventId(createdRecordId);
  const attribution = readAttributionCookie(request);
  const metaDelivery =
    source === "landing-v2" && ctaId
      ? sendMetaWaitlistLead({
          eventId: conversionEventId,
          email,
          requestHostname: approvedRequestHostname(request),
          eventSourceUrl: request.headers.get("referer") ?? undefined,
          clientIp: getClientIp(request),
          clientUserAgent: request.headers.get("user-agent") ?? undefined,
          fbp: request.cookies.get("_fbp")?.value,
          fbc: request.cookies.get("_fbc")?.value ?? attribution.fbc,
          attributionId: attribution.attributionId,
          ctaId,
          handoffCount: handoff.length,
        })
      : Promise.resolve({ status: "disabled" as const, reason: "flag" as const });

  // Both side effects are best-effort and time-boxed. The row is authoritative,
  // so neither Slack nor an ad vendor can turn a saved signup into an error.
  await Promise.all([notifySlack(fields), metaDelivery]);

  return NextResponse.json(
    {
      ok: true,
      newly_created: true,
      conversion_event_id: conversionEventId,
    },
    { status: 201 },
  );
}
