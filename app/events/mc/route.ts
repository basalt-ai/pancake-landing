import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type MetaEventName = "ViewContent" | "Lead" | "Contact" | "Schedule";

const META_PIXEL_ID = process.env.META_PIXEL_ID ?? "1668160384441545";
const META_ACCESS_TOKEN = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;
const META_GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION ?? "v25.0";
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE?.trim();

const ALLOWED_EVENT_NAMES = new Set<MetaEventName>([
  "ViewContent",
  "Lead",
  "Contact",
  "Schedule",
]);

const ALLOWED_CUSTOM_DATA_KEYS = new Set([
  "content_category",
  "content_name",
  "conversion_name",
  "destination_url",
  "link_text",
  "page_path",
  "page_title",
  "trigger",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function cleanUrl(value: unknown) {
  const rawUrl = cleanString(value, 2048);
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function cleanCustomData(value: unknown) {
  if (!isRecord(value)) return undefined;

  const customData: Record<string, string | number | boolean> = {};

  for (const [key, rawValue] of Object.entries(value)) {
    if (!ALLOWED_CUSTOM_DATA_KEYS.has(key)) continue;

    if (typeof rawValue === "string") {
      const maxLength = key === "destination_url" ? 2048 : 500;
      const cleanedValue = cleanString(rawValue, maxLength);
      if (cleanedValue) customData[key] = cleanedValue;
    }

    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      customData[key] = rawValue;
    }

    if (typeof rawValue === "boolean") {
      customData[key] = rawValue;
    }
  }

  return Object.keys(customData).length > 0 ? customData : undefined;
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function clientIpAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    cleanString(firstForwardedIp, 120) ||
    cleanString(request.headers.get("x-real-ip"), 120) ||
    undefined
  );
}

function fbcFromRequest(request: NextRequest, eventSourceUrl?: string) {
  const fbcCookie = cleanString(request.cookies.get("_fbc")?.value, 500);
  if (fbcCookie) return fbcCookie;

  if (!eventSourceUrl) return undefined;

  try {
    const fbclid = new URL(eventSourceUrl).searchParams.get("fbclid");
    if (!fbclid) return undefined;
    return `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid.slice(0, 500)}`;
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!isRecord(body)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventName = cleanString(body.event_name, 80);
  if (!eventName || !ALLOWED_EVENT_NAMES.has(eventName as MetaEventName)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventId = cleanString(body.event_id, 120);
  if (!eventId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventSourceUrl =
    cleanUrl(body.event_source_url) || cleanUrl(request.headers.get("referer"));

  if (!eventSourceUrl) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ ok: false, configured: false }, { status: 202 });
  }

  const userData: Record<string, string> = {};
  const clientIp = clientIpAddress(request);
  const clientUserAgent = cleanString(request.headers.get("user-agent"), 500);
  const fbp = cleanString(request.cookies.get("_fbp")?.value, 500);
  const fbc = fbcFromRequest(request, eventSourceUrl);

  if (clientIp) userData.client_ip_address = clientIp;
  if (clientUserAgent) userData.client_user_agent = clientUserAgent;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: cleanCustomData(body.custom_data),
      },
    ],
  };

  if (META_TEST_EVENT_CODE) {
    payload.test_event_code = META_TEST_EVENT_CODE;
  }

  const response = await fetch(
    `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(
      META_ACCESS_TOKEN,
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Meta Conversions API request failed", {
      status: response.status,
      body: responseBody,
    });

    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
